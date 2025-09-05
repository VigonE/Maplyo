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
app.use(express.json({ limit: '50mb' })); // Augmenter la limite pour les imports de base de données
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createProspectsTable);
    
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
      // Log des premiers prospects pour vérifier l'ordre
      if (prospects.length > 0) {
        const firstFive = prospects.slice(0, 5);
        console.log('🔍 First 5 prospects order:', firstFive.map(p => ({ id: p.id, name: p.name, display_order: p.display_order, status: p.status })));
        
        // Log des prospects HOT spécifiquement
        const hotProspects = prospects.filter(p => p.status === 'hot').slice(0, 5);
        if (hotProspects.length > 0) {
          console.log('🔥 HOT prospects order:', hotProspects.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
        }
      }

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

// Réordonner les prospects dans une catégorie spécifique
app.put('/api/prospects/reorder-category', authenticateToken, (req, res) => {
  try {
    const { status, order } = req.body;
    
    if (!status || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'Status and order array are required' });
    }

    console.log('🔄 Reordering prospects in category:', status, 'for user:', req.user.userId);
    console.log('📋 New order for category:', order);

    // Mettre à jour l'ordre des prospects dans cette catégorie spécifique
    const updatePromises = order.map((prospectId, index) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE prospects SET display_order = ? WHERE id = ? AND user_id = ? AND status = ?',
          [index, prospectId, req.user.userId, status],
          function(err) {
            if (err) {
              console.error(`Error updating prospect ${prospectId}:`, err);
              reject(err);
            } else {
              console.log(`✅ Updated prospect ${prospectId} to position ${index} in category ${status}`);
              resolve(this.changes);
            }
          }
        );
      });
    });

    // Exécuter toutes les mises à jour
    Promise.all(updatePromises)
      .then((results) => {
        const totalUpdated = results.reduce((sum, changes) => sum + changes, 0);
        console.log(`✅ Updated ${totalUpdated} prospects order in category ${status}`);
        
        res.json({ 
          message: `Prospects reordered successfully in category ${status}`,
          updated: totalUpdated,
          category: status
        });
      })
      .catch((error) => {
        console.error('Error in category reorder transaction:', error);
        res.status(500).json({ error: 'Failed to reorder prospects in category' });
      });

  } catch (error) {
    console.error('Error reordering prospects in category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Réordonner les prospects (DOIT ÊTRE AVANT la route :id)
app.put('/api/prospects/reorder', authenticateToken, (req, res) => {
  try {
    const { order } = req.body;
    
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'Order array is required' });
    }

    console.log('🔄 Reordering prospects for user:', req.user.userId);
    console.log('📋 New order:', order);

    // D'abord, récupérer tous les prospects de l'utilisateur
    db.all(
      'SELECT id FROM prospects WHERE user_id = ? ORDER BY display_order ASC, created_at DESC',
      [req.user.userId],
      (err, allProspects) => {
        if (err) {
          console.error('Error fetching prospects for reorder:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Créer l'ordre complet : prospects dans l'ordre fourni + prospects non inclus
        const allProspectIds = allProspects.map(p => p.id);
        const reorderedIds = [...order];
        
        // Ajouter les prospects non inclus dans l'ordre à la fin
        allProspectIds.forEach(id => {
          if (!reorderedIds.includes(id)) {
            reorderedIds.push(id);
          }
        });

        console.log('📋 Complete reorder with all prospects:', reorderedIds);

        // Préparer les requêtes de mise à jour pour tous les prospects
        const updatePromises = reorderedIds.map((prospectId, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              'UPDATE prospects SET display_order = ? WHERE id = ? AND user_id = ?',
              [index, prospectId, req.user.userId],
              function(err) {
                if (err) {
                  console.error(`Error updating prospect ${prospectId}:`, err);
                  reject(err);
                } else {
                  console.log(`✅ Updated prospect ${prospectId} to position ${index}`);
                  resolve(this.changes);
                }
              }
            );
          });
        });

        // Exécuter toutes les mises à jour
        Promise.all(updatePromises)
          .then((results) => {
            const totalUpdated = results.reduce((sum, changes) => sum + changes, 0);
            console.log(`✅ Updated ${totalUpdated} prospects order`);
            
            res.json({ 
              message: 'Prospects reordered successfully',
              updated: totalUpdated,
              totalProspects: reorderedIds.length
            });
          })
          .catch((error) => {
            console.error('Error in reorder transaction:', error);
            res.status(500).json({ error: 'Failed to reorder prospects' });
          });
      }
    );

  } catch (error) {
    console.error('Error reordering prospects:', error);
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

// Database management routes

// Export entire database for current user
app.get('/api/database/export', authenticateToken, (req, res) => {
  try {
    console.log('📋 Exporting database for user:', req.user.userId);

    // Get user data
    db.get(
      'SELECT id, email, name, company, created_at FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('Error retrieving user data:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Get all prospects for the user
        db.all(
          'SELECT * FROM prospects WHERE user_id = ? ORDER BY created_at ASC',
          [req.user.userId],
          (err, prospects) => {
            if (err) {
              console.error('Error retrieving prospects data:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            const exportData = {
              exportInfo: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                userEmail: user.email
              },
              users: [user],
              prospects: prospects
            };

            console.log(`✅ Database exported successfully: ${prospects.length} prospects`);
            res.json(exportData);
          }
        );
      }
    );
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Import database (replace existing data for current user)
app.post('/api/database/import', authenticateToken, (req, res) => {
  try {
    console.log('📥 Importing database for user:', req.user.userId);
    const { users, prospects } = req.body;

    if (!users || !prospects || !Array.isArray(prospects)) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }

    // Start transaction by deleting existing prospects for this user
    db.run(
      'DELETE FROM prospects WHERE user_id = ?',
      [req.user.userId],
      function(deleteErr) {
        if (deleteErr) {
          console.error('Error deleting existing prospects:', deleteErr);
          return res.status(500).json({ error: 'Database error during cleanup' });
        }

        console.log(`🗑️  Deleted ${this.changes} existing prospects`);

        // Import prospects
        const importPromises = prospects.map((prospect, index) => {
          return new Promise((resolve, reject) => {
            const {
              name, email, phone, company, position, address, latitude, longitude,
              status, revenue, probability_coefficient, notes, tab_id, display_order, created_at
            } = prospect;

            db.run(
              `INSERT INTO prospects 
               (user_id, name, email, phone, company, position, address, latitude, longitude, 
                status, revenue, probability_coefficient, notes, tab_id, display_order, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                req.user.userId, name || '', email || '', phone || '', company || '',
                position || '', address || '', latitude, longitude, status || 'cold',
                revenue || 0, probability_coefficient || 100, notes || '',
                tab_id || 'default', display_order || index, created_at || new Date().toISOString()
              ],
              function(err) {
                if (err) {
                  console.error(`Error importing prospect ${index + 1}:`, err);
                  reject(err);
                } else {
                  resolve(this.lastID);
                }
              }
            );
          });
        });

        // Execute all imports
        Promise.all(importPromises)
          .then((results) => {
            console.log(`✅ Imported ${results.length} prospects successfully`);
            res.json({
              message: 'Database imported successfully',
              imported: {
                prospects: results.length
              }
            });
          })
          .catch((error) => {
            console.error('Error during import:', error);
            res.status(500).json({ error: 'Import failed during data insertion' });
          });
      }
    );
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed' });
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

// DEBUG: Endpoint temporaire pour voir les données
app.get('/debug/prospects', (req, res) => {
  const sql = 'SELECT id, name, status, display_order FROM prospects ORDER BY display_order ASC, created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('🔍 DEBUG - All prospects with display_order:');
    rows.slice(0, 20).forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Status: ${p.status}, Display Order: ${p.display_order}`);
    });
    res.json(rows);
  });
});

// DEBUG: Endpoint pour voir les prospects HOT uniquement
app.get('/debug/prospects/hot', (req, res) => {
  const sql = "SELECT id, name, status, display_order FROM prospects WHERE status = 'hot' ORDER BY display_order ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('🔥 DEBUG - HOT prospects with display_order:');
    rows.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Display Order: ${p.display_order}`);
    });
    res.json(rows);
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
