// Script pour initialiser le super user admin@maplyo.com
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/maplyo.db');

console.log('🔧 Initializing Super User...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function initSuperUser() {
  try {
    // Mot de passe par défaut : Admin123!
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifier si admin@maplyo.com existe déjà
    db.get(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@maplyo.com'],
      (err, row) => {
        if (err) {
          console.error('❌ Error checking user:', err);
          db.close();
          process.exit(1);
        }
        
        if (row) {
          // L'utilisateur existe, mettre à jour son rôle
          console.log('👤 User admin@maplyo.com already exists');
          console.log('📝 Updating role to super_user...');
          
          db.run(
            'UPDATE users SET role = ? WHERE email = ?',
            ['super_user', 'admin@maplyo.com'],
            function(err) {
              if (err) {
                console.error('❌ Error updating role:', err);
                db.close();
                process.exit(1);
              }
              
              console.log('✅ Role updated to super_user for admin@maplyo.com');
              console.log('🔑 Email: admin@maplyo.com');
              console.log('🔑 Password: (unchanged)');
              db.close();
            }
          );
        } else {
          // Créer le super user
          console.log('👤 Creating super user admin@maplyo.com...');
          
          db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            ['admin@maplyo.com', hashedPassword, 'Super Admin', 'super_user'],
            function(err) {
              if (err) {
                console.error('❌ Error creating super user:', err);
                db.close();
                process.exit(1);
              }
              
              console.log('✅ Super User created successfully!');
              console.log('👑 User ID:', this.lastID);
              console.log('📧 Email: admin@maplyo.com');
              console.log('🔑 Password: Admin123!');
              console.log('⚠️  Please change this password after first login!');
              db.close();
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

initSuperUser();
