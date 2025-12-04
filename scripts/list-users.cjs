const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/maplyo.db');
const db = new sqlite3.Database(dbPath);

console.log('👥 Liste des utilisateurs:\n');

db.all('SELECT id, email, name, role, created_at FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }
  
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role || 'user (default)'}`);
    console.log(`Created: ${user.created_at}`);
    console.log('---');
  });
  
  db.close();
});
