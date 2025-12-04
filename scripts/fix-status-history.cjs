const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'maplyo.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing status history timestamps...\n');

// Delete all existing history
db.run('DELETE FROM status_history', (err) => {
  if (err) {
    console.error('❌ Error deleting history:', err);
    db.close();
    return;
  }
  
  console.log('✅ Cleared existing history');
  
  // Get all prospects
  db.all('SELECT id, status, created_at FROM prospects', (err, prospects) => {
    if (err) {
      console.error('❌ Error fetching prospects:', err);
      db.close();
      return;
    }
    
    console.log(`📋 Found ${prospects.length} prospects`);
    
    let inserted = 0;
    const insertStmt = db.prepare(
      'INSERT INTO status_history (prospect_id, old_status, new_status, changed_at) VALUES (?, NULL, ?, ?)'
    );
    
    prospects.forEach(prospect => {
      // Use created_at as the initial status change date
      const changeDate = prospect.created_at || new Date().toISOString();
      
      insertStmt.run(prospect.id, prospect.status, changeDate, (err) => {
        if (err) {
          console.error(`❌ Error inserting history for prospect ${prospect.id}:`, err);
        } else {
          inserted++;
        }
        
        if (inserted === prospects.length) {
          insertStmt.finalize();
          console.log(`\n✅ Successfully created ${inserted} status history records`);
          console.log('✅ All timestamps now match prospect creation dates');
          db.close();
        }
      });
    });
  });
});
