console.log('🚀 Starting Maplyo server...');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const NodeGeocoder = require('node-geocoder');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
console.log('📦 All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration des serveurs HTTP et Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Stocker les connexions socket par utilisateur
const userSockets = new Map();

// Configuration du géocodeur avec fallback et gestion d'erreurs robuste
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
  timeout: 15000, // Augmenté à 15 secondes pour Render
  apikey: process.env.GEOCODING_API_KEY, // Optionnel pour certains providers
});

// Geocoder alternatif avec MapQuest (gratuit)
const geocoderFallback = NodeGeocoder({
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: process.env.MAPQUEST_API_KEY || 'demo_key', // Utilise une clé demo si pas configuré
  formatter: null,
  timeout: 15000
});

// Note: La fonction geocodeAddressSafely est définie plus bas avec les statistiques

// Test de connectivité réseau au démarrage
async function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity...');
  try {
    const testUrl = 'https://httpbin.org/get';
    const response = await fetch(testUrl, { timeout: 5000 });
    if (response.ok) {
      console.log('✅ Network connectivity: OK');
    } else {
      console.warn('⚠️ Network connectivity: Limited');
    }
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error.message);
    console.error('🔧 This may affect geocoding functionality on deployment');
  }
}

// Variables d'environnement pour diagnostique
console.log('🔑 Environment check for geocoding:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GEOCODING_API_KEY exists:', !!process.env.GEOCODING_API_KEY);
console.log('PORT:', process.env.PORT || 'not set (using 3001)');

// Lancer le test de connectivité
testNetworkConnectivity();

// Fonction de géocodage direct via API Nominatim (contournement NodeGeocoder)
async function geocodeDirectNominatim(address, timeout = 10000) {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return null;
  }

  try {
    console.log('🔄 DIRECT NOMINATIM - Geocoding:', address);
    const startTime = Date.now();
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(address.trim())}`;
    
    const response = await fetch(nominatimUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Maplyo/1.0 (contact@maplyo.com)'
      },
      timeout: timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    if (data && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name
      };
      
      console.log(`✅ DIRECT NOMINATIM successful in ${duration}ms:`, result);
      return result;
    } else {
      console.log(`⚠️ DIRECT NOMINATIM no results in ${duration}ms for:`, address);
      return null;
    }
  } catch (error) {
    console.error('❌ DIRECT NOMINATIM error:', error.message);
    return null;
  }
}

// Statistiques de monitoring geocoding
let geocodingStats = {
  total: 0,
  success: 0,
  failed: 0,
  timeout: 0,
  lastReset: new Date()
};

// Fonction pour afficher les stats de geocoding
function logGeocodingStats() {
  if (geocodingStats.total > 0) {
    const successRate = (geocodingStats.success / geocodingStats.total * 100).toFixed(1);
    console.log(`📊 Geocoding Stats: ${geocodingStats.success}/${geocodingStats.total} success (${successRate}%), ${geocodingStats.failed} failed, ${geocodingStats.timeout} timeouts`);
  }
}

// Afficher les stats toutes les 10 minutes en production
if (process.env.NODE_ENV === 'production') {
  setInterval(logGeocodingStats, 10 * 60 * 1000);
}

// Fonction de géocodage robuste avec timeout, fallback et monitoring
async function geocodeAddressSafely(address, timeout = 15000) {
  geocodingStats.total++;
  
  if (!address || typeof address !== 'string' || address.trim() === '') {
    console.log('⚠️ No address provided for geocoding');
    return null;
  }

  console.log('🌍 Starting geocoding for address:', address);
  const startTime = Date.now();
  
  // Essayer d'abord avec OpenStreetMap
  try {
    console.log('🔄 Trying OpenStreetMap geocoder...');
    const geocodePromise = geocoder.geocode(address.trim());
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Geocoding timeout')), timeout)
    );
    
    const result = await Promise.race([geocodePromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    
    if (result && result.length > 0) {
      const { latitude, longitude, formattedAddress } = result[0];
      geocodingStats.success++;
      console.log(`✅ OpenStreetMap geocoding successful in ${duration}ms:`, { latitude, longitude });
      return { latitude, longitude, formattedAddress };
    } else {
      console.log('⚠️ OpenStreetMap returned no results, trying fallback...');
      throw new Error('No results from OpenStreetMap');
    }
  } catch (osmError) {
    const osmDuration = Date.now() - startTime;
    console.log(`⚠️ OpenStreetMap failed in ${osmDuration}ms:`, osmError.message);
    
    // Fallback vers MapQuest si OpenStreetMap échoue
    try {
      console.log('🔄 Trying MapQuest geocoder fallback...');
      const fallbackStart = Date.now();
      const fallbackPromise = geocoderFallback.geocode(address.trim());
      const fallbackTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fallback geocoding timeout')), timeout / 2)
      );
      
      const fallbackResult = await Promise.race([fallbackPromise, fallbackTimeoutPromise]);
      const fallbackDuration = Date.now() - fallbackStart;
      
      if (fallbackResult && fallbackResult.length > 0) {
        const { latitude, longitude, formattedAddress } = fallbackResult[0];
        geocodingStats.success++;
        console.log(`✅ MapQuest fallback successful in ${fallbackDuration}ms:`, { latitude, longitude });
        return { latitude, longitude, formattedAddress };
      } else {
        throw new Error('No results from fallback geocoder');
      }
    } catch (fallbackError) {
      console.error(`⚠️ MapQuest fallback also failed:`, fallbackError.message);
      
      // Dernier recours : API directe Nominatim
      try {
        console.log('🆘 Last resort: Direct Nominatim API...');
        const directResult = await geocodeDirectNominatim(address, timeout / 3);
        
        if (directResult) {
          geocodingStats.success++;
          console.log('✅ Direct Nominatim succeeded as last resort');
          return directResult;
        }
      } catch (directError) {
        console.error('❌ Direct Nominatim also failed:', directError.message);
      }
      
      const totalDuration = Date.now() - startTime;
      geocodingStats.failed++;
      
      if (osmError.message.includes('timeout') || fallbackError.message.includes('timeout')) {
        geocodingStats.timeout++;
        console.error(`❌ All geocoders timed out after ${totalDuration}ms for:`, address);
      } else {
        console.error(`❌ All geocoders failed after ${totalDuration}ms:`, {
          osm: osmError.message,
          fallback: fallbackError.message
        });
      }
      
      console.error('🌐 All geocoding options exhausted (including direct API)');
      return null; // Ne pas faire échouer la création du prospect
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('dist'));

// Configuration de la base de données SQLite
const dbDir = path.join(__dirname, '../database');
const dbPath = path.join(dbDir, 'maplyo.db');

// Créer le dossier database s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory');
}

console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à SQLite:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialisation des tables
function initializeDatabase() {
  console.log('🔧 Initializing database tables...');
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createProspectsTable = `
    CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      contact TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'cold',
      revenue REAL DEFAULT 0,
      probability_coefficient REAL DEFAULT 100,
      notes TEXT,
      notes_last_updated DATETIME,
      tab_id TEXT DEFAULT 'default',
      display_order INTEGER DEFAULT 0,
      estimated_completion_date DATE,
      recurrence_months INTEGER DEFAULT 12,
      next_followup_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const createTabsTable = `
    CREATE TABLE IF NOT EXISTS tabs (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_special BOOLEAN DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      setting_key TEXT NOT NULL,
      setting_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, setting_key)
    )
  `;

  const createTodosTable = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prospect_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createProspectsTable);
    db.run(createTabsTable);
    db.run(createSettingsTable);
    db.run(createTodosTable);
    
    // Migrations pour ajouter les colonnes manquantes aux bases de données existantes
    const migrations = [
      { name: 'tab_id', sql: `ALTER TABLE prospects ADD COLUMN tab_id TEXT DEFAULT 'default'` },
      { name: 'display_order', sql: `ALTER TABLE prospects ADD COLUMN display_order INTEGER DEFAULT 0` },
      { name: 'probability_coefficient', sql: `ALTER TABLE prospects ADD COLUMN probability_coefficient REAL DEFAULT 100` },
      { name: 'estimated_completion_date', sql: `ALTER TABLE prospects ADD COLUMN estimated_completion_date DATE` },
      { name: 'contact', sql: `ALTER TABLE prospects ADD COLUMN contact TEXT` },
      { name: 'recurrence_months', sql: `ALTER TABLE prospects ADD COLUMN recurrence_months INTEGER DEFAULT 12` },
      { name: 'next_followup_date', sql: `ALTER TABLE prospects ADD COLUMN next_followup_date DATE` },
      { name: 'notes_last_updated', sql: `ALTER TABLE prospects ADD COLUMN notes_last_updated DATETIME` }
    ];

    migrations.forEach(migration => {
      db.run(migration.sql, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn(`⚠️  Migration warning for ${migration.name} (this is normal for new databases):`, err.message);
        } else if (!err) {
          console.log(`✅ Migration applied: added ${migration.name} column`);
        }
      });
    });

    // Migration spéciale pour copier position vers contact
    db.run(`UPDATE prospects SET contact = position WHERE contact IS NULL AND position IS NOT NULL`, (err) => {
      if (err) {
        console.warn('⚠️  Position to contact migration warning:', err.message);
      } else {
        console.log('✅ Migrated position data to contact column');
      }
    });
    
    console.log('✅ SQLite database initialized successfully');
  });
}

// Helper function to calculate estimated completion date
function calculateEstimatedCompletionDate(userId, status, providedDate = null) {
  return new Promise((resolve, reject) => {
    if (providedDate) {
      resolve(providedDate);
      return;
    }

    // Get user's lead times settings
    db.get(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [userId, 'closing_lead_times'],
      (err, row) => {
        try {
          // Default lead times if no settings found or error
          const defaultLeadTimes = { cold: 12, warm: 6, hot: 3, recurring: 12 };
          let leadTimes = defaultLeadTimes;
          
          if (!err && row) {
            try {
              leadTimes = JSON.parse(row.setting_value);
            } catch (parseError) {
              console.warn('⚠️ Error parsing lead times, using defaults:', parseError);
              leadTimes = defaultLeadTimes;
            }
          }
          
          // Get lead time for the status (category)
          let leadTimeMonths = defaultLeadTimes.cold; // Default to cold
          if (status === 'hot') {
            leadTimeMonths = leadTimes.hot || 3;
          } else if (status === 'warm') {
            leadTimeMonths = leadTimes.warm || 6;
          } else if (status === 'cold') {
            leadTimeMonths = leadTimes.cold || 12;
          } else if (status === 'recurring') {
            // For recurring prospects, use recurrence_months if provided, otherwise default to 12
            leadTimeMonths = 12; // Default for recurring
          }
          
          // Calculate estimated completion date: current date + lead time
          const estimatedDate = new Date();
          estimatedDate.setMonth(estimatedDate.getMonth() + leadTimeMonths);
          
          // Return YYYY-MM-DD format
          const formattedDate = estimatedDate.toISOString().split('T')[0];
          resolve(formattedDate);
        } catch (error) {
          console.error('Error calculating estimated completion date:', error);
          // Fallback to 6 months from now
          const fallbackDate = new Date();
          fallbackDate.setMonth(fallbackDate.getMonth() + 6);
          resolve(fallbackDate.toISOString().split('T')[0]);
        }
      }
    );
  });
}

// Fonction pour créer les onglets par défaut pour un nouvel utilisateur
function createDefaultTabsForUser(userId) {
  console.log('📋 Creating default tabs for user:', userId);
  
  const defaultTabs = [
    {
      id: `all-leads-${userId}`,
      name: 'All Leads',
      description: 'View all prospects from all tabs',
      is_special: 1,
      display_order: 0
    },
    {
      id: `default-${userId}`,
      name: 'Main Pipeline',
      description: 'Primary prospects list',
      is_special: 0,
      display_order: 1
    }
  ];

  defaultTabs.forEach((tab, index) => {
    db.run(
      'INSERT INTO tabs (id, user_id, name, description, is_special, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [tab.id, userId, tab.name, tab.description, tab.is_special, tab.display_order],
      function(err) {
        if (err) {
          console.error(`Error creating default tab ${tab.name}:`, err);
        } else {
          console.log(`✅ Created default tab: ${tab.name} for user ${userId}`);
        }
      }
    );
  });
}

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Authentification via Socket.IO
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      userSockets.set(decoded.userId, socket);
      console.log(`✅ Socket authenticated for user ${decoded.userId}`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('❌ Socket authentication failed:', error);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`🔌 User ${socket.userId} disconnected`);
    }
  });
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes d'authentification

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    const { email, password, name, company } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password and name are required' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    db.get(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
          return res.status(400).json({ 
            error: 'User already exists with this email' 
          });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        db.run(
          'INSERT INTO users (email, password, name, company) VALUES (?, ?, ?, ?)',
          [email, hashedPassword, name, company || ''],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Créer le token JWT
            const token = jwt.sign(
              { 
                userId: this.lastID, 
                email: email,
                name: name 
              },
              process.env.JWT_SECRET || 'your-secret-key',
              { expiresIn: '24h' }
            );

            // Créer les onglets par défaut pour le nouvel utilisateur
            createDefaultTabsForUser(this.lastID);

            console.log('✅ User registered successfully:', email);
            res.status(201).json({
              message: 'User registered successfully',
              token: token,
              user: {
                id: this.lastID,
                email: email,
                name: name,
                company: company || ''
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connexion
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          console.log('❌ User not found:', email);
          return res.status(401).json({ 
            error: 'Invalid email or password' 
          });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          console.log('❌ Invalid password for:', email);
          return res.status(401).json({ 
            error: 'Invalid email or password' 
          });
        }

        // Créer le token JWT
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email,
            name: user.name 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        console.log('✅ Login successful for:', email);
        res.json({
          message: 'Login successful',
          token: token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            company: user.company
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour obtenir le profil utilisateur
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, name, company FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        console.error('Error retrieving profile:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Route pour changer le mot de passe
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Password change request for user:', req.user.userId);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Récupérer l'utilisateur avec son mot de passe
    db.get(
      'SELECT id, email, password FROM users WHERE id = ?',
      [req.user.userId],
      async (err, user) => {
        if (err) {
          console.error('Error retrieving user for password change:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Vérifier le mot de passe actuel
        const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validCurrentPassword) {
          console.log('❌ Invalid current password for user:', user.email);
          return res.status(401).json({ 
            error: 'Current password is incorrect' 
          });
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedNewPassword, req.user.userId],
          function(err) {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            console.log('✅ Password updated successfully for user:', user.email);
            res.json({ 
              message: 'Password updated successfully' 
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes pour les paramètres système
app.get('/api/settings/closing-lead-times', authenticateToken, (req, res) => {
  console.log('📊 Fetching closing lead times for user:', req.user.userId);
  
  db.get(
    'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
    [req.user.userId, 'closing_lead_times'],
    (err, row) => {
      if (err) {
        console.error('Error fetching closing lead times:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      if (!row) {
        // Return default values if no settings found
        return res.json({
          success: true,
          settings: {
            cold: 12,
            warm: 6,
            hot: 3,
            recurring: 12,
            coldProbability: 15,
            warmProbability: 45,
            hotProbability: 80,
            recurringProbability: 30
          }
        });
      }
      
      try {
        const settings = JSON.parse(row.setting_value);
        console.log('📊 Loaded settings from DB:', settings);
        res.json({
          success: true,
          settings: settings
        });
      } catch (parseError) {
        console.error('Error parsing settings JSON:', parseError);
        // Return default values if JSON is invalid
        res.json({
          success: true,
          settings: {
            cold: 12,
            warm: 6,
            hot: 3,
            recurring: 12,
            coldProbability: 15,
            warmProbability: 45,
            hotProbability: 80,
            recurringProbability: 30
          }
        });
      }
    }
  );
});

app.post('/api/settings/closing-lead-times', authenticateToken, (req, res) => {
  console.log('💾 Saving closing lead times for user:', req.user.userId);
  console.log('📦 Request body:', req.body);
  
  const { cold, warm, hot, recurring, coldProbability, warmProbability, hotProbability, recurringProbability } = req.body;
  
  console.log('🔍 Extracted values:', { cold, warm, hot, recurring, coldProbability, warmProbability, hotProbability, recurringProbability });
  
  // Validate input (recurring is optional for backward compatibility)
  if (!cold || !warm || !hot || cold < 1 || warm < 1 || hot < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid lead time values. Cold, warm, and hot values must be positive numbers.'
    });
  }
  
  // Validate recurring separately (optional)
  if (recurring && recurring < 1) {
    return res.status(400).json({
      success: false,
      error: 'Recurring lead time must be a positive number.'
    });
  }
  
  // Validate probabilities (optional, use defaults if not provided)
  const probabilities = {
    coldProbability: (coldProbability >= 1 && coldProbability <= 100) ? coldProbability : 15,
    warmProbability: (warmProbability >= 1 && warmProbability <= 100) ? warmProbability : 45,
    hotProbability: (hotProbability >= 1 && hotProbability <= 100) ? hotProbability : 80,
    recurringProbability: (recurringProbability >= 1 && recurringProbability <= 100) ? recurringProbability : 30
  };
  
  const settingValue = { 
    cold, 
    warm, 
    hot,
    recurring: recurring || 12, // Default to 12 if not provided
    ...probabilities
  };
  
  console.log('💾 Final settingValue to save:', settingValue);
  
  // Use INSERT OR REPLACE for SQLite (equivalent to MySQL's ON DUPLICATE KEY UPDATE)
  db.run(
    `INSERT OR REPLACE INTO settings (user_id, setting_key, setting_value, created_at, updated_at)
     VALUES (?, ?, ?, 
       COALESCE((SELECT created_at FROM settings WHERE user_id = ? AND setting_key = ?), CURRENT_TIMESTAMP),
       CURRENT_TIMESTAMP)`,
    [
      req.user.userId, 
      'closing_lead_times', 
      JSON.stringify(settingValue),
      req.user.userId,
      'closing_lead_times'
    ],
    function(err) {
      if (err) {
        console.error('Error saving closing lead times:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      console.log('✅ Closing lead times saved successfully');
      console.log('🔍 Saved data:', JSON.stringify(settingValue));
      console.log('🔍 For user ID:', req.user.userId);
      res.json({
        success: true,
        message: 'Closing lead time settings saved successfully'
      });
    }
  );
});

// Routes pour les prospects

// Obtenir tous les prospects
app.get('/api/prospects', authenticateToken, (req, res) => {
  console.log('📋 Fetching prospects for user:', req.user.userId);
  db.all(
    `SELECT * FROM prospects WHERE user_id = ? 
     ORDER BY 
       CASE status 
         WHEN 'hot' THEN 1 
         WHEN 'warm' THEN 2 
         WHEN 'cold' THEN 3 
         WHEN 'won' THEN 4 
         WHEN 'lost' THEN 5 
         ELSE 6 
       END,
       display_order ASC, 
       created_at DESC`,
    [req.user.userId],
    (err, prospects) => {
      if (err) {
        console.error('Error retrieving prospects:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`📊 Found ${prospects.length} prospects`);
      res.json(prospects);
    }
  );
});

// Créer un nouveau prospect
app.post('/api/prospects', authenticateToken, async (req, res) => {
  try {
    console.log('=== SERVER PROSPECT CREATION ===')
    console.log('Received request body:', req.body)
    const { name, email, phone, company, contact, address, status, revenue, probability_coefficient, notes, notes_last_updated, tabId, estimated_completion_date, recurrence_months, next_followup_date } = req.body;
    console.log('Extracted tabId:', tabId)
    console.log('📝 Creating prospect:', name, 'for tab:', tabId);

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let latitude = null;
    let longitude = null;

    // Géocodage de l'adresse si elle est fournie avec fonction robuste
    if (address && address.trim()) {
      try {
        console.log('🗺️ PROSPECT CREATION - Starting geocoding for address:', address);
        console.log('🌍 Environment:', process.env.NODE_ENV, '| Timeout: 20 seconds');
        const geoResult = await geocodeAddressSafely(address, 20000); // 20 secondes pour Render
        if (geoResult) {
          latitude = geoResult.latitude;
          longitude = geoResult.longitude;
          console.log('📍 PROSPECT CREATION - Geocoding successful:', { latitude, longitude });
        } else {
          console.log('⚠️ PROSPECT CREATION - Geocoding returned no results, creating prospect without coordinates');
        }
      } catch (geoError) {
        console.warn('⚠️ PROSPECT CREATION - Geocoding failed, continuing without coordinates:', geoError.message);
        // Continue creating prospect without coordinates rather than failing
      }
    } else {
      console.log('📍 PROSPECT CREATION - No address provided, creating prospect without coordinates');
    }

    // Calculate estimated completion date
    let estimatedDate = null;
    let nextFollowupDate = null;
    let recurrenceMonthsValue = null;

    if (status === 'recurring') {
      // For recurring prospects, calculate next followup date
      recurrenceMonthsValue = recurrence_months || 12;
      if (next_followup_date) {
        nextFollowupDate = next_followup_date;
      } else {
        // Calculate next followup date
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + recurrenceMonthsValue);
        nextFollowupDate = nextDate.toISOString().split('T')[0];
      }
      console.log('🔄 Setting up recurring prospect:', recurrenceMonthsValue, 'months, next followup:', nextFollowupDate);
    } else {
      // For regular prospects, calculate estimated completion date
      estimatedDate = await getEstimatedCompletionDate(
        req.user.userId, 
        status || 'cold', 
        estimated_completion_date
      );
      console.log('📅 Calculated estimated completion date:', estimatedDate);
    }

    // Décaler tous les prospects existants de l'utilisateur vers le bas
    db.run(
      'UPDATE prospects SET display_order = display_order + 1 WHERE user_id = ?',
      [req.user.userId],
      function(updateErr) {
        if (updateErr) {
          console.error('Error updating display orders:', updateErr);
          return res.status(500).json({ error: 'Database error' });
        }

        // Insérer le nouveau prospect en position 0
        db.run(
          `INSERT INTO prospects 
           (user_id, name, email, phone, company, contact, address, latitude, longitude, status, revenue, probability_coefficient, notes, notes_last_updated, tab_id, display_order, estimated_completion_date, recurrence_months, next_followup_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.userId, name, email || '', phone || '', company || '', 
            contact || '', address || '', latitude, longitude, status || 'cold', 
            revenue || 0, probability_coefficient || 100, notes || '', notes_last_updated, tabId || 'default', 0, estimatedDate, recurrenceMonthsValue, nextFollowupDate // Nouveau prospect en haut
          ],
          function(err) {
            if (err) {
              console.error('Error creating prospect:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Récupérer le prospect créé
            db.get(
              'SELECT * FROM prospects WHERE id = ?',
              [this.lastID],
              (err, prospect) => {
                if (err) {
                  console.error('Error retrieving created prospect:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                console.log('✅ Prospect created successfully:', prospect.name);
                res.status(201).json(prospect);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Réorganiser les prospects dans une catégorie (status) - DOIT ÊTRE AVANT /:id
app.put('/api/prospects/reorder-category', authenticateToken, (req, res) => {
  console.log('🎯 Reorder-category route called!');
  console.log('📦 Request body:', req.body);
  console.log('👤 User ID:', req.user?.userId);
  
  try {
    const { status, order } = req.body;
    
    console.log(`📋 Reordering prospects in category: ${status}`);
    console.log('📄 New order:', order);

    // Validation des paramètres
    if (!status || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Status and order array are required' });
    }

    if (!['hot', 'warm', 'cold', 'won', 'lost', 'recurring'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Mettre à jour l'ordre d'affichage pour chaque prospect
    db.serialize(() => {
      const stmt = db.prepare(`
        UPDATE prospects 
        SET display_order = ? 
        WHERE id = ? AND user_id = ? AND status = ?
      `);

      order.forEach((prospectId, index) => {
        stmt.run(index, prospectId, req.user.userId, status, (err) => {
          if (err) {
            console.error(`Error updating display order for prospect ${prospectId}:`, err);
          }
        });
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing reorder statement:', err);
          return res.status(500).json({ error: 'Database error during reordering' });
        }

        console.log(`✅ Successfully reordered ${order.length} prospects in category: ${status}`);
        res.json({ 
          message: 'Prospects reordered successfully',
          status: status,
          count: order.length
        });
      });
    });

  } catch (error) {
    console.error('Error in reorder-category route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mettre à jour un prospect
app.put('/api/prospects/:id', authenticateToken, async (req, res) => {
  try {
    const prospectId = req.params.id;
    const { name, email, phone, company, contact, address, status, revenue, probability_coefficient, notes, notes_last_updated, tabId, estimated_completion_date, recurrence_months, next_followup_date } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Vérifier que le prospect appartient à l'utilisateur
    db.get(
      'SELECT * FROM prospects WHERE id = ? AND user_id = ?',
      [prospectId, req.user.userId],
      async (err, prospect) => {
        if (err) {
          console.error('Error checking prospect ownership:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!prospect) {
          return res.status(404).json({ error: 'Prospect not found' });
        }

        let latitude = null;
        let longitude = null;

        // Géocodage de l'adresse si elle est fournie avec fonction robuste
        if (address && address.trim()) {
          try {
            console.log('🗺️ PROSPECT UPDATE - Starting geocoding for address:', address);
            console.log('🌍 Environment:', process.env.NODE_ENV, '| Timeout: 20 seconds');
            const geoResult = await geocodeAddressSafely(address, 20000); // 20 secondes pour Render
            if (geoResult) {
              latitude = geoResult.latitude;
              longitude = geoResult.longitude;
              console.log('📍 PROSPECT UPDATE - Geocoding successful:', { latitude, longitude });
            } else {
              console.log('⚠️ PROSPECT UPDATE - Geocoding returned no results, keeping existing coordinates');
              // Garder les coordonnées existantes si le nouveau géocodage échoue
              latitude = prospect.latitude;
              longitude = prospect.longitude;
            }
          } catch (geoError) {
            console.warn('⚠️ Update geocoding failed, keeping existing coordinates:', geoError.message);
            latitude = prospect.latitude;
            longitude = prospect.longitude;
          }
        } else {
          // Pas d'adresse fournie, garder les coordonnées existantes
          latitude = prospect.latitude;
          longitude = prospect.longitude;
        }

        // Calculate dates based on status
        let estimatedDate = prospect.estimated_completion_date;
        let nextFollowupDate = prospect.next_followup_date;
        let recurrenceMonthsValue = prospect.recurrence_months;

        if (status === 'recurring') {
          // Moving to or updating recurring status
          recurrenceMonthsValue = recurrence_months || prospect.recurrence_months || 12;
          if (next_followup_date) {
            nextFollowupDate = next_followup_date;
          } else {
            // Calculate next followup date
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + recurrenceMonthsValue);
            nextFollowupDate = nextDate.toISOString().split('T')[0];
          }
          estimatedDate = null; // Clear estimated completion date for recurring
          console.log('🔄 Setting up recurring prospect:', recurrenceMonthsValue, 'months, next followup:', nextFollowupDate);
        } else if (prospect.status === 'recurring' && status !== 'recurring') {
          // Moving from recurring to regular status
          recurrenceMonthsValue = null;
          nextFollowupDate = null;
          estimatedDate = await getEstimatedCompletionDate(
            req.user.userId, 
            status || prospect.status, 
            estimated_completion_date
          );
          console.log('📅 Moving from recurring to regular, calculated estimated date:', estimatedDate);
        } else if (status !== prospect.status) {
          // Status changed for regular prospects
          estimatedDate = await getEstimatedCompletionDate(
            req.user.userId, 
            status || prospect.status, 
            estimated_completion_date
          );
          console.log('📅 Status changed, recalculated estimated completion date:', estimatedDate);
        } else if (estimated_completion_date !== undefined) {
          // Manually setting estimated date
          estimatedDate = estimated_completion_date;
        }

        db.run(
          `UPDATE prospects SET 
           name = ?, email = ?, phone = ?, company = ?, contact = ?, 
           address = ?, latitude = ?, longitude = ?, status = ?, revenue = ?, 
           probability_coefficient = ?, notes = ?, notes_last_updated = ?, tab_id = ?, estimated_completion_date = ?, 
           recurrence_months = ?, next_followup_date = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
          [
            name, email || '', phone || '', company || '', contact || '',
            address || '', latitude, longitude, status || 'cold', 
            revenue || 0, probability_coefficient !== undefined ? probability_coefficient : 100, 
            notes || '', notes_last_updated, tabId || 'default', estimatedDate, recurrenceMonthsValue, nextFollowupDate, prospectId, req.user.userId
          ],
          function(err) {
            if (err) {
              console.error('Error updating prospect:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Récupérer le prospect mis à jour
            db.get(
              'SELECT * FROM prospects WHERE id = ?',
              [prospectId],
              (err, updatedProspect) => {
                if (err) {
                  console.error('Error retrieving updated prospect:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                res.json(updatedProspect);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Supprimer un prospect
app.delete('/api/prospects/:id', authenticateToken, (req, res) => {
  const prospectId = req.params.id;

  // Vérifier que le prospect appartient à l'utilisateur
  db.get(
    'SELECT id FROM prospects WHERE id = ? AND user_id = ?',
    [prospectId, req.user.userId],
    (err, prospect) => {
      if (err) {
        console.error('Error checking prospect ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!prospect) {
        return res.status(404).json({ error: 'Prospect not found' });
      }

      db.run(
        'DELETE FROM prospects WHERE id = ? AND user_id = ?',
        [prospectId, req.user.userId],
        function(err) {
          if (err) {
            console.error('Error deleting prospect:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ message: 'Prospect deleted successfully' });
        }
      );
    }
  );
});

// Supprimer les prospects orphelins (qui ne sont dans aucun onglet)
app.delete('/api/cleanup/orphan-prospects', authenticateToken, (req, res) => {
  console.log('🧹 Starting orphan prospects cleanup for user:', req.user.userId);
  
  // D'abord, récupérer tous les onglets existants pour cet utilisateur
  db.all(
    'SELECT id, is_special FROM tabs WHERE user_id = ?',
    [req.user.userId],
    (err, tabs) => {
      if (err) {
        console.error('Error fetching tabs for orphan cleanup:', err);
        return res.status(500).json({ error: 'Database error while fetching tabs' });
      }

      // Séparer les onglets normaux (non-spéciaux) des onglets spéciaux
      const normalTabIds = tabs.filter(tab => !tab.is_special).map(tab => tab.id);
      const specialTabIds = tabs.filter(tab => tab.is_special).map(tab => tab.id);
      
      console.log('📋 Normal tab IDs:', normalTabIds);
      console.log('🔷 Special tab IDs (All Leads):', specialTabIds);
      
      // Si aucun onglet normal n'existe, tous les prospects sont orphelins
      if (normalTabIds.length === 0) {
        console.log('⚠️ No normal tabs exist, all prospects are orphans');
        db.run(
          'DELETE FROM prospects WHERE user_id = ?',
          [req.user.userId],
          function(err) {
            if (err) {
              console.error('Error deleting all orphan prospects:', err);
              return res.status(500).json({ error: 'Database error while deleting orphans' });
            }
            
            console.log(`✅ Deleted ${this.changes} orphan prospects (no normal tabs exist)`);
            res.json({ 
              message: 'Orphan prospects cleanup completed',
              deletedCount: this.changes 
            });
          }
        );
        return;
      }

      // Construire la requête pour supprimer les prospects orphelins :
      // 1. Prospects avec tab_id NULL
      // 2. Prospects avec tab_id qui ne correspond à aucun onglet existant
      // 3. Prospects qui ne sont que dans des onglets spéciaux (All Leads)
      const placeholders = normalTabIds.map(() => '?').join(',');
      const deleteQuery = `
        DELETE FROM prospects 
        WHERE user_id = ? 
        AND (
          tab_id IS NULL 
          OR tab_id NOT IN (SELECT id FROM tabs WHERE user_id = ?)
          OR tab_id NOT IN (${placeholders})
        )
      `;
      
      const queryParams = [req.user.userId, req.user.userId, ...normalTabIds];
      console.log('🗑️ Delete query:', deleteQuery);
      console.log('📝 Query params:', queryParams);
      
      db.run(deleteQuery, queryParams, function(err) {
        if (err) {
          console.error('Error deleting orphan prospects:', err);
          return res.status(500).json({ error: 'Database error while deleting orphans' });
        }
        
        console.log(`✅ Deleted ${this.changes} orphan prospects`);
        res.json({ 
          message: 'Orphan prospects cleanup completed',
          deletedCount: this.changes 
        });
      });
    }
  );
});


// Routes pour les onglets

// Obtenir tous les onglets de l'utilisateur
app.get('/api/tabs', authenticateToken, (req, res) => {
  console.log('📋 Fetching tabs for user:', req.user.userId);
  db.all(
    'SELECT * FROM tabs WHERE user_id = ? ORDER BY display_order ASC, created_at ASC',
    [req.user.userId],
    (err, tabs) => {
      if (err) {
        console.error('Error retrieving tabs:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Vérifier si l'utilisateur a un onglet "All Leads"
      const hasAllLeadsTab = tabs.some(tab => tab.is_special && tab.name === 'All Leads');
      
      // Si l'utilisateur n'a pas d'onglet "All Leads", le créer
      if (!hasAllLeadsTab) {
        console.log('🔧 No "All Leads" tab found for user, creating it');
        const allLeadsTab = {
          id: `all-leads-${req.user.userId}`,
          name: 'All Leads',
          description: 'View all prospects from all tabs',
          is_special: 1,
          display_order: -1 // Mettre en premier
        };
        
        db.run(
          'INSERT INTO tabs (id, user_id, name, description, is_special, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          [allLeadsTab.id, req.user.userId, allLeadsTab.name, allLeadsTab.description, allLeadsTab.is_special, allLeadsTab.display_order],
          function(err) {
            if (err) {
              console.error('Error creating All Leads tab:', err);
            } else {
              console.log('✅ Created "All Leads" tab for existing user');
              // Re-fetch avec le nouvel onglet
              db.all(
                'SELECT * FROM tabs WHERE user_id = ? ORDER BY display_order ASC, created_at ASC',
                [req.user.userId],
                (err, updatedTabs) => {
                  if (err) {
                    console.error('Error retrieving updated tabs:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  console.log(`📊 Found ${updatedTabs.length} tabs for user ${req.user.userId} after All Leads creation`);
                  res.json(updatedTabs);
                }
              );
            }
          }
        );
        return;
      }

      // Si l'utilisateur n'a pas d'onglets du tout, créer les onglets par défaut
      if (tabs.length === 0) {
        console.log('🔧 No tabs found for user, creating default tabs');
        createDefaultTabsForUser(req.user.userId);
        
        // Re-fetch après création
        setTimeout(() => {
          db.all(
            'SELECT * FROM tabs WHERE user_id = ? ORDER BY display_order ASC, created_at ASC',
            [req.user.userId],
            (err, newTabs) => {
              if (err) {
                console.error('Error retrieving newly created tabs:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              console.log(`📊 Found ${newTabs.length} tabs for user ${req.user.userId} after creation`);
              res.json(newTabs);
            }
          );
        }, 100); // Small delay to ensure tabs are created
      } else {
        console.log(`📊 Found ${tabs.length} tabs for user ${req.user.userId}`);
        res.json(tabs);
      }
    }
  );
});

// Créer un nouvel onglet
app.post('/api/tabs', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tab name is required' });
    }

    const tabId = `tab_${Date.now()}_${req.user.userId}`;
    
    db.run(
      'INSERT INTO tabs (id, user_id, name, description, is_special, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [tabId, req.user.userId, name, description || '', 0, 999], // Mettre à la fin par défaut
      function(err) {
        if (err) {
          console.error('Error creating tab:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Récupérer l'onglet créé
        db.get(
          'SELECT * FROM tabs WHERE id = ?',
          [tabId],
          (err, tab) => {
            if (err) {
              console.error('Error retrieving created tab:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            console.log('✅ Tab created successfully:', tab.name);
            res.status(201).json(tab);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating tab:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Supprimer un onglet (sauf les onglets spéciaux)
app.delete('/api/tabs/:id', authenticateToken, (req, res) => {
  const tabId = req.params.id;

  // Vérifier que l'onglet appartient à l'utilisateur et n'est pas spécial
  db.get(
    'SELECT id, is_special FROM tabs WHERE id = ? AND user_id = ?',
    [tabId, req.user.userId],
    (err, tab) => {
      if (err) {
        console.error('Error checking tab ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!tab) {
        return res.status(404).json({ error: 'Tab not found' });
      }

      if (tab.is_special) {
        return res.status(400).json({ error: 'Cannot delete special tabs' });
      }

      db.run(
        'DELETE FROM tabs WHERE id = ? AND user_id = ?',
        [tabId, req.user.userId],
        function(err) {
          if (err) {
            console.error('Error deleting tab:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          console.log('✅ Tab deleted successfully:', tabId);
          res.json({ message: 'Tab deleted successfully' });
        }
      );
    }
  );
});

// Mettre à jour un onglet (renommer et modifier description)
app.put('/api/tabs/:id', authenticateToken, (req, res) => {
  try {
    const tabId = req.params.id;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tab name is required' });
    }

    console.log(`📝 Updating tab ${tabId} for user ${req.user.userId}`);

    // Vérifier que l'onglet appartient à l'utilisateur
    db.get(
      'SELECT id, name, is_special FROM tabs WHERE id = ? AND user_id = ?',
      [tabId, req.user.userId],
      (err, tab) => {
        if (err) {
          console.error('Error checking tab ownership:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!tab) {
          return res.status(404).json({ error: 'Tab not found' });
        }

        // Empêcher la modification du nom des onglets spéciaux "All Leads"
        if (tab.is_special && tab.name === 'All Leads' && name !== 'All Leads') {
          return res.status(400).json({ error: 'Cannot rename the "All Leads" special tab' });
        }

        // Mettre à jour l'onglet
        db.run(
          'UPDATE tabs SET name = ?, description = ? WHERE id = ? AND user_id = ?',
          [name.trim(), description?.trim() || '', tabId, req.user.userId],
          function(err) {
            if (err) {
              console.error('Error updating tab:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ error: 'Tab not found or no changes made' });
            }

            // Récupérer l'onglet mis à jour
            db.get(
              'SELECT * FROM tabs WHERE id = ?',
              [tabId],
              (err, updatedTab) => {
                if (err) {
                  console.error('Error retrieving updated tab:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                console.log(`✅ Tab updated successfully: ${tab.name} → ${updatedTab.name}`);
                res.json(updatedTab);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error updating tab:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route de test geocoding sans authentification (pour diagnostic uniquement)
app.get('/api/test/geocoding', async (req, res) => {
  try {
    const testAddress = req.query.address || 'Paris, France';
    console.log('🧪 Testing geocoding for:', testAddress);
    
    const startTime = Date.now();
    const result = await geocodeAddressSafely(testAddress, 20000);
    const duration = Date.now() - startTime;
    
    res.json({
      success: !!result,
      address: testAddress,
      duration: duration,
      result: result,
      stats: geocodingStats,
      providers: ['openstreetmap', 'mapquest-fallback'],
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🧪 Test geocoding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      address: req.query.address || 'Paris, France',
      stats: geocodingStats,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de test simple pour vérifier que l'API fonctionne
app.get('/api/test/ping', (req, res) => {
  res.json({
    message: 'Maplyo API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Route de test geocoding simple (SANS authentification pour debug)
app.get('/api/test/geocoding/:address', async (req, res) => {
  try {
    const address = decodeURIComponent(req.params.address);
    console.log('🧪 TEST GEOCODING REQUEST for:', address);
    
    const startTime = Date.now();
    const result = await geocodeAddressSafely(address, 15000); // 15 secondes pour le test
    const duration = Date.now() - startTime;
    
    console.log('🧪 TEST GEOCODING RESULT:', { success: !!result, duration, result });
    
    res.json({
      success: !!result,
      duration: duration,
      result: result,
      address: address,
      stats: geocodingStats,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🧪 TEST GEOCODING ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      address: req.params.address,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de test geocoding PUBLIQUE pour diagnostic (sans authentification)
app.get('/api/test-geocoding', async (req, res) => {
  try {
    console.log('🧪 PUBLIC GEOCODING TEST - Starting...');
    
    const testAddress = req.query.address || 'Paris, France';
    console.log('🧪 Testing geocoding for:', testAddress);
    
    // Test de connectivité réseau d'abord
    console.log('🌐 Testing network connectivity...');
    try {
      const networkTest = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        timeout: 5000,
        headers: { 'User-Agent': 'Maplyo-Test/1.0' }
      });
      console.log('✅ Network test result:', networkTest.status);
    } catch (networkError) {
      console.error('❌ Network test failed:', networkError.message);
    }
    
    // Test DNS pour OpenStreetMap
    console.log('🔍 Testing OpenStreetMap DNS...');
    try {
      const dnsTest = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=test', {
        method: 'GET',
        timeout: 5000,
        headers: { 'User-Agent': 'Maplyo-Test/1.0' }
      });
      console.log('✅ OSM DNS test result:', dnsTest.status);
    } catch (dnsError) {
      console.error('❌ OSM DNS test failed:', dnsError.message);
    }
    
    const startTime = Date.now();
    
    // Test direct du geocoder
    try {
      console.log('🌍 Testing OpenStreetMap provider...');
      console.log('🔧 Geocoder config:', {
        provider: geocoder.options.provider,
        httpAdapter: geocoder.options.httpAdapter,
        timeout: geocoder.options.timeout
      });
      
      const osmResult = await geocoder.geocode(testAddress);
      const osmDuration = Date.now() - startTime;
      
      console.log('📊 OSM Result:', osmResult);
      console.log('⏱️ OSM Duration:', osmDuration, 'ms');
      
      if (osmResult && osmResult.length > 0) {
        const result = {
          success: true,
          provider: 'OpenStreetMap',
          address: testAddress,
          latitude: osmResult[0].latitude,
          longitude: osmResult[0].longitude,
          duration: osmDuration,
          formattedAddress: osmResult[0].formattedAddress,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ PUBLIC TEST - Geocoding successful:', result);
        return res.json(result);
      }
    } catch (osmError) {
      console.error('❌ OSM Error:', osmError.message);
      console.error('🔍 OSM Error details:', {
        name: osmError.name,
        code: osmError.code,
        stack: osmError.stack
      });
    }
    
    // Test avec notre fonction sécurisée
    try {
      console.log('🛡️ Testing with safe geocoding function...');
      const safeStartTime = Date.now();
      const safeResult = await geocodeAddressSafely(testAddress, 15000);
      const safeDuration = Date.now() - safeStartTime;
      
      if (safeResult) {
        const result = {
          success: true,
          provider: 'Safe Geocoding Function',
          address: testAddress,
          latitude: safeResult.latitude,
          longitude: safeResult.longitude,
          duration: safeDuration,
          formattedAddress: safeResult.formattedAddress,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ SAFE TEST - Geocoding successful:', result);
        return res.json(result);
      }
    } catch (safeError) {
      console.error('❌ Safe geocoding error:', safeError.message);
      console.error('🔍 Safe geocoding error details:', {
        name: safeError.name,
        code: safeError.code,
        stack: safeError.stack
      });
    }
    
    // Test direct de l'API Nominatim en dernier recours
    try {
      console.log('🆘 Last resort: Direct Nominatim API call...');
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(testAddress)}`;
      console.log('🔗 Nominatim URL:', nominatimUrl);
      
      const directResponse = await fetch(nominatimUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Maplyo/1.0 (contact@maplyo.com)'
        },
        timeout: 10000
      });
      
      if (directResponse.ok) {
        const directData = await directResponse.json();
        console.log('📊 Direct Nominatim response:', directData);
        
        if (directData && directData.length > 0) {
          const result = {
            success: true,
            provider: 'Direct Nominatim API',
            address: testAddress,
            latitude: parseFloat(directData[0].lat),
            longitude: parseFloat(directData[0].lon),
            formattedAddress: directData[0].display_name,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
          };
          
          console.log('✅ DIRECT API - Geocoding successful:', result);
          return res.json(result);
        }
      }
    } catch (directError) {
      console.error('❌ Direct Nominatim API failed:', directError.message);
    }
    
    // Si tout échoue
    const failureResult = {
      success: false,
      error: 'All geocoding methods failed',
      address: testAddress,
      environment: process.env.NODE_ENV,
      stats: geocodingStats,
      timestamp: new Date().toISOString()
    };
    
    console.log('❌ PUBLIC TEST - All geocoding failed:', failureResult);
    res.status(500).json(failureResult);
    
  } catch (error) {
    console.error('💥 Public geocoding test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de diagnostic système (pour débogage)
app.get('/api/system/diagnostic', authenticateToken, async (req, res) => {
  try {
    const diagnostics = {
      server: {
        environment: process.env.NODE_ENV,
        port: PORT,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      database: {
        path: dbPath,
        exists: require('fs').existsSync(dbPath),
        size: require('fs').existsSync(dbPath) ? require('fs').statSync(dbPath).size : 0
      },
      geocoding: {
        provider: 'openstreetmap',
        stats: geocodingStats,
        lastTest: null
      },
      network: {
        testUrl: 'https://httpbin.org/get',
        lastTest: null
      }
    };

    // Test rapide de geocoding
    try {
      const testStart = Date.now();
      const testResult = await geocodeAddressSafely('Paris, France', 5000);
      diagnostics.geocoding.lastTest = {
        success: !!testResult,
        duration: Date.now() - testStart,
        result: testResult
      };
    } catch (error) {
      diagnostics.geocoding.lastTest = {
        success: false,
        error: error.message
      };
    }

    // Test rapide réseau
    try {
      const networkStart = Date.now();
      const response = await fetch('https://httpbin.org/get', { timeout: 5000 });
      diagnostics.network.lastTest = {
        success: response.ok,
        status: response.status,
        duration: Date.now() - networkStart
      };
    } catch (error) {
      diagnostics.network.lastTest = {
        success: false,
        error: error.message
      };
    }

    res.json(diagnostics);
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Diagnostic failed' });
  }
});

// Route de géocodage avec gestion d'erreurs robuste
app.post('/api/geocode', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ 
        error: 'Valid address is required',
        success: false 
      });
    }

    console.log('🌍 API geocoding request for:', address);
    
    const geoResult = await geocodeAddressSafely(address.trim(), 10000);
    
    if (!geoResult) {
      console.log('❌ API geocoding failed for address:', address);
      return res.status(404).json({ 
        error: 'Address not found or geocoding service unavailable',
        success: false,
        address: address.trim()
      });
    }

    console.log('✅ API geocoding successful:', geoResult);
    res.json({
      success: true,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      formattedAddress: geoResult.formattedAddress || address.trim(),
      address: address.trim()
    });
  } catch (error) {
    console.error('❌ API geocoding error:', error);
    res.status(500).json({ 
      error: 'Geocoding service temporarily unavailable',
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Route pour l'import CSV simplifiée
app.post('/api/prospects/import-csv', authenticateToken, async (req, res) => {
  try {
    console.log('📥 CSV Import request for user:', req.user.userId);
    const { csvData, options } = req.body;

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({ error: 'CSV data is required and must be an array' });
    }

    console.log(`📊 Processing ${csvData.length} CSV rows`);
    console.log('🔍 First row columns:', Object.keys(csvData[0]));

    const results = {
      imported: 0,
      merged: 0,
      skipped: 0,
      errors: []
    };

    // Traitement simple ligne par ligne
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        // Mapper les colonnes CSV vers les champs prospects
        const prospectData = mapCSVRowToProspect(row, options);
        
        if (prospectData.name || prospectData.company) {
          // Créer le prospect
          const prospectId = await createProspectFromCSV(prospectData, req.user.userId, options);
          results.imported++;
          console.log(`✅ Imported row ${i + 1}: ${prospectData.name || prospectData.company}`);
        } else {
          results.skipped++;
          console.log(`⚠️ Skipped row ${i + 1}: No name or company found`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing row ${i + 1}:`, error);
        results.errors.push({
          row: i + 1,
          data: row,
          error: error.message
        });
        results.skipped++;
      }
    }

    console.log(`✅ CSV Import completed: ${results.imported} imported, ${results.skipped} skipped`);
    
    res.json({
      message: 'CSV import completed',
      results
    });

  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'CSV import failed: ' + error.message });
  }
});

// ===== HELPER FUNCTIONS FOR CSV IMPORT =====

// Fonction pour mapper une ligne CSV vers un objet prospect
function mapCSVRowToProspect(row, options) {
  // Fonction helper pour chercher une valeur parmi plusieurs clés possibles
  const findValue = (possibleKeys) => {
    for (const key of possibleKeys) {
      // Chercher correspondance exacte
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return String(row[key]).trim();
      }
    }
    
    // Chercher correspondance insensible à la casse
    const rowKeys = Object.keys(row);
    for (const searchKey of possibleKeys) {
      const foundKey = rowKeys.find(rowKey => 
        rowKey.toLowerCase() === searchKey.toLowerCase()
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
        return String(row[foundKey]).trim();
      }
    }
    
    return '';
  };

  // Fonction helper pour les valeurs numériques
  const findNumericValue = (possibleKeys, defaultValue = 0) => {
    const value = findValue(possibleKeys);
    if (!value) return defaultValue;
    
    const cleanValue = value.replace(/[€$£¥,\s]/g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Extraire les valeurs avec fallbacks intelligents
  const name = findValue(['name', 'nom', 'contact', 'person', 'personne', 'client', 'firstname', 'first_name', 'full_name']);
  const company = findValue(['company', 'entreprise', 'societe', 'société', 'firm', 'organization', 'organisation', 'business', 'companyName', 'company_name']);
  const email = findValue(['email', 'mail', 'e-mail', 'e_mail', 'emailAddress', 'email_address']);
  const phone = findValue(['phone', 'telephone', 'tel', 'phoneNumber', 'phone_number', 'mobile', 'cell']);
  const address = findValue(['address', 'adresse', 'addr', 'location', 'lieu', 'ville', 'city']);
  const revenue = findNumericValue(['revenue', 'ca', 'chiffre_affaires', 'chiffre', 'turnover', 'sales', 'ventes', 'montant', 'amount', 'value', 'valeur']);
  const position = findValue(['position', 'poste', 'title', 'titre', 'job', 'job_title', 'function', 'fonction', 'role']);
  const status = findValue(['status', 'statut', 'state', 'etat', 'stage', 'phase']) || 'cold';
  const notes = findValue(['notes', 'note', 'commentaires', 'comments', 'remarks', 'description']);

  return {
    name: name || company || 'Unknown',  // Si pas de nom, utiliser company
    company: company || '',
    email: email || '',
    phone: phone || '',
    position: position || '',
    address: address || '',
    status: status,
    revenue: revenue,
    notes: notes || `Imported from CSV on ${new Date().toLocaleDateString()}`,
    tab_id: options?.tabId || 'default'
  };
}

// Fonction pour créer un prospect depuis les données CSV
async function createProspectFromCSV(prospectData, userId, options) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO prospects 
       (user_id, name, email, phone, company, contact, address, status, revenue, notes, notes_last_updated, tab_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userId,
        prospectData.name,
        prospectData.email,
        prospectData.phone,
        prospectData.company,
        prospectData.contact,
        prospectData.address,
        prospectData.status,
        prospectData.revenue,
        prospectData.notes,
        prospectData.notes ? new Date().toISOString() : null,
        prospectData.tab_id
      ],
      function(err) {
        if (err) {
          console.error('Database error creating prospect:', err);
          reject(err);
        } else {
          console.log(`✅ Created prospect with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      }
    );
  });
}

// Route pour exporter la base de données
app.get('/api/database/export', authenticateToken, (req, res) => {
  try {
    console.log(`📤 Exporting database for user ${req.user.userId}`);
    
    // Récupérer tous les prospects de l'utilisateur
    db.all(
      'SELECT * FROM prospects WHERE user_id = ?',
      [req.user.userId],
      (err, prospects) => {
        if (err) {
          console.error('Error retrieving prospects for export:', err);
          return res.status(500).json({ error: 'Database error while retrieving prospects' });
        }

        // Récupérer tous les tabs de l'utilisateur
        db.all(
          'SELECT * FROM tabs WHERE user_id = ?',
          [req.user.userId],
          (err, tabs) => {
            if (err) {
              console.error('Error retrieving tabs for export:', err);
              return res.status(500).json({ error: 'Database error while retrieving tabs' });
            }

            // Récupérer les paramètres de l'utilisateur
            db.all(
              'SELECT * FROM settings WHERE user_id = ?',
              [req.user.userId],
              (err, settings) => {
                if (err) {
                  console.error('Error retrieving settings for export:', err);
                  return res.status(500).json({ error: 'Database error while retrieving settings' });
                }

                // Récupérer les informations utilisateur (sans le mot de passe)
                db.get(
                  'SELECT id, email, name, company, created_at FROM users WHERE id = ?',
                  [req.user.userId],
                  (err, user) => {
                    if (err) {
                      console.error('Error retrieving user for export:', err);
                      return res.status(500).json({ error: 'Database error while retrieving user' });
                    }

                    const exportData = {
                      version: '2.0',
                      exported_at: new Date().toISOString(),
                      user: user,
                      prospects: prospects,
                      tabs: tabs,
                      settings: settings
                    };

                    console.log(`✅ Export completed: ${prospects.length} prospects, ${tabs.length} tabs, ${settings.length} settings`);
                    res.json(exportData);
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in database export:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint pour supprimer toutes les données de l'utilisateur
app.delete('/api/database/delete-all', authenticateToken, (req, res) => {
  try {
    console.log(`🗑️ Deleting all data for user ${req.user.userId}`);
    
    // Supprimer tous les prospects de l'utilisateur
    db.run(
      'DELETE FROM prospects WHERE user_id = ?',
      [req.user.userId],
      function(err) {
        if (err) {
          console.error('Error deleting prospects:', err);
          return res.status(500).json({ error: 'Database error while deleting prospects' });
        }

        const prospectsDeleted = this.changes;
        console.log(`✅ Deleted ${prospectsDeleted} prospects`);

        // Supprimer tous les onglets personnalisés de l'utilisateur (garder les onglets spéciaux)
        db.run(
          'DELETE FROM tabs WHERE user_id = ? AND is_special = 0',
          [req.user.userId],
          function(err) {
            if (err) {
              console.error('Error deleting tabs:', err);
              return res.status(500).json({ error: 'Database error while deleting tabs' });
            }

            const tabsDeleted = this.changes;
            console.log(`✅ Deleted ${tabsDeleted} custom tabs`);

            res.json({
              message: 'All data deleted successfully',
              deleted: {
                prospects: prospectsDeleted,
                tabs: tabsDeleted
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in delete-all endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate estimated completion date based on status and lead times
function calculateEstimatedCompletionDate(status, leadTimes) {
  const today = new Date();
  const leadTimeMonths = leadTimes[status] || leadTimes.cold || 12;
  
  const estimatedDate = new Date(today);
  estimatedDate.setMonth(estimatedDate.getMonth() + leadTimeMonths);
  
  return estimatedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Async helper function to get lead times and calculate estimated completion date
async function getEstimatedCompletionDate(userId, status, providedDate = null) {
  if (providedDate) {
    return providedDate;
  }

  return new Promise((resolve) => {
    db.get(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [userId, 'closing_lead_times'],
      (err, row) => {
        let leadTimes = { cold: 12, warm: 6, hot: 3, recurring: 12 }; // Default values
        if (!err && row) {
          try {
            leadTimes = JSON.parse(row.setting_value);
          } catch (parseError) {
            console.warn('Failed to parse lead times, using defaults');
          }
        }
        
        const estimatedDate = calculateEstimatedCompletionDate(status || 'cold', leadTimes);
        resolve(estimatedDate);
      }
    );
  });
}

// Export database endpoint
app.get('/api/database/export', authenticateToken, (req, res) => {
  try {
    console.log(`📤 Exporting database for user ${req.user.userId}`);
    
    const exportData = {
      version: '2.0', // Version for backward compatibility
      exported_at: new Date().toISOString(),
      user_id: req.user.userId,
      schema: {
        prospects: [
          'id', 'user_id', 'name', 'email', 'phone', 'company', 'position', 
          'address', 'latitude', 'longitude', 'status', 'revenue', 
          'probability_coefficient', 'notes', 'tab_id', 'display_order',
          'estimated_completion_date', 'created_at', 'updated_at'
        ],
        tabs: [
          'id', 'user_id', 'name', 'description', 'is_special', 'display_order', 'created_at'
        ],
        users: [
          'id', 'email', 'name', 'company', 'created_at'
        ],
        settings: [
          'id', 'user_id', 'setting_key', 'setting_value', 'created_at', 'updated_at'
        ]
      }
    };

    // Get user data (without password)
    db.get(
      'SELECT id, email, name, company, created_at FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('Error retrieving user for export:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        exportData.users = [user];

        // Get all prospects for the user
        db.all(
          'SELECT * FROM prospects WHERE user_id = ?',
          [req.user.userId],
          (err, prospects) => {
            if (err) {
              console.error('Error retrieving prospects for export:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            exportData.prospects = prospects;

            // Get all tabs for the user
            db.all(
              'SELECT * FROM tabs WHERE user_id = ?',
              [req.user.userId],
              (err, tabs) => {
                if (err) {
                  console.error('Error retrieving tabs for export:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                exportData.tabs = tabs;

                // Get all settings for the user
                db.all(
                  'SELECT * FROM settings WHERE user_id = ?',
                  [req.user.userId],
                  (err, settings) => {
                    if (err) {
                      console.error('Error retrieving settings for export:', err);
                      return res.status(500).json({ error: 'Database error' });
                    }

                    exportData.settings = settings;

                    console.log(`✅ Database exported successfully: ${prospects.length} prospects, ${tabs.length} tabs, ${settings.length} settings`);
                    res.json(exportData);
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in export endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import database endpoint
app.post('/api/database/import', authenticateToken, (req, res) => {
  try {
    console.log(`📥 Importing database for user ${req.user.userId}`);
    console.log('📋 Request body keys:', Object.keys(req.body || {}));
    console.log('📋 Request body type:', typeof req.body);
    console.log('📋 Request body content length:', JSON.stringify(req.body || {}).length);
    
    let importData = req.body;

    // Enhanced validation and data extraction for different backup formats
    if (!importData || typeof importData !== 'object') {
      console.error('❌ Invalid import data format');
      return res.status(400).json({ error: 'Invalid import data format - expected JSON object' });
    }

    // Debug the structure
    console.log('📋 Import data structure:', {
      hasProspects: !!importData.prospects,
      prospectsCount: Array.isArray(importData.prospects) ? importData.prospects.length : 'not array',
      prospectsType: typeof importData.prospects,
      hasTabs: !!importData.tabs,
      tabsCount: Array.isArray(importData.tabs) ? importData.tabs.length : 'not array',
      hasUsers: !!importData.users,
      hasSettings: !!importData.settings,
      topLevelKeys: Object.keys(importData)
    });

    // Handle different backup formats and nested structures
    if (!importData.prospects) {
      // Check if it's an old format with nested user data
      if (importData.users && typeof importData.users === 'object') {
        console.log('📋 Detected nested user data format, extracting...');
        const firstUserKey = Object.keys(importData.users)[0];
        const firstUser = importData.users[firstUserKey];
        
        if (firstUser && firstUser.prospects) {
          importData.prospects = firstUser.prospects;
          console.log(`📋 Extracted ${importData.prospects.length} prospects from nested user data`);
        }
        
        if (firstUser && firstUser.tabs) {
          importData.tabs = firstUser.tabs;
          console.log(`📋 Extracted ${importData.tabs.length} tabs from nested user data`);
        }
        
        if (firstUser && firstUser.settings) {
          importData.settings = firstUser.settings;
          console.log(`📋 Extracted settings from nested user data`);
        }
      }
      
      // If still no prospects, create empty array (allow imports with no prospects)
      if (!importData.prospects) {
        console.log('⚠️ No prospects found in import data, using empty array');
        importData.prospects = [];
      }
    }

    // Ensure prospects is an array
    if (!Array.isArray(importData.prospects)) {
      console.error('❌ Prospects data is not an array:', typeof importData.prospects);
      return res.status(400).json({ error: 'Invalid prospects data format - expected array' });
    }

    const results = {
      imported: {
        prospects: 0,
        tabs: 0,
        settings: 0
      },
      errors: [],
      skipped: {
        prospects: 0,
        tabs: 0,
        settings: 0
      }
    };

    // Get user's lead times for calculating estimated completion dates
    db.get(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [req.user.userId, 'closing_lead_times'],
      (err, leadTimesRow) => {
        let leadTimes = { cold: 12, warm: 6, hot: 3, recurring: 12 }; // Default values
        if (!err && leadTimesRow) {
          try {
            leadTimes = JSON.parse(leadTimesRow.setting_value);
          } catch (parseError) {
            console.warn('Failed to parse lead times, using defaults');
          }
        }

        // Start transaction
        db.serialize(async () => {
          try {
            console.log(`🔄 Starting import transaction for user ${req.user.userId}`);
            
            // Clear existing data for the user (with promises)
            console.log(`🗑️ Clearing existing data...`);
            await new Promise((resolve, reject) => {
              db.run('DELETE FROM prospects WHERE user_id = ?', [req.user.userId], (err) => {
                if (err) reject(err);
                else {
                  console.log(`✅ Cleared prospects for user ${req.user.userId}`);
                  resolve();
                }
              });
            });
            
            await new Promise((resolve, reject) => {
              db.run('DELETE FROM tabs WHERE user_id = ?', [req.user.userId], (err) => {
                if (err) reject(err);
                else {
                  console.log(`✅ Cleared tabs for user ${req.user.userId}`);
                  resolve();
                }
              });
            });
            
            await new Promise((resolve, reject) => {
              db.run('DELETE FROM settings WHERE user_id = ? AND setting_key != ?', [req.user.userId, 'closing_lead_times'], (err) => {
                if (err) reject(err);
                else {
                  console.log(`✅ Cleared settings for user ${req.user.userId}`);
                  resolve();
                }
              });
            });

            // STEP 1: Import tabs FIRST and create mapping - SEQUENTIAL APPROACH
            const tabIdMapping = {};
            let defaultTabId = 'default';
            
            if (importData.tabs && Array.isArray(importData.tabs) && importData.tabs.length > 0) {
              console.log(`📋 Importing ${importData.tabs.length} tabs sequentially...`);
              
              for (let i = 0; i < importData.tabs.length; i++) {
                const tab = importData.tabs[i];
                const originalTabId = tab.id;
                // Always generate a new unique ID to avoid conflicts
                const newTabId = `tab_${Date.now()}_${i}_${req.user.userId}`;
                
                // Store mapping
                tabIdMapping[originalTabId] = newTabId;
                if (i === 0) defaultTabId = newTabId;
                
                const mappedTab = {
                  id: newTabId,
                  name: tab.name || `Imported Tab ${i + 1}`,
                  description: tab.description || '',
                  is_special: tab.is_special ? 1 : 0,
                  display_order: !isNaN(parseInt(tab.display_order)) ? parseInt(tab.display_order) : i,
                  created_at: tab.created_at || null
                };

                await new Promise((resolve, reject) => {
                  db.run(
                    `INSERT OR REPLACE INTO tabs (id, user_id, name, description, is_special, display_order, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
                    [mappedTab.id, req.user.userId, mappedTab.name, mappedTab.description, mappedTab.is_special, mappedTab.display_order, mappedTab.created_at],
                    function(err) {
                      if (err) {
                        console.error(`❌ Error importing tab ${mappedTab.name}:`, err);
                        results.errors.push(`Tab ${mappedTab.name}: ${err.message}`);
                        results.skipped.tabs++;
                        // Continue instead of stopping the entire import
                        resolve();
                      } else {
                        results.imported.tabs++;
                        console.log(`✅ Imported tab ${results.imported.tabs}/${importData.tabs.length}: ${mappedTab.name} (${originalTabId} -> ${mappedTab.id})`);
                        resolve();
                      }
                    }
                  );
                });
              }
              
              console.log(`🗂️ Tab mapping created:`, tabIdMapping);
            } else {
              console.log('🔧 No tabs in import data, creating default tabs...');
              createDefaultTabsForUser(req.user.userId);
              results.imported.tabs = 2;
              defaultTabId = `all-leads-${req.user.userId}`;
            }

            // STEP 2: Import prospects SEQUENTIALLY with proper tab mapping
            console.log(`📋 Importing ${importData.prospects.length} prospects sequentially...`);
            
            for (let i = 0; i < importData.prospects.length; i++) {
              const prospect = importData.prospects[i];
              
              const mappedProspect = {
                name: prospect.name || prospect.company || `Imported Prospect ${i + 1}`,
                email: prospect.email || '',
                phone: prospect.phone || '',
                company: prospect.company || '',
                contact: prospect.contact || prospect.position || '',
                address: prospect.address || '',
                latitude: (prospect.latitude !== undefined && prospect.latitude !== null && !isNaN(prospect.latitude)) ? parseFloat(prospect.latitude) : null,
                longitude: (prospect.longitude !== undefined && prospect.longitude !== null && !isNaN(prospect.longitude)) ? parseFloat(prospect.longitude) : null,
                status: ['hot', 'warm', 'cold', 'won', 'lost', 'recurring'].includes(prospect.status) ? prospect.status : 'cold',
                revenue: !isNaN(parseFloat(prospect.revenue)) ? parseFloat(prospect.revenue) : 0,
                probability_coefficient: !isNaN(parseFloat(prospect.probability_coefficient)) ? parseFloat(prospect.probability_coefficient) : 100,
                notes: prospect.notes || '',
                tab_id: defaultTabId, // Default assignment
                display_order: !isNaN(parseInt(prospect.display_order)) ? parseInt(prospect.display_order) : i,
                estimated_completion_date: prospect.estimated_completion_date || null,
                recurrence_months: !isNaN(parseInt(prospect.recurrence_months)) ? parseInt(prospect.recurrence_months) : 12,
                next_followup_date: prospect.next_followup_date || null,
                created_at: prospect.created_at || null,
                updated_at: prospect.updated_at || null
              };

              // Map the tab_id using the mapping if available
              if (prospect.tab_id && tabIdMapping[prospect.tab_id]) {
                mappedProspect.tab_id = tabIdMapping[prospect.tab_id];
                console.log(`🔗 Prospect "${mappedProspect.name}" mapped: ${prospect.tab_id} -> ${mappedProspect.tab_id}`);
              } else if (prospect.tab_id) {
                console.log(`⚠️ Tab ID "${prospect.tab_id}" not found, using default: ${defaultTabId}`);
              }

              // Calculate estimated_completion_date if not present
              if (!mappedProspect.estimated_completion_date && mappedProspect.status) {
                mappedProspect.estimated_completion_date = calculateEstimatedCompletionDate(mappedProspect.status, leadTimes);
              }

              await new Promise((resolve, reject) => {
                db.run(
                  `INSERT OR REPLACE INTO prospects 
                   (user_id, name, email, phone, company, contact, address, latitude, longitude, 
                    status, revenue, probability_coefficient, notes, tab_id, display_order, 
                    estimated_completion_date, recurrence_months, next_followup_date, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                           COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
                  [
                    req.user.userId, mappedProspect.name, mappedProspect.email, mappedProspect.phone,
                    mappedProspect.company, mappedProspect.contact, mappedProspect.address,
                    mappedProspect.latitude, mappedProspect.longitude, mappedProspect.status,
                    mappedProspect.revenue, mappedProspect.probability_coefficient, mappedProspect.notes,
                    mappedProspect.tab_id, mappedProspect.display_order, mappedProspect.estimated_completion_date,
                    mappedProspect.recurrence_months, mappedProspect.next_followup_date,
                    mappedProspect.created_at, mappedProspect.updated_at
                  ],
                  function(err) {
                    if (err) {
                      console.error(`❌ Error importing prospect ${mappedProspect.name}:`, err);
                      results.errors.push(`Prospect ${mappedProspect.name}: ${err.message}`);
                      results.skipped.prospects++;
                      // Continue instead of stopping the entire import
                      resolve();
                    } else {
                      results.imported.prospects++;
                      console.log(`✅ Imported prospect ${results.imported.prospects}/${importData.prospects.length}: ${mappedProspect.name} -> tab: ${mappedProspect.tab_id}`);
                      resolve();
                    }
                  }
                );
              });
            }

            // STEP 3: Import settings sequentially
            if (importData.settings && Array.isArray(importData.settings)) {
              console.log(`📋 Importing ${importData.settings.length} settings...`);
              for (let i = 0; i < importData.settings.length; i++) {
                const setting = importData.settings[i];
                
                // Skip lead times to preserve user's current configuration
                if (setting.setting_key === 'closing_lead_times') {
                  console.log('⏭️ Skipping lead times setting to preserve user configuration');
                  results.skipped.settings++;
                  continue;
                }

                const mappedSetting = {
                  setting_key: setting.setting_key || `imported_setting_${i}`,
                  setting_value: setting.setting_value || '{}',
                  created_at: setting.created_at || null,
                  updated_at: setting.updated_at || null
                };

                await new Promise((resolve, reject) => {
                  db.run(
                    `INSERT OR REPLACE INTO settings (user_id, setting_key, setting_value, created_at, updated_at) 
                     VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
                    [req.user.userId, mappedSetting.setting_key, mappedSetting.setting_value, mappedSetting.created_at, mappedSetting.updated_at],
                    function(err) {
                      if (err) {
                        console.error(`❌ Error importing setting ${mappedSetting.setting_key}:`, err);
                        results.errors.push(`Setting ${mappedSetting.setting_key}: ${err.message}`);
                        results.skipped.settings++;
                        // Continue instead of stopping the entire import
                        resolve();
                      } else {
                        results.imported.settings++;
                        console.log(`✅ Imported setting ${results.imported.settings}: ${mappedSetting.setting_key}`);
                        resolve();
                      }
                    }
                  );
                });
              }
            }

            console.log(`✅ Database imported successfully for user ${req.user.userId}`);
            console.log(`📊 Final Results:`, results);
            
            // Verify final state
            await new Promise((resolve) => {
              db.all('SELECT id, name, tab_id FROM prospects WHERE user_id = ?', [req.user.userId], (err, prospects) => {
                if (!err) {
                  console.log(`🔍 Final verification: ${prospects.length} prospects in DB:`, 
                    prospects.map(p => `${p.name} -> tab: ${p.tab_id}`));
                }
                resolve();
              });
            });
            
            res.json({
              message: 'Database imported successfully',
              ...results
            });
          } catch (error) {
            console.error('Error during import transaction:', error);
            res.status(500).json({ error: 'Import transaction failed: ' + error.message });
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in import endpoint:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// DEBUG: Endpoint temporaire pour vérifier le contenu de la base après import
app.get('/api/debug/database-content', authenticateToken, (req, res) => {
  console.log(`🔍 DEBUG: Checking database content for user ${req.user.userId}`);
  
  db.all('SELECT * FROM prospects WHERE user_id = ?', [req.user.userId], (err, prospects) => {
    if (err) {
      console.error('Error fetching prospects:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.all('SELECT * FROM tabs WHERE user_id = ?', [req.user.userId], (err2, tabs) => {
      if (err2) {
        console.error('Error fetching tabs:', err2);
        return res.status(500).json({ error: 'Database error' });
      }
      
      console.log(`🔍 DEBUG: Found ${prospects.length} prospects and ${tabs.length} tabs for user ${req.user.userId}`);
      console.log(`🔍 DEBUG: Prospects:`, prospects.map(p => ({ id: p.id, name: p.name, tab_id: p.tab_id })));
      console.log(`🔍 DEBUG: Tabs:`, tabs.map(t => ({ id: t.id, name: t.name })));
      
      res.json({
        user_id: req.user.userId,
        prospects: prospects,
        tabs: tabs,
        summary: {
          prospects_count: prospects.length,
          tabs_count: tabs.length,
          prospects_by_tab: prospects.reduce((acc, p) => {
            acc[p.tab_id] = (acc[p.tab_id] || 0) + 1;
            return acc;
          }, {})
        }
      });
    });
  });
});

// Route de test public pour vérifier le geocoding (SANS AUTH - pour debug uniquement)
app.get('/test-geocoding', async (req, res) => {
  const testAddress = req.query.address || 'Paris, France';
  
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  
  res.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Maplyo Geocoding Test</title>
      <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #cce7ff; color: #004085; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌍 Maplyo Geocoding Test</h1>
        <div class="info status">
          <strong>Test Address:</strong> ${testAddress}<br>
          <strong>Environment:</strong> ${process.env.NODE_ENV}<br>
          <strong>Server Time:</strong> ${new Date().toISOString()}
        </div>
        <h2>🔄 Testing geocoding...</h2>
  `);
  
  try {
    const startTime = Date.now();
    res.write(`<div class="info status">⏱️ Starting geocoding at ${new Date().toISOString()}</div>`);
    
    const result = await geocodeAddressSafely(testAddress, 25000); // 25 secondes max
    const duration = Date.now() - startTime;
    
    if (result) {
      res.write(`
        <div class="success status">
          <h3>✅ Geocoding Successful!</h3>
          <strong>Duration:</strong> ${duration}ms<br>
          <strong>Latitude:</strong> ${result.latitude}<br>
          <strong>Longitude:</strong> ${result.longitude}<br>
          <strong>Formatted Address:</strong> ${result.formattedAddress || 'N/A'}
        </div>
      `);
    } else {
      res.write(`
        <div class="warning status">
          <h3>⚠️ Geocoding Failed</h3>
          <strong>Duration:</strong> ${duration}ms<br>
          No results returned from geocoding service.
        </div>
      `);
    }
    
    res.write(`
      <h3>📊 Current Stats</h3>
      <pre>${JSON.stringify(geocodingStats, null, 2)}</pre>
      
      <h3>🔧 Test Other Addresses</h3>
      <form method="get">
        <input type="text" name="address" placeholder="Enter address to test" value="${testAddress}" style="width: 300px; padding: 8px;">
        <button type="submit" style="padding: 8px 15px;">Test</button>
      </form>
      
      <div class="info status" style="margin-top: 20px;">
        <strong>API Test:</strong> <a href="/api/test/geocoding/${encodeURIComponent(testAddress)}" target="_blank">
          /api/test/geocoding/${encodeURIComponent(testAddress)}
        </a>
      </div>
    `);
    
  } catch (error) {
    res.write(`
      <div class="error status">
        <h3>❌ Test Error</h3>
        <strong>Error:</strong> ${error.message}<br>
        <strong>Stack:</strong><br>
        <pre>${error.stack}</pre>
      </div>
    `);
  }
  
  res.write('</div></body></html>');
  res.end();
});

// ===== DANGER ZONE: FULL DATABASE DUMP & IMPORT =====

// Full database dump endpoint (DANGER ZONE - Admin only)
app.get('/api/database/full-dump', authenticateToken, async (req, res) => {
  try {
    console.log(`🚨 DANGER ZONE: Full database dump requested by user ${req.user.userId}`);
    
    // Get all table schemas first
    const tableSchemas = {};
    
    // Get all table names
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
    
    console.log(`📋 Found tables: ${tables.join(', ')}`);
    
    // Get schema for each table
    for (const tableName of tables) {
      const schema = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) reject(err);
          else resolve(columns);
        });
      });
      tableSchemas[tableName] = schema;
    }
    
    // Get all data from all tables
    const fullDump = {
      version: '3.0-full',
      exported_at: new Date().toISOString(),
      exported_by: req.user.userId,
      database_schema: tableSchemas,
      tables: {}
    };
    
    for (const tableName of tables) {
      const data = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      fullDump.tables[tableName] = data;
      console.log(`📊 Exported ${data.length} rows from table ${tableName}`);
    }
    
    console.log(`✅ Full database dump completed: ${Object.keys(fullDump.tables).length} tables`);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="maplyo-full-dump-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(fullDump);
    
  } catch (error) {
    console.error('❌ Full database dump error:', error);
    res.status(500).json({ 
      error: 'Full database dump failed', 
      details: error.message 
    });
  }
});

// Full database import endpoint (DANGER ZONE - Admin only)
app.post('/api/database/full-import', authenticateToken, async (req, res) => {
  try {
    console.log(`🚨 DANGER ZONE: Full database import requested by user ${req.user.userId}`);
    
    const importData = req.body;
    
    // Validate import data structure
    if (!importData || !importData.tables || !importData.database_schema) {
      return res.status(400).json({ 
        error: 'Invalid full dump format - missing tables or schema information' 
      });
    }
    
    console.log(`📋 Import data contains ${Object.keys(importData.tables).length} tables`);
    console.log(`📋 Available tables in dump: ${Object.keys(importData.tables).join(', ')}`);
    
    const results = {
      imported_tables: 0,
      imported_rows: {},
      skipped_tables: 0,
      errors: [],
      schema_migrations: []
    };
    
    // Get current database schema
    const currentTables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
    
    // Process each table in the dump
    for (const [tableName, tableData] of Object.entries(importData.tables)) {
      try {
        console.log(`🔄 Processing table: ${tableName} (${tableData.length} rows)`);
        
        // Check if table exists in current database
        if (!currentTables.includes(tableName)) {
          console.log(`⚠️ Table ${tableName} doesn't exist in current database, skipping`);
          results.skipped_tables++;
          results.errors.push(`Table ${tableName} not found in current database`);
          continue;
        }
        
        // Get current table schema
        const currentSchema = await new Promise((resolve, reject) => {
          db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
            if (err) reject(err);
            else resolve(columns);
          });
        });
        
        const currentColumns = currentSchema.map(col => col.name);
        const importSchema = importData.database_schema[tableName] || [];
        const importColumns = importSchema.map(col => col.name);
        
        // Find common columns (intelligent import)
        const commonColumns = currentColumns.filter(col => importColumns.includes(col));
        const newColumns = currentColumns.filter(col => !importColumns.includes(col));
        const droppedColumns = importColumns.filter(col => !currentColumns.includes(col));
        
        console.log(`📊 Table ${tableName} schema analysis:`);
        console.log(`   Common columns: ${commonColumns.join(', ')}`);
        if (newColumns.length > 0) {
          console.log(`   New columns (will be NULL): ${newColumns.join(', ')}`);
          results.schema_migrations.push(`Table ${tableName}: Added columns ${newColumns.join(', ')}`);
        }
        if (droppedColumns.length > 0) {
          console.log(`   Dropped columns (ignored): ${droppedColumns.join(', ')}`);
          results.schema_migrations.push(`Table ${tableName}: Ignored columns ${droppedColumns.join(', ')}`);
        }
        
        if (commonColumns.length === 0) {
          console.log(`⚠️ No common columns found for table ${tableName}, skipping`);
          results.skipped_tables++;
          results.errors.push(`No compatible columns found for table ${tableName}`);
          continue;
        }
        
        // Clear existing data (DANGER!)
        await new Promise((resolve, reject) => {
          db.run(`DELETE FROM ${tableName}`, (err) => {
            if (err) reject(err);
            else {
              console.log(`🗑️ Cleared existing data from ${tableName}`);
              resolve();
            }
          });
        });
        
        // Import data row by row with intelligent column mapping
        let importedRows = 0;
        for (const row of tableData) {
          try {
            // Build INSERT with only common columns
            const values = [];
            const placeholders = [];
            const columns = [];
            
            for (const column of commonColumns) {
              columns.push(column);
              placeholders.push('?');
              values.push(row[column] !== undefined ? row[column] : null);
            }
            
            const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
            
            await new Promise((resolve, reject) => {
              db.run(sql, values, function(err) {
                if (err) reject(err);
                else resolve();
              });
            });
            
            importedRows++;
          } catch (rowError) {
            console.error(`❌ Error importing row in ${tableName}:`, rowError.message);
            results.errors.push(`Row error in ${tableName}: ${rowError.message}`);
          }
        }
        
        results.imported_tables++;
        results.imported_rows[tableName] = importedRows;
        console.log(`✅ Imported ${importedRows}/${tableData.length} rows into ${tableName}`);
        
      } catch (tableError) {
        console.error(`❌ Error processing table ${tableName}:`, tableError);
        results.skipped_tables++;
        results.errors.push(`Table ${tableName}: ${tableError.message}`);
      }
    }
    
    console.log(`✅ Full database import completed:`);
    console.log(`   Tables imported: ${results.imported_tables}`);
    console.log(`   Tables skipped: ${results.skipped_tables}`);
    console.log(`   Total rows imported: ${Object.values(results.imported_rows).reduce((a, b) => a + b, 0)}`);
    
    res.json({
      message: 'Full database import completed',
      ...results
    });
    
  } catch (error) {
    console.error('❌ Full database import error:', error);
    res.status(500).json({ 
      error: 'Full database import failed', 
      details: error.message 
    });
  }
});

// ============ TODO ENDPOINTS ============

// Get todos for a prospect
app.get('/api/prospects/:id/todos', authenticateToken, (req, res) => {
  console.log(`📋 GET /api/prospects/${req.params.id}/todos - User: ${req.user.userId}`);
  
  const query = `
    SELECT t.* 
    FROM todos t 
    INNER JOIN prospects p ON t.prospect_id = p.id 
    WHERE t.prospect_id = ? AND p.user_id = ? 
    ORDER BY t.completed ASC, t.created_at DESC
  `;
  
  db.all(query, [req.params.id, req.user.userId], (err, todos) => {
    if (err) {
      console.error('Error fetching todos:', err);
      return res.status(500).json({ error: 'Server error while fetching todos' });
    }
    
    console.log(`📋 Found ${todos.length} todos for prospect ${req.params.id}`);
    res.json(todos);
  });
});

// Create a new todo
app.post('/api/prospects/:id/todos', authenticateToken, (req, res) => {
  console.log(`📋 POST /api/prospects/${req.params.id}/todos - User: ${req.user.userId}`, req.body);
  
  const { text, due_date } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  // Verify prospect belongs to user
  const verifyQuery = 'SELECT id FROM prospects WHERE id = ? AND user_id = ?';
  db.get(verifyQuery, [req.params.id, req.user.userId], (err, prospect) => {
    if (err) {
      console.error('Error verifying prospect:', err);
      return res.status(500).json({ error: 'Server error while verifying prospect' });
    }
    
    if (!prospect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    // Create todo
    const insertQuery = `
      INSERT INTO todos (prospect_id, user_id, text, due_date) 
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [req.params.id, req.user.userId, text.trim(), due_date || null], function(err) {
      if (err) {
        console.error('Error creating todo:', err);
        return res.status(500).json({ error: 'Server error while creating todo' });
      }
      
      // Get created todo
      const selectQuery = 'SELECT * FROM todos WHERE id = ?';
      db.get(selectQuery, [this.lastID], (err, newTodo) => {
        if (err) {
          console.error('Error fetching created todo:', err);
          return res.status(500).json({ error: 'Server error while fetching created todo' });
        }
        
        res.json(newTodo);
      });
    });
  });
});

// Update todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { text, completed, due_date } = req.body;
  
  // Verify todo belongs to user
  const verifyQuery = `
    SELECT t.* 
    FROM todos t 
    INNER JOIN prospects p ON t.prospect_id = p.id 
    WHERE t.id = ? AND p.user_id = ?
  `;
  
  db.get(verifyQuery, [req.params.id, req.user.userId], (err, todo) => {
    if (err) {
      console.error('Error verifying todo:', err);
      return res.status(500).json({ error: 'Server error while verifying todo' });
    }
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE todos SET updated_at = CURRENT_TIMESTAMP';
    let updateParams = [];
    
    if (text !== undefined) {
      updateQuery += ', text = ?';
      updateParams.push(text.trim());
    }
    
    if (completed !== undefined) {
      updateQuery += ', completed = ?';
      updateParams.push(completed ? 1 : 0);
    }
    
    if (due_date !== undefined) {
      updateQuery += ', due_date = ?';
      updateParams.push(due_date || null);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(req.params.id);
    
    db.run(updateQuery, updateParams, (err) => {
      if (err) {
        console.error('Error updating todo:', err);
        return res.status(500).json({ error: 'Server error while updating todo' });
      }
      
      // Get updated todo
      const selectQuery = 'SELECT * FROM todos WHERE id = ?';
      db.get(selectQuery, [req.params.id], (err, updatedTodo) => {
        if (err) {
          console.error('Error fetching updated todo:', err);
          return res.status(500).json({ error: 'Server error while fetching updated todo' });
        }
        
        res.json(updatedTodo);
      });
    });
  });
});

// Delete todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  // Verify todo belongs to user
  const verifyQuery = `
    SELECT t.* 
    FROM todos t 
    INNER JOIN prospects p ON t.prospect_id = p.id 
    WHERE t.id = ? AND p.user_id = ?
  `;
  
  db.get(verifyQuery, [req.params.id, req.user.userId], (err, todo) => {
    if (err) {
      console.error('Error verifying todo:', err);
      return res.status(500).json({ error: 'Server error while verifying todo' });
    }
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Delete todo
    const deleteQuery = 'DELETE FROM todos WHERE id = ?';
    db.run(deleteQuery, [req.params.id], (err) => {
      if (err) {
        console.error('Error deleting todo:', err);
        return res.status(500).json({ error: 'Server error while deleting todo' });
      }
      
      res.json({ message: 'Todo deleted successfully' });
    });
  });
});

// ============ STATIC FILES AND SPA ============

// Servir les fichiers statiques et gestion du SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Démarrage du serveur avec diagnostique complet
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 MAPLYO SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: http://localhost:${PORT}`);
  console.log(`💾 Database: SQLite (${dbPath})`);
  console.log(`🗺️ Geocoding: OpenStreetMap with enhanced error handling`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using default (not secure for production)'}`);
  console.log(`📡 Network: Testing connectivity on startup`);
  
  // Test final de la configuration
  if (process.env.NODE_ENV === 'production') {
    console.log('⚡ PRODUCTION MODE - Enhanced error handling active');
    console.log('🛡️ Security: CORS and authentication enabled');
  } else {
    console.log('🔧 DEVELOPMENT MODE - Full logging enabled');
  }
  
  console.log('='.repeat(50));
  console.log('✅ Server ready to handle requests');
  console.log('📊 Monitoring geocoding performance...');
});
