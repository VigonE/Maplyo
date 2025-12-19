/**
 * Debug script to check what's in the database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'maplyo.db');
console.log('📁 Database path:', dbPath);
const db = new sqlite3.Database(dbPath);

console.log('\n=== COMPANIES TABLE ===\n');
db.all('SELECT * FROM companies', (err, companies) => {
  if (err) {
    console.error('Error:', err);
  } else {
    companies.forEach(c => {
      console.log(`ID: ${c.id} | Name: "${c.name}" | Address: "${c.address}"`);
    });
  }
  
  console.log('\n=== PROSPECTS TABLE (with company_id) ===\n');
  db.all('SELECT id, name, company, address, company_id FROM prospects WHERE company_id IS NOT NULL', (err, prospects) => {
    if (err) {
      console.error('Error:', err);
    } else {
      prospects.forEach(p => {
        console.log(`Prospect ID: ${p.id} | Name: "${p.name}"`);
        console.log(`  - company_id: ${p.company_id}`);
        console.log(`  - company (text): "${p.company}"`);
        console.log(`  - address (text): "${p.address}"`);
        console.log('');
      });
    }
    
    console.log('\n=== JOINED DATA (what API should return) ===\n');
    db.all(`
      SELECT 
        p.id, p.name, p.company as old_company, p.company_id,
        c.name as company_name, c.address as company_address
      FROM prospects p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.company_id IS NOT NULL
    `, (err, results) => {
      if (err) {
        console.error('Error:', err);
      } else {
        results.forEach(r => {
          console.log(`Prospect: "${r.name}"`);
          console.log(`  - company_id: ${r.company_id}`);
          console.log(`  - OLD company text: "${r.old_company}"`);
          console.log(`  - JOINED company_name: "${r.company_name}"`);
          console.log(`  - JOINED company_address: "${r.company_address}"`);
          console.log('');
        });
      }
      
      db.close();
    });
  });
});
