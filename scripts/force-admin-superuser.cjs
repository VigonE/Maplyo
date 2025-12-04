#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Force admin@maplyo.com to be super_user...\n');

// Déterminer le chemin de la base de données
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'maplyo.db');
console.log('📁 Using database:', dbPath);

// Ouvrir la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
});

// Mettre à jour le rôle
db.run(
  `UPDATE users SET role = 'super_user' WHERE email = 'admin@maplyo.com'`,
  function(err) {
    if (err) {
      console.error('❌ Error updating user role:', err.message);
      db.close();
      process.exit(1);
    }

    if (this.changes === 0) {
      console.log('⚠️  No user found with email admin@maplyo.com');
      console.log('   Please create the account first, then run this script again.');
    } else {
      console.log('✅ Successfully updated admin@maplyo.com to super_user!');
      console.log(`   ${this.changes} row(s) updated\n`);
      
      // Vérifier le changement
      db.get(
        `SELECT id, email, name, role FROM users WHERE email = 'admin@maplyo.com'`,
        (err, row) => {
          if (err) {
            console.error('❌ Error verifying update:', err.message);
          } else if (row) {
            console.log('📊 Current user details:');
            console.log('   ID:', row.id);
            console.log('   Email:', row.email);
            console.log('   Name:', row.name);
            console.log('   Role:', row.role);
          }
          
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('\n✅ Database closed successfully');
            }
          });
        }
      );
    }
  }
);
