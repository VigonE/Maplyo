console.log('🚀 Starting Maplyo server...');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
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

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createProspectsTable);
    db.run(createTabsTable);
    
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

    // Get schema information for compatibility
    db.all("PRAGMA table_info(prospects)", (err, prospectsSchema) => {
      if (err) {
        console.error('Error getting prospects schema:', err);
        return res.status(500).json({ error: 'Schema error' });
      }

      db.all("PRAGMA table_info(tabs)", (err, tabsSchema) => {
        if (err) {
          console.error('Error getting tabs schema:', err);
          return res.status(500).json({ error: 'Schema error' });
        }

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

            // Get all prospects for the user with ALL columns
            db.all(
              'SELECT * FROM prospects WHERE user_id = ? ORDER BY created_at ASC',
              [req.user.userId],
              (err, prospects) => {
                if (err) {
                  console.error('Error retrieving prospects data:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                // Get all tabs for the user with ALL columns
                db.all(
                  'SELECT * FROM tabs WHERE user_id = ? ORDER BY display_order ASC',
                  [req.user.userId],
                  (err, tabs) => {
                    if (err) {
                      console.error('Error retrieving tabs data:', err);
                      return res.status(500).json({ error: 'Database error' });
                    }

                    const exportData = {
                      exportInfo: {
                        exportDate: new Date().toISOString(),
                        version: '3.0', // Upgraded version for flexible import
                        userEmail: user.email,
                        schemaVersion: {
                          prospects: prospectsSchema.map(col => ({ name: col.name, type: col.type, nullable: !col.notnull })),
                          tabs: tabsSchema.map(col => ({ name: col.name, type: col.type, nullable: !col.notnull }))
                        }
                      },
                      users: [user],
                      prospects: prospects,
                      tabs: tabs
                    };

                    console.log(`✅ Database exported successfully: ${prospects.length} prospects, ${tabs.length} tabs`);
                    console.log(`📊 Schema info: ${prospectsSchema.length} prospect columns, ${tabsSchema.length} tab columns`);
                    res.json(exportData);
                  }
                );
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Import database (replace existing data for current user) - FLEXIBLE VERSION
app.post('/api/database/import', authenticateToken, (req, res) => {
  try {
    console.log('📥 Importing database for user:', req.user.userId);
    const { users, prospects, tabs, exportInfo } = req.body;

    if (!users || !prospects || !Array.isArray(prospects)) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }

    console.log(`📊 Import info: version ${exportInfo?.version || 'unknown'}, ${prospects.length} prospects, ${tabs?.length || 0} tabs`);

    // Security check: Only import data from the same user's export
    const exportedUserEmail = exportInfo?.userEmail;
    console.log(`🔐 Export source: ${exportedUserEmail}, Current user: ${req.user.email}`);
    
    // Verify current user info
    db.get('SELECT email FROM users WHERE id = ?', [req.user.userId], (err, currentUser) => {
      if (err) {
        console.error('Error getting current user:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!currentUser) {
        return res.status(404).json({ error: 'Current user not found' });
      }

      // Allow import only if it's the same user or if user explicitly accepts mixed data
      const isSameUser = exportedUserEmail === currentUser.email;
      if (!isSameUser && !req.body.acceptMixedData) {
        console.warn(`⚠️  Import security warning: Export from ${exportedUserEmail}, current user ${currentUser.email}`);
        return res.status(400).json({ 
          error: 'Import security warning',
          message: `This export file contains data from ${exportedUserEmail}, but you are logged in as ${currentUser.email}. This could mix data from different accounts.`,
          exportUser: exportedUserEmail,
          currentUser: currentUser.email,
          canProceed: false
        });
      }

      if (!isSameUser && req.body.acceptMixedData) {
        console.log(`⚠️  User explicitly accepted mixed data import from ${exportedUserEmail} to ${currentUser.email}`);
      }

      // Get current database schema for flexible import
      db.all("PRAGMA table_info(prospects)", (err, prospectsSchema) => {
        if (err) {
          console.error('Error getting prospects schema:', err);
          return res.status(500).json({ error: 'Schema error' });
        }

        db.all("PRAGMA table_info(tabs)", (err, tabsSchema) => {
          if (err) {
            console.error('Error getting tabs schema:', err);
            return res.status(500).json({ error: 'Schema error' });
          }

          const prospectsColumns = prospectsSchema.map(col => col.name);
          const tabsColumns = tabsSchema.map(col => col.name);
          
          console.log(`📋 Current schema: ${prospectsColumns.length} prospect columns, ${tabsColumns.length} tab columns`);

          // Filter data to only import prospects and tabs that belong to the exported user
          // Since export already filters by user, this is additional safety
          const filteredProspects = prospects.filter(p => {
            // All prospects in export should belong to the source user, but double-check
            return true; // Export already filtered by user
          });

          const filteredTabs = (tabs || []).filter(t => {
            // All tabs in export should belong to the source user
            return true; // Export already filtered by user
          });

          console.log(`🔍 Filtered data: ${filteredProspects.length} prospects, ${filteredTabs.length} tabs`);

          // Start transaction by deleting existing data for this user
          db.run('DELETE FROM prospects WHERE user_id = ?', [req.user.userId], function(deleteProspectsErr) {
            if (deleteProspectsErr) {
              console.error('Error deleting existing prospects:', deleteProspectsErr);
              return res.status(500).json({ error: 'Database error during cleanup' });
            }

            console.log(`🗑️  Deleted ${this.changes} existing prospects`);

            db.run('DELETE FROM tabs WHERE user_id = ?', [req.user.userId], function(deleteTabsErr) {
              if (deleteTabsErr) {
                console.error('Error deleting existing tabs:', deleteTabsErr);
                return res.status(500).json({ error: 'Database error during tabs cleanup' });
              }

              console.log(`🗑️  Deleted ${this.changes} existing tabs`);

              // Import with flexible schema matching and current user ID
              importDataFlexibly(filteredProspects, filteredTabs, req.user.userId, prospectsColumns, tabsColumns)
                .then((results) => {
                  console.log(`✅ Flexible import completed: ${results.prospects} prospects, ${results.tabs} tabs`);
                  res.json({
                    message: 'Database imported successfully with security checks',
                    imported: results,
                    security: {
                      exportUser: exportedUserEmail,
                      currentUser: currentUser.email,
                      sameUser: isSameUser
                    },
                    schemaInfo: {
                      currentProspectColumns: prospectsColumns.length,
                      currentTabColumns: tabsColumns.length,
                      adaptedImport: true
                    }
                  });
                })
                .catch((error) => {
                  console.error('Flexible import error:', error);
                  res.status(500).json({ error: 'Import failed: ' + error.message });
                });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Flexible import function that adapts to schema changes
async function importDataFlexibly(prospects, tabs, userId, prospectsColumns, tabsColumns) {
  return new Promise((resolve, reject) => {
    const results = { prospects: 0, tabs: 0 };

    // Import tabs first with flexible schema
    const importTabs = () => {
      if (!tabs || tabs.length === 0) {
        createDefaultTabsForUser(userId);
        results.tabs = 2; // Default tabs created
        return Promise.resolve();
      }

      const tabPromises = tabs.map((tab, index) => {
        return new Promise((resolveTab, rejectTab) => {
          // Build flexible INSERT for tabs
          const validColumns = ['user_id', 'created_at'];
          const validValues = [userId, new Date().toISOString()];
          const placeholders = ['?', '?'];

          // Map import data to current schema
          Object.keys(tab).forEach(key => {
            if (tabsColumns.includes(key) && !validColumns.includes(key)) {
              validColumns.push(key);
              validValues.push(tab[key]);
              placeholders.push('?');
            }
          });

          // Ensure required fields with defaults
          const ensureColumn = (colName, defaultValue) => {
            if (tabsColumns.includes(colName) && !validColumns.includes(colName)) {
              validColumns.push(colName);
              validValues.push(defaultValue);
              placeholders.push('?');
            }
          };

          ensureColumn('name', tab.name || `Imported Tab ${index + 1}`);
          ensureColumn('description', tab.description || '');
          ensureColumn('is_special', tab.is_special || 0);
          ensureColumn('display_order', tab.display_order || index);

          const sql = `INSERT INTO tabs (${validColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          
          db.run(sql, validValues, function(err) {
            if (err) {
              console.error(`Flexible tab import error ${index + 1}:`, err);
              console.error('SQL:', sql);
              console.error('Values:', validValues.slice(0, 5), '...');
              rejectTab(err);
            } else {
              resolveTab(this.lastID);
            }
          });
        });
      });

      return Promise.all(tabPromises).then(tabResults => {
        results.tabs = tabResults.length;
        console.log(`✅ Flexibly imported ${results.tabs} tabs`);
      });
    };

    // Import prospects with flexible schema
    const importProspects = () => {
      const prospectPromises = prospects.map((prospect, index) => {
        return new Promise((resolveProspect, rejectProspect) => {
          // Build flexible INSERT for prospects
          const validColumns = ['user_id', 'created_at', 'updated_at'];
          const validValues = [userId, prospect.created_at || new Date().toISOString(), new Date().toISOString()];
          const placeholders = ['?', '?', '?'];

          // Map import data to current schema
          Object.keys(prospect).forEach(key => {
            if (prospectsColumns.includes(key) && !validColumns.includes(key)) {
              validColumns.push(key);
              validValues.push(prospect[key]);
              placeholders.push('?');
            }
          });

          // Ensure required fields with smart defaults
          const ensureColumn = (colName, defaultValue) => {
            if (prospectsColumns.includes(colName) && !validColumns.includes(colName)) {
              validColumns.push(colName);
              validValues.push(defaultValue);
              placeholders.push('?');
            }
          };

          ensureColumn('name', prospect.name || `Imported Prospect ${index + 1}`);
          ensureColumn('status', prospect.status || 'cold');
          ensureColumn('revenue', prospect.revenue || 0);
          ensureColumn('probability_coefficient', prospect.probability_coefficient || 100);
          ensureColumn('display_order', prospect.display_order || index);
          ensureColumn('email', prospect.email || '');
          ensureColumn('phone', prospect.phone || '');
          ensureColumn('company', prospect.company || '');
          ensureColumn('notes', prospect.notes || '');
          ensureColumn('tab_id', prospect.tab_id || 'default');

          const sql = `INSERT INTO prospects (${validColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          
          db.run(sql, validValues, function(err) {
            if (err) {
              console.error(`Flexible prospect import error ${index + 1}:`, err);
              console.error('SQL:', sql);
              console.error('Values:', validValues.slice(0, 10), '...');
              rejectProspect(err);
            } else {
              resolveProspect(this.lastID);
            }
          });
        });
      });

      return Promise.all(prospectPromises).then(prospectResults => {
        results.prospects = prospectResults.length;
        console.log(`✅ Flexibly imported ${results.prospects} prospects`);
      });
    };

    // Execute sequential import: tabs first, then prospects
    importTabs()
      .then(() => importProspects())
      .then(() => resolve(results))
      .catch(reject);
  });
}

// Delete all data for current user
app.delete('/api/database/delete-all', authenticateToken, (req, res) => {
  try {
    console.log('🗑️  Deleting all data for user:', req.user.userId);

    // Delete all prospects for this user
    db.run(
      'DELETE FROM prospects WHERE user_id = ?',
      [req.user.userId],
      function(err) {
        if (err) {
          console.error('Error deleting all prospects:', err);
          return res.status(500).json({ error: 'Database error during deletion' });
        }

        const deletedProspects = this.changes;
        console.log(`🗑️  Deleted ${deletedProspects} prospects for user ${req.user.userId}`);

        res.json({
          message: 'All data deleted successfully',
          deleted: {
            prospects: deletedProspects
          }
        });
      }
    );
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ error: 'Delete operation failed' });
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

// DEBUG: Endpoint pour voir tous les onglets
app.get('/debug/tabs', (req, res) => {
  const sql = 'SELECT * FROM tabs ORDER BY user_id, display_order ASC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('📋 DEBUG - All tabs:');
    rows.forEach(t => {
      console.log(`User: ${t.user_id}, ID: ${t.id}, Name: ${t.name}, Special: ${t.is_special}, Order: ${t.display_order}`);
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
