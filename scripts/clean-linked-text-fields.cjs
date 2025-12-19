/**
 * Clean old text fields for prospects that have company_id or contact_id
 * This ensures linked data always takes priority
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'maplyo.db');
console.log('📁 Database path:', dbPath);
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning old text fields for linked prospects...\n');

// Clear company text field for prospects with company_id
db.run(
  `UPDATE prospects 
   SET company = '', address = ''
   WHERE company_id IS NOT NULL`,
  function(err) {
    if (err) {
      console.error('❌ Error cleaning company fields:', err);
    } else {
      console.log(`✅ Cleaned company text fields for ${this.changes} prospects\n`);
    }
    
    // Clear contact text field for prospects with contact_id
    db.run(
      `UPDATE prospects 
       SET contact = ''
       WHERE contact_id IS NOT NULL`,
      function(err) {
        if (err) {
          console.error('❌ Error cleaning contact fields:', err);
        } else {
          console.log(`✅ Cleaned contact text fields for ${this.changes} prospects\n`);
        }
        
        db.close();
        console.log('🎉 Cleaning completed!');
      }
    );
  }
);
