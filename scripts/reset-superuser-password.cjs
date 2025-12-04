const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/maplyo.db');
const db = new sqlite3.Database(dbPath);

const NEW_PASSWORD = 'Admin123!';

async function resetSuperUserPassword() {
  console.log('🔐 Resetting Super User password...');
  
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
  
  db.run(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, 'admin@maplyo.com'],
    function(err) {
      if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
      }
      
      if (this.changes === 0) {
        console.log('❌ User admin@maplyo.com not found');
      } else {
        console.log('✅ Password reset successfully!');
        console.log('📧 Email: admin@maplyo.com');
        console.log('🔑 New Password:', NEW_PASSWORD);
        console.log('⚠️  Please change this password after login');
      }
      
      db.close();
    }
  );
}

resetSuperUserPassword();
