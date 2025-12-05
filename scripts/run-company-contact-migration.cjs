// Script to run the company/contact relations migration
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prospects.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Running company/contact relations migration...');

// Add company_id column
db.run(`ALTER TABLE prospects ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('❌ Error adding company_id:', err.message);
  } else {
    console.log('✅ Added company_id column');
  }
});

// Add contact_id column
db.run(`ALTER TABLE prospects ADD COLUMN contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('❌ Error adding contact_id:', err.message);
  } else {
    console.log('✅ Added contact_id column');
  }
});

// Create indexes
db.run(`CREATE INDEX IF NOT EXISTS idx_prospects_company ON prospects(company_id)`, (err) => {
  if (err) {
    console.error('❌ Error creating company index:', err.message);
  } else {
    console.log('✅ Created index on prospects.company_id');
  }
});

db.run(`CREATE INDEX IF NOT EXISTS idx_prospects_contact ON prospects(contact_id)`, (err) => {
  if (err) {
    console.error('❌ Error creating contact index:', err.message);
  } else {
    console.log('✅ Created index on prospects.contact_id');
  }
  
  // Close database after all operations
  setTimeout(() => {
    db.close(() => {
      console.log('🏁 Migration completed!');
    });
  }, 1000);
});
