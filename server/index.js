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
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        potential_revenue DECIMAL(12, 2) NOT NULL,
        probability_coefficient DECIMAL(5, 2) DEFAULT 100.00,
        stage ENUM('prospect', 'quote', 'order_1m', 'order_6m', 'won', 'lost') DEFAULT 'prospect',
        color VARCHAR(7) DEFAULT '#3b82f6',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
      notes 
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

    // Insert prospect with probability coefficient (default to 100% if not provided)
    const probabilityCoeff = probability_coefficient !== undefined ? probability_coefficient : 100.00
    const [result] = await db.execute(
      'INSERT INTO prospects (user_id, name, email, phone, company, position, address, latitude, longitude, revenue, probability_coefficient, status, tabId, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, email, phone, company, position, address, latitude, longitude, revenue, probabilityCoeff, status, tabId, notes, sortOrder]
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
      notes 
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

    // Update prospect
    await db.execute(
      'UPDATE prospects SET name = ?, email = ?, phone = ?, company = ?, position = ?, address = ?, latitude = ?, longitude = ?, revenue = ?, probability_coefficient = ?, status = ?, tabId = ?, notes = ? WHERE id = ? AND user_id = ?',
      [name, email, phone, company, position, address, latitude, longitude, revenue, probabilityCoeff, status, tabId, notes, id, req.user.id]
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

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur Maplyo démarré sur le port ${PORT}`)
  })
})
