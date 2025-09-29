const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const NodeGeocoder = require('node-geocoder')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'maplyo',
  port: process.env.DB_PORT || 3306
}

// Geocoder setup
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to calculate estimated completion date
const calculateEstimatedCompletionDate = async (userId, status, providedDate = null) => {
  if (providedDate) {
    return providedDate
  }

  // Get user's lead times settings
  const db = await mysql.createConnection(dbConfig)
  try {
    const [settings] = await db.execute(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [userId, 'closing_lead_times']
    )
    
    // Default lead times if no settings found
    const defaultLeadTimes = { cold: 12, warm: 6, hot: 3 }
    const leadTimes = settings.length > 0 ? settings[0].setting_value : defaultLeadTimes
    
    // Get lead time for the status (category)
    let leadTimeMonths = defaultLeadTimes.cold // Default to cold
    if (status === 'hot') {
      leadTimeMonths = leadTimes.hot || 3
    } else if (status === 'warm') {
      leadTimeMonths = leadTimes.warm || 6
    } else if (status === 'cold') {
      leadTimeMonths = leadTimes.cold || 12
    }
    
    // Calculate estimated completion date: current date + lead time
    const estimatedDate = new Date()
    estimatedDate.setMonth(estimatedDate.getMonth() + leadTimeMonths)
    
    return estimatedDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } finally {
    await db.end()
  }
}

// Helper function to calculate next followup date for recurring prospects
const calculateNextFollowupDate = (recurrenceMonths = 12) => {
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + recurrenceMonths)
  return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' })
    }
    req.user = user
    next()
  })
}

// Initialize database
async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    })

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.end()

    // Connect to the database
    const db = await mysql.createConnection(dbConfig)

    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS prospects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255),
        company VARCHAR(255),
        position VARCHAR(255),
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        revenue DECIMAL(12, 2) NOT NULL,
        probability_coefficient DECIMAL(5, 2) DEFAULT 100.00,
        status ENUM('cold', 'warm', 'hot', 'won', 'lost', 'recurring') DEFAULT 'cold',
        tabId VARCHAR(255),
        notes TEXT,
        color VARCHAR(7) DEFAULT '#3b82f6',
        sort_order INT DEFAULT 0,
        estimated_completion_date DATE,
        recurrence_months INT DEFAULT 12,
        next_followup_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create settings table for system configuration
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        setting_key VARCHAR(255) NOT NULL,
        setting_value JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_setting (user_id, setting_key)
      )
    `)

    // Create todos table for prospect tasks
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prospect_id INT NOT NULL,
        user_id INT NOT NULL,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        due_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_prospect_todos (prospect_id),
        INDEX idx_user_todos (user_id)
      )
    `)

    // Add probability_coefficient column if it doesn't exist (migration for existing databases)
    try {
      await db.execute(`
        ALTER TABLE prospects 
        ADD COLUMN probability_coefficient DECIMAL(5, 2) DEFAULT 100.00
      `)
      console.log('Added probability_coefficient column to prospects table')
    } catch (error) {
      // Column already exists or other error - ignore
      if (!error.message.includes('Duplicate column name')) {
        console.log('Column probability_coefficient may already exist:', error.message)
      }
    }

    // Add estimated_completion_date column if it doesn't exist (migration for existing databases)
    try {
      await db.execute(`
        ALTER TABLE prospects 
        ADD COLUMN estimated_completion_date DATE
      `)
      console.log('Added estimated_completion_date column to prospects table')
    } catch (error) {
      // Column already exists or other error - ignore
      if (!error.message.includes('Duplicate column name')) {
        console.log('Column estimated_completion_date may already exist:', error.message)
      }
    }

    // Migrate potential_revenue to revenue column if needed
    try {
      await db.execute(`
        ALTER TABLE prospects 
        ADD COLUMN revenue DECIMAL(12, 2) DEFAULT 0
      `)
      console.log('Added revenue column to prospects table')
      
      // Copy data from potential_revenue to revenue if potential_revenue exists
      try {
        await db.execute(`
          UPDATE prospects 
          SET revenue = potential_revenue 
          WHERE revenue IS NULL OR revenue = 0
        `)
        console.log('Migrated data from potential_revenue to revenue')
      } catch (migrateError) {
        console.log('Data migration skipped:', migrateError.message)
      }
    } catch (error) {
      // Column already exists - ignore
      if (!error.message.includes('Duplicate column name')) {
        console.log('Column revenue may already exist:', error.message)
      }
    }

    // Add missing columns for complete prospect data
    const columnsToAdd = [
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'phone', type: 'VARCHAR(255)' },
      { name: 'company', type: 'VARCHAR(255)' },
      { name: 'position', type: 'VARCHAR(255)' },
      { name: 'tabId', type: 'VARCHAR(255)' },
      { name: 'notes', type: 'TEXT' }
    ]

    for (const column of columnsToAdd) {
      try {
        await db.execute(`
          ALTER TABLE prospects 
          ADD COLUMN ${column.name} ${column.type}
        `)
        console.log(`Added ${column.name} column to prospects table`)
      } catch (error) {
        // Column already exists - ignore
        if (!error.message.includes('Duplicate column name')) {
          console.log(`Column ${column.name} may already exist:`, error.message)
        }
      }
    }

    // Update status column to use new ENUM values if needed
    try {
      await db.execute(`
        ALTER TABLE prospects 
        MODIFY COLUMN status ENUM('cold', 'warm', 'hot', 'won', 'lost', 'recurring') DEFAULT 'cold'
      `)
      console.log('Updated status column ENUM values')
    } catch (error) {
      console.log('Status column update may have failed (this is normal for new tables):', error.message)
    }

    // Add recurrence_months column if it doesn't exist
    try {
      await db.execute(`
        ALTER TABLE prospects 
        ADD COLUMN recurrence_months INT DEFAULT 12
      `)
      console.log('Added recurrence_months column to prospects table')
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log('Column recurrence_months may already exist:', error.message)
      }
    }

    // Add next_followup_date column if it doesn't exist
    try {
      await db.execute(`
        ALTER TABLE prospects 
        ADD COLUMN next_followup_date DATE
      `)
      console.log('Added next_followup_date column to prospects table')
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log('Column next_followup_date may already exist:', error.message)
      }
    }

    return db
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error)
    process.exit(1)
  }
}

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      await db.end()
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    // Generate token
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' })

    await db.end()
    res.json({ token, user: { id: result.insertId, name, email } })
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      await db.end()
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    const user = users[0]

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      await db.end()
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })

    await db.end()
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [users] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [req.user.id])
    await db.end()

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    res.json(users[0])
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Settings routes
// Get closing lead times
app.get('/api/settings/closing-lead-times', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [settings] = await db.execute(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [req.user.id, 'closing_lead_times']
    )
    await db.end()

    if (settings.length === 0) {
      // Return default values if no settings found
      return res.json({
        success: true,
        settings: {
          cold: 12,
          warm: 6,
          hot: 3
        }
      })
    }

    res.json({
      success: true,
      settings: settings[0].setting_value
    })
  } catch (error) {
    console.error('Error loading closing lead times:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du chargement des paramètres' 
    })
  }
})

// Save closing lead times
app.post('/api/settings/closing-lead-times', authenticateToken, async (req, res) => {
  try {
    const { cold, warm, hot } = req.body
    
    // Validate input
    if (!cold || !warm || !hot || cold < 1 || warm < 1 || hot < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valeurs invalides pour les temps de closing'
      })
    }

    const settingValue = { cold, warm, hot }
    
    const db = await mysql.createConnection(dbConfig)
    
    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both insert and update
    await db.execute(`
      INSERT INTO settings (user_id, setting_key, setting_value) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, 'closing_lead_times', JSON.stringify(settingValue)])
    
    await db.end()

    res.json({
      success: true,
      message: 'Paramètres de closing lead time sauvegardés avec succès'
    })
  } catch (error) {
    console.error('Error saving closing lead times:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la sauvegarde des paramètres' 
    })
  }
})

app.get('/api/settings/closing-lead-times', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [settings] = await db.execute(
      'SELECT setting_value FROM settings WHERE user_id = ? AND setting_key = ?',
      [req.user.id, 'closing_lead_times']
    )
    await db.end()

    if (settings.length === 0) {
      // Return default values if no settings found
      return res.json({
        success: true,
        settings: {
          cold: 12,
          warm: 6,
          hot: 3
        }
      })
    }

    res.json({
      success: true,
      settings: settings[0].setting_value
    })
  } catch (error) {
    console.error('Error fetching closing lead times:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    })
  }
})

app.post('/api/settings/closing-lead-times', authenticateToken, async (req, res) => {
  try {
    const { cold, warm, hot } = req.body

    // Validate input
    if (!cold || !warm || !hot || cold < 1 || warm < 1 || hot < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead time values. All values must be positive numbers.'
      })
    }

    const settingValue = { cold, warm, hot }

    const db = await mysql.createConnection(dbConfig)
    
    // Use ON DUPLICATE KEY UPDATE to handle insert or update
    await db.execute(`
      INSERT INTO settings (user_id, setting_key, setting_value) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, 'closing_lead_times', JSON.stringify(settingValue)])
    
    await db.end()

    res.json({
      success: true,
      message: 'Closing lead time settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving closing lead times:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    })
  }
})

app.get('/api/prospects', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [prospects] = await db.execute(
      'SELECT * FROM prospects WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC',
      [req.user.id]
    )
    await db.end()
    res.json(prospects)
  } catch (error) {
    console.error('Erreur lors de la récupération des prospects:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Get recurring prospects that need followup
app.get('/api/prospects/recurring/due', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [prospects] = await db.execute(
      `SELECT * FROM prospects 
       WHERE user_id = ? 
       AND status = 'recurring' 
       AND next_followup_date <= CURDATE() 
       ORDER BY next_followup_date ASC`,
      [req.user.id]
    )
    await db.end()
    res.json(prospects)
  } catch (error) {
    console.error('Erreur lors de la récupération des prospects recurring dus:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Mark recurring prospect as followed up and set next followup date
app.put('/api/prospects/:id/followup', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { recurrence_months } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Check ownership and that it's a recurring prospect
    const [existing] = await db.execute(
      'SELECT * FROM prospects WHERE id = ? AND user_id = ? AND status = "recurring"',
      [id, req.user.id]
    )

    if (existing.length === 0) {
      await db.end()
      return res.status(404).json({ message: 'Prospect recurring non trouvé' })
    }

    const prospect = existing[0]
    const recurrenceMonthsValue = recurrence_months || prospect.recurrence_months || 12
    const nextFollowupDate = calculateNextFollowupDate(recurrenceMonthsValue)

    // Update next followup date and recurrence if provided
    await db.execute(
      'UPDATE prospects SET next_followup_date = ?, recurrence_months = ? WHERE id = ? AND user_id = ?',
      [nextFollowupDate, recurrenceMonthsValue, id, req.user.id]
    )

    // Get updated prospect
    const [updated] = await db.execute('SELECT * FROM prospects WHERE id = ?', [id])
    await db.end()

    res.json(updated[0])
  } catch (error) {
    console.error('Erreur lors de la mise à jour du suivi recurring:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.post('/api/prospects', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      company, 
      position, 
      address, 
      revenue, 
      probability_coefficient, 
      status, 
      tabId, 
      notes,
      notes_daily_metadata,
      estimated_completion_date,
      recurrence_months
    } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Geocode address
    let latitude = null, longitude = null
    try {
      const results = await geocoder.geocode(address)
      if (results.length > 0) {
        latitude = results[0].latitude
        longitude = results[0].longitude
      }
    } catch (geocodeError) {
      console.warn('Erreur de géocodage:', geocodeError.message)
    }

    // Get next sort order
    const [maxOrder] = await db.execute(
      'SELECT MAX(sort_order) as max_order FROM prospects WHERE user_id = ?',
      [req.user.id]
    )
    const sortOrder = (maxOrder[0].max_order || 0) + 1

    // Calculate estimated completion date
    let estimatedDate = null
    let nextFollowupDate = null
    
    if (status === 'recurring') {
      // For recurring prospects, calculate next followup date
      const recurrenceMonthsValue = recurrence_months || 12
      nextFollowupDate = calculateNextFollowupDate(recurrenceMonthsValue)
    } else {
      // For regular prospects, calculate estimated completion date
      estimatedDate = await calculateEstimatedCompletionDate(
        req.user.id, 
        status || 'cold', 
        estimated_completion_date
      )
    }

    // Insert prospect with probability coefficient (default to 100% if not provided)
    const probabilityCoeff = probability_coefficient !== undefined ? probability_coefficient : 100.00
    const recurrenceMonthsValue = status === 'recurring' ? (recurrence_months || 12) : null
    
    const [result] = await db.execute(
      'INSERT INTO prospects (user_id, name, email, phone, company, position, address, latitude, longitude, revenue, probability_coefficient, status, tabId, notes, sort_order, estimated_completion_date, recurrence_months, next_followup_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, email, phone, company, position, address, latitude, longitude, revenue, probabilityCoeff, status, tabId, notes, sortOrder, estimatedDate, recurrenceMonthsValue, nextFollowupDate]
    )

    // Get created prospect
    const [prospects] = await db.execute('SELECT * FROM prospects WHERE id = ?', [result.insertId])
    await db.end()

    res.status(201).json(prospects[0])
  } catch (error) {
    console.error('Erreur lors de la création du prospect:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.put('/api/prospects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { 
      name, 
      email, 
      phone, 
      company, 
      position, 
      address, 
      revenue, 
      probability_coefficient, 
      status, 
      tabId, 
      notes,
      notes_daily_metadata,
      estimated_completion_date,
      recurrence_months
    } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Check ownership
    const [existing] = await db.execute(
      'SELECT * FROM prospects WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (existing.length === 0) {
      await db.end()
      return res.status(404).json({ message: 'Prospect non trouvé' })
    }

    const prospect = existing[0]

    // Geocode if address changed
    let latitude = prospect.latitude, longitude = prospect.longitude
    if (address !== prospect.address) {
      try {
        const results = await geocoder.geocode(address)
        if (results.length > 0) {
          latitude = results[0].latitude
          longitude = results[0].longitude
        }
      } catch (geocodeError) {
        console.warn('Erreur de géocodage:', geocodeError.message)
      }
    }

    // Use existing probability coefficient if not provided
    const probabilityCoeff = probability_coefficient !== undefined ? probability_coefficient : prospect.probability_coefficient

    // Calculate dates based on status
    let estimatedDate = prospect.estimated_completion_date
    let nextFollowupDate = prospect.next_followup_date
    let recurrenceMonthsValue = prospect.recurrence_months

    if (status === 'recurring') {
      // Moving to or updating recurring status
      recurrenceMonthsValue = recurrence_months || prospect.recurrence_months || 12
      nextFollowupDate = calculateNextFollowupDate(recurrenceMonthsValue)
      estimatedDate = null // Clear estimated completion date for recurring
    } else if (prospect.status === 'recurring' && status !== 'recurring') {
      // Moving from recurring to regular status
      recurrenceMonthsValue = null
      nextFollowupDate = null
      estimatedDate = await calculateEstimatedCompletionDate(
        req.user.id, 
        status || prospect.status, 
        estimated_completion_date
      )
    } else if (status !== prospect.status) {
      // Status changed for regular prospects
      estimatedDate = await calculateEstimatedCompletionDate(
        req.user.id, 
        status || prospect.status, 
        estimated_completion_date
      )
    } else if (estimated_completion_date !== undefined) {
      // Manually setting estimated date
      estimatedDate = estimated_completion_date
    }

    // Update prospect
    await db.execute(
      'UPDATE prospects SET name = ?, email = ?, phone = ?, company = ?, position = ?, address = ?, latitude = ?, longitude = ?, revenue = ?, probability_coefficient = ?, status = ?, tabId = ?, notes = ?, estimated_completion_date = ?, recurrence_months = ?, next_followup_date = ? WHERE id = ? AND user_id = ?',
      [name, email, phone, company, position, address, latitude, longitude, revenue, probabilityCoeff, status, tabId, notes, estimatedDate, recurrenceMonthsValue, nextFollowupDate, id, req.user.id]
    )

    // Get updated prospect
    const [updated] = await db.execute('SELECT * FROM prospects WHERE id = ?', [id])
    await db.end()

    res.json(updated[0])
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prospect:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.delete('/api/prospects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = await mysql.createConnection(dbConfig)

    const [result] = await db.execute(
      'DELETE FROM prospects WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    await db.end()

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prospect non trouvé' })
    }

    res.json({ message: 'Prospect supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du prospect:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.put('/api/prospects/reorder', authenticateToken, async (req, res) => {
  try {
    const { order } = req.body
    const db = await mysql.createConnection(dbConfig)

    // Update sort order for each prospect
    for (let i = 0; i < order.length; i++) {
      await db.execute(
        'UPDATE prospects SET sort_order = ? WHERE id = ? AND user_id = ?',
        [i, order[i], req.user.id]
      )
    }

    await db.end()
    res.json({ message: 'Ordre mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur lors du réordonnancement:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Endpoint optimisé pour les mises à jour batch
app.put('/api/prospects/batch-update', authenticateToken, async (req, res) => {
  try {
    const { updates } = req.body
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Invalid updates array' })
    }

    const db = await mysql.createConnection(dbConfig)
    
    // Commencer une transaction pour assurer la cohérence
    await db.beginTransaction()
    
    try {
      // Traiter chaque mise à jour
      for (const update of updates) {
        const { id, ...updateData } = update
        
        if (!id) continue
        
        // Construire la requête de mise à jour dynamiquement
        const fields = []
        const values = []
        
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`)
            values.push(updateData[key])
          }
        })
        
        if (fields.length > 0) {
          values.push(id, req.user.id)
          
          const query = `UPDATE prospects SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
          await db.execute(query, values)
        }
      }
      
      // Confirmer la transaction
      await db.commit()
      await db.end()
      
      res.json({ 
        message: 'Batch update completed successfully',
        updated: updates.length 
      })
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await db.rollback()
      await db.end()
      throw error
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour batch:', error)
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour batch' })
  }
})

// Endpoint optimisé pour le réordonnancement par catégorie
app.put('/api/prospects/reorder-category', authenticateToken, async (req, res) => {
  try {
    const { status, order } = req.body
    
    if (!status || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Status and order array are required' })
    }

    const db = await mysql.createConnection(dbConfig)
    
    // Commencer une transaction
    await db.beginTransaction()
    
    try {
      // Mettre à jour l'ordre des prospects dans cette catégorie
      for (let i = 0; i < order.length; i++) {
        await db.execute(
          'UPDATE prospects SET display_order = ? WHERE id = ? AND user_id = ? AND status = ?',
          [i, order[i], req.user.id, status]
        )
      }
      
      // Confirmer la transaction
      await db.commit()
      await db.end()
      
      res.json({ 
        message: 'Category reorder completed successfully',
        status,
        updated: order.length 
      })
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await db.rollback()
      await db.end()
      throw error
    }
  } catch (error) {
    console.error('Erreur lors du réordonnancement par catégorie:', error)
    res.status(500).json({ message: 'Erreur serveur lors du réordonnancement' })
  }
})

// ============ TODO ENDPOINTS ============

// Get todos for a prospect
app.get('/api/prospects/:id/todos', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    const [todos] = await db.execute(`
      SELECT t.* 
      FROM todos t 
      INNER JOIN prospects p ON t.prospect_id = p.id 
      WHERE t.prospect_id = ? AND p.user_id = ? 
      ORDER BY t.completed ASC, t.created_at DESC
    `, [req.params.id, req.user.id])
    
    await db.end()
    res.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ error: 'Server error while fetching todos' })
  }
})

// Create a new todo
app.post('/api/prospects/:id/todos', authenticateToken, async (req, res) => {
  try {
    const { text, due_date } = req.body
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' })
    }

    const db = await mysql.createConnection(dbConfig)
    
    // Verify prospect belongs to user
    const [prospects] = await db.execute(
      'SELECT id FROM prospects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    
    if (prospects.length === 0) {
      await db.end()
      return res.status(404).json({ error: 'Prospect not found' })
    }

    // Create todo
    const [result] = await db.execute(`
      INSERT INTO todos (prospect_id, user_id, text, due_date) 
      VALUES (?, ?, ?, ?)
    `, [req.params.id, req.user.id, text.trim(), due_date || null])
    
    // Get created todo
    const [newTodo] = await db.execute(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    )
    
    await db.end()
    res.json(newTodo[0])
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Server error while creating todo' })
  }
})

// Update todo
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { text, completed, due_date } = req.body
    const db = await mysql.createConnection(dbConfig)
    
    // Verify todo belongs to user
    const [todos] = await db.execute(`
      SELECT t.* 
      FROM todos t 
      INNER JOIN prospects p ON t.prospect_id = p.id 
      WHERE t.id = ? AND p.user_id = ?
    `, [req.params.id, req.user.id])
    
    if (todos.length === 0) {
      await db.end()
      return res.status(404).json({ error: 'Todo not found' })
    }

    // Update todo
    let updateQuery = 'UPDATE todos SET updated_at = CURRENT_TIMESTAMP'
    let updateParams = []
    
    if (text !== undefined) {
      updateQuery += ', text = ?'
      updateParams.push(text.trim())
    }
    
    if (completed !== undefined) {
      updateQuery += ', completed = ?'
      updateParams.push(completed)
    }
    
    if (due_date !== undefined) {
      updateQuery += ', due_date = ?'
      updateParams.push(due_date || null)
    }
    
    updateQuery += ' WHERE id = ?'
    updateParams.push(req.params.id)
    
    await db.execute(updateQuery, updateParams)
    
    // Get updated todo
    const [updatedTodo] = await db.execute(
      'SELECT * FROM todos WHERE id = ?',
      [req.params.id]
    )
    
    await db.end()
    res.json(updatedTodo[0])
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Server error while updating todo' })
  }
})

// Delete todo
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    
    // Verify todo belongs to user
    const [todos] = await db.execute(`
      SELECT t.* 
      FROM todos t 
      INNER JOIN prospects p ON t.prospect_id = p.id 
      WHERE t.id = ? AND p.user_id = ?
    `, [req.params.id, req.user.id])
    
    if (todos.length === 0) {
      await db.end()
      return res.status(404).json({ error: 'Todo not found' })
    }

    // Delete todo
    await db.execute('DELETE FROM todos WHERE id = ?', [req.params.id])
    
    await db.end()
    res.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ error: 'Server error while deleting todo' })
  }
})

// ============ ADMIN ENDPOINTS ============

// Delete all data endpoint (admin only)
app.delete('/api/database/delete-all', authenticateToken, async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig)
    
    // Delete all prospects for the user
    const [prospectsResult] = await db.execute(
      'DELETE FROM prospects WHERE user_id = ?',
      [req.user.id]
    )
    
    // Delete all tabs for the user (except special tabs)
    const [tabsResult] = await db.execute(
      'DELETE FROM tabs WHERE user_id = ? AND is_special = FALSE',
      [req.user.id]
    )
    
    await db.end()
    
    res.json({ 
      message: 'All data deleted successfully',
      deleted: {
        prospects: prospectsResult.affectedRows,
        tabs: tabsResult.affectedRows
      }
    })
  } catch (error) {
    console.error('Error deleting all data:', error)
    res.status(500).json({ error: 'Server error while deleting data' })
  }
})

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur Maplyo démarré sur le port ${PORT}`)
  })
})
