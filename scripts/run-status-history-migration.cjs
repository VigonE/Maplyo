const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'maplyo.db');
const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_status_history.sql');

console.log('📊 Running status_history migration...');
console.log('DB Path:', dbPath);
console.log('Migration Path:', migrationPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Database connected');
});

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

db.exec(migrationSQL, (err) => {
  if (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
  
  console.log('✅ Migration completed successfully');
  
  // Vérifier la table
  db.get("SELECT COUNT(*) as count FROM status_history", (err, row) => {
    if (err) {
      console.error('❌ Error verifying table:', err);
    } else {
      console.log(`📊 Status history records: ${row.count}`);
    }
    
    db.close(() => {
      console.log('✅ Database closed');
      process.exit(0);
    });
  });
});
