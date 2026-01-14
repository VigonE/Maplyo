// Script to add latitude and longitude fields to companies table
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/maplyo.db');

console.log('📍 Adding location fields to companies table...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check if columns already exist
db.all("PRAGMA table_info(companies)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err.message);
    db.close();
    process.exit(1);
  }

  const hasLatitude = columns.some(col => col.name === 'latitude');
  const hasLongitude = columns.some(col => col.name === 'longitude');

  if (hasLatitude && hasLongitude) {
    console.log('✅ Location fields already exist in companies table');
    db.close();
    return;
  }

  console.log('📝 Adding missing location fields...');

  const migrations = [];
  if (!hasLatitude) {
    migrations.push('ALTER TABLE companies ADD COLUMN latitude REAL');
  }
  if (!hasLongitude) {
    migrations.push('ALTER TABLE companies ADD COLUMN longitude REAL');
  }

  // Execute migrations
  let completed = 0;
  migrations.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`❌ Error executing migration ${index + 1}:`, err.message);
        db.close();
        process.exit(1);
      }
      
      completed++;
      console.log(`✅ Migration ${index + 1}/${migrations.length} completed`);
      
      if (completed === migrations.length) {
        console.log('✅ All migrations completed successfully!');
        
        // Verify the changes
        db.all("PRAGMA table_info(companies)", [], (err, updatedColumns) => {
          if (err) {
            console.error('❌ Error verifying changes:', err.message);
          } else {
            console.log('\n📋 Updated companies table structure:');
            updatedColumns.forEach(col => {
              console.log(`  - ${col.name}: ${col.type}`);
            });
          }
          
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('\n✅ Database connection closed');
            }
          });
        });
      }
    });
  });
});
