console.log('🚀 Starting Maplyo server...');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const NodeGeocoder = require('node-geocoder');
require('dotenv').config();
console.log('📦 All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration du géocodeur
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Configuration de la base de données SQLite
const dbPath = path.join(__dirname, '../database/maplyo.db');
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
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createProspectsTable);
    console.log('✅ SQLite database initialized successfully');
  });
}

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

// Routes pour les prospects

// Obtenir tous les prospects
app.get('/api/prospects', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM prospects WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, prospects) => {
      if (err) {
        console.error('Error retrieving prospects:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(prospects);
    }
  );
});

// Créer un nouveau prospect
app.post('/api/prospects', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, company, contact, address, status, revenue, notes } = req.body;
    console.log('📝 Creating prospect:', name);

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

    db.run(
      `INSERT INTO prospects 
       (user_id, name, email, phone, company, contact, address, latitude, longitude, status, revenue, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId, name, email || '', phone || '', company || '', 
        contact || '', address || '', latitude, longitude, status || 'cold', 
        revenue || 0, notes || ''
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
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mettre à jour un prospect
app.put('/api/prospects/:id', authenticateToken, async (req, res) => {
  try {
    const prospectId = req.params.id;
    const { name, email, phone, company, contact, address, status, revenue, notes } = req.body;

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
           name = ?, email = ?, phone = ?, company = ?, contact = ?, 
           address = ?, latitude = ?, longitude = ?, status = ?, revenue = ?, 
           notes = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
          [
            name, email || '', phone || '', company || '', contact || '',
            address || '', latitude, longitude, status || 'cold', 
            revenue || 0, notes || '', prospectId, req.user.userId
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

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Maplyo API is running!',
    timestamp: new Date().toISOString(),
    database: 'SQLite'
  });
});

// Servir les fichiers statiques du frontend en production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Gestion des erreurs globales
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Fermeture propre de la base de données
process.on('SIGINT', () => {
  console.log('\n🔄 Fermeture de la base de données...');
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur lors de la fermeture de la base de données:', err.message);
    } else {
      console.log('✅ Base de données fermée.');
    }
    process.exit(0);
  });
});

// Démarrer le serveur
console.log('🌐 Starting Express server...');
app.listen(PORT, () => {
  console.log(`🚀 Serveur Maplyo démarré sur le port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💾 Base de données: SQLite (${dbPath})`);
});
