// Script d'initialisation du Super User
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/maplyo.db');
const db = new sqlite3.Database(dbPath);

const SUPER_USER_EMAIL = 'admin@maplyo.com';
const SUPER_USER_PASSWORD = 'Admin123!'; // À changer après la première connexion
const SUPER_USER_NAME = 'Super Admin';

async function initializeSuperUser() {
  console.log('🔧 Initializing Super User...');
  
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(SUPER_USER_PASSWORD, 10);
    
    // Vérifier si le super user existe déjà
    db.get(
      'SELECT id, role FROM users WHERE email = ?',
      [SUPER_USER_EMAIL],
      (err, user) => {
        if (err) {
          console.error('❌ Database error:', err);
          process.exit(1);
        }
        
        if (user) {
          // Si l'utilisateur existe, mettre à jour son rôle
          if (user.role !== 'super_user') {
            db.run(
              'UPDATE users SET role = ? WHERE email = ?',
              ['super_user', SUPER_USER_EMAIL],
              (err) => {
                if (err) {
                  console.error('❌ Error updating super user role:', err);
                  process.exit(1);
                }
                console.log('✅ Super User role updated successfully');
                console.log(`📧 Email: ${SUPER_USER_EMAIL}`);
                db.close();
              }
            );
          } else {
            console.log('✅ Super User already exists with correct role');
            console.log(`📧 Email: ${SUPER_USER_EMAIL}`);
            db.close();
          }
        } else {
          // Créer le super user
          db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [SUPER_USER_EMAIL, hashedPassword, SUPER_USER_NAME, 'super_user'],
            function(err) {
              if (err) {
                console.error('❌ Error creating super user:', err);
                process.exit(1);
              }
              
              console.log('✅ Super User created successfully');
              console.log('📧 Email:', SUPER_USER_EMAIL);
              console.log('🔑 Password:', SUPER_USER_PASSWORD);
              console.log('⚠️  IMPORTANT: Change this password after first login!');
              
              // Créer les onglets par défaut pour le super user
              const defaultTabs = [
                {
                  id: `all-leads-${this.lastID}`,
                  name: 'All Leads',
                  description: 'View all prospects from all tabs',
                  is_special: 1,
                  display_order: 0
                },
                {
                  id: `default-${this.lastID}`,
                  name: 'Main Pipeline',
                  description: 'Primary prospects list',
                  is_special: 0,
                  display_order: 1
                }
              ];
              
              defaultTabs.forEach((tab) => {
                db.run(
                  'INSERT INTO tabs (id, user_id, name, description, is_special, display_order) VALUES (?, ?, ?, ?, ?, ?)',
                  [tab.id, this.lastID, tab.name, tab.description, tab.is_special, tab.display_order],
                  (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                      console.error(`Error creating tab ${tab.name}:`, err);
                    }
                  }
                );
              });
              
              setTimeout(() => {
                db.close();
              }, 1000);
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeSuperUser();
