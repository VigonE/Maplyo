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

// Configuration du géocodeur
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
});

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
      position TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'cold',
      revenue REAL DEFAULT 0,
      probability_coefficient REAL DEFAULT 100,
      notes TEXT,
      tab_id TEXT DEFAULT 'default',
      display_order INTEGER DEFAULT 0,
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

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createProspectsTable);
    db.run(createTabsTable);
    db.run(createSettingsTable);
    
    // Migration pour ajouter tab_id aux bases de données existantes
    db.run(`ALTER TABLE prospects ADD COLUMN tab_id TEXT DEFAULT 'default'`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.warn('⚠️  Migration warning (this is normal for new databases):', err.message);
      } else if (!err) {
        console.log('✅ Migration applied: added tab_id column');
      }
    });
    
    // Migration pour ajouter display_order aux bases de données existantes
    db.run(`ALTER TABLE prospects ADD COLUMN display_order INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.warn('⚠️  Migration warning (this is normal for new databases):', err.message);
      } else if (!err) {
        console.log('✅ Migration applied: added display_order column');
      }
    });
    
    // Migration pour ajouter probability_coefficient aux bases de données existantes
    db.run(`ALTER TABLE prospects ADD COLUMN probability_coefficient REAL DEFAULT 100`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.warn('⚠️  Migration warning (this is normal for new databases):', err.message);
      } else if (!err) {
        console.log('✅ Migration applied: added probability_coefficient column');
      }
    });
    
    console.log('✅ SQLite database initialized successfully');
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
            hot: 3
          }
        });
      }
      
      try {
        const settings = JSON.parse(row.setting_value);
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
            hot: 3
          }
        });
      }
    }
  );
});

app.post('/api/settings/closing-lead-times', authenticateToken, (req, res) => {
  console.log('💾 Saving closing lead times for user:', req.user.userId);
  
  const { cold, warm, hot } = req.body;
  
  // Validate input
  if (!cold || !warm || !hot || cold < 1 || warm < 1 || hot < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid lead time values. All values must be positive numbers.'
    });
  }
  
  const settingValue = { cold, warm, hot };
  
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
    const { name, email, phone, company, position, address, status, revenue, probability_coefficient, notes, tabId } = req.body;
    console.log('Extracted tabId:', tabId)
    console.log('📝 Creating prospect:', name, 'for tab:', tabId);

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let latitude = null;
    let longitude = null;

    // Géocodage de l'adresse si elle est fournie
    if (address) {
      try {
        console.log('🗺️  Geocoding address:', address);
        const geoResult = await geocoder.geocode(address);
        if (geoResult && geoResult.length > 0) {
          latitude = geoResult[0].latitude;
          longitude = geoResult[0].longitude;
          console.log('📍 Geocoding successful:', latitude, longitude);
        }
      } catch (geoError) {
        console.warn('⚠️  Geocoding failed:', geoError.message);
      }
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
           (user_id, name, email, phone, company, position, address, latitude, longitude, status, revenue, probability_coefficient, notes, tab_id, display_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.userId, name, email || '', phone || '', company || '', 
            position || '', address || '', latitude, longitude, status || 'cold', 
            revenue || 0, probability_coefficient || 100, notes || '', tabId || 'default', 0 // Nouveau prospect en haut
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

// Mettre à jour un prospect
app.put('/api/prospects/:id', authenticateToken, async (req, res) => {
  try {
    const prospectId = req.params.id;
    const { name, email, phone, company, position, address, status, revenue, probability_coefficient, notes, tabId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Vérifier que le prospect appartient à l'utilisateur
    db.get(
      'SELECT id FROM prospects WHERE id = ? AND user_id = ?',
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

        // Géocodage de l'adresse si elle est fournie
        if (address) {
          try {
            const geoResult = await geocoder.geocode(address);
            if (geoResult && geoResult.length > 0) {
              latitude = geoResult[0].latitude;
              longitude = geoResult[0].longitude;
            }
          } catch (geoError) {
            console.warn('Geocoding failed:', geoError.message);
          }
        }

        db.run(
          `UPDATE prospects SET 
           name = ?, email = ?, phone = ?, company = ?, position = ?, 
           address = ?, latitude = ?, longitude = ?, status = ?, revenue = ?, 
           probability_coefficient = ?, notes = ?, tab_id = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
          [
            name, email || '', phone || '', company || '', position || '',
            address || '', latitude, longitude, status || 'cold', 
            revenue || 0, probability_coefficient !== undefined ? probability_coefficient : 100, notes || '', tabId || 'default', prospectId, req.user.userId
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

// Route de géocodage
app.post('/api/geocode', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const geoResult = await geocoder.geocode(address);
    
    if (!geoResult || geoResult.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({
      latitude: geoResult[0].latitude,
      longitude: geoResult[0].longitude,
      formattedAddress: geoResult[0].formattedAddress
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
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
       (user_id, name, email, phone, company, position, address, status, revenue, notes, tab_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userId,
        prospectData.name,
        prospectData.email,
        prospectData.phone,
        prospectData.company,
        prospectData.position,
        prospectData.address,
        prospectData.status,
        prospectData.revenue,
        prospectData.notes,
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

// Servir les fichiers statiques et gestion du SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur Maplyo démarré sur le port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: http://localhost:${PORT}`);
  console.log(`💾 Base de données: SQLite (${dbPath})`);
});
