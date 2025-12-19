/**
 * Migration script to link existing prospects to companies and contacts
 * This script will:
 * 1. Find prospects with company names but no company_id
 * 2. Match them with existing companies
 * 3. Update the prospect with the company_id
 * 4. Same for contacts
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'maplyo.db');
console.log('📁 Database path:', dbPath);
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting migration of company and contact relationships...\n');

// Step 1: Link prospects to companies by name
db.all(
  `SELECT p.id, p.company, c.id as company_id, c.name as company_name
   FROM prospects p
   INNER JOIN companies c ON LOWER(TRIM(p.company)) = LOWER(TRIM(c.name))
   WHERE p.company_id IS NULL AND p.company IS NOT NULL AND p.company != ''`,
  (err, matches) => {
    if (err) {
      console.error('❌ Error finding company matches:', err);
      return;
    }

    console.log(`📦 Found ${matches.length} prospects to link with companies\n`);

    if (matches.length === 0) {
      console.log('✅ No prospects need company linking\n');
      linkContacts();
      return;
    }

    let updated = 0;
    matches.forEach((match, index) => {
      db.run(
        'UPDATE prospects SET company_id = ? WHERE id = ?',
        [match.company_id, match.id],
        (updateErr) => {
          if (updateErr) {
            console.error(`❌ Error linking prospect ${match.id} to company ${match.company_name}:`, updateErr);
          } else {
            console.log(`✅ Linked prospect ${match.id} to company "${match.company_name}" (ID: ${match.company_id})`);
            updated++;
          }

          if (index === matches.length - 1) {
            console.log(`\n📊 Updated ${updated} prospects with company_id\n`);
            linkContacts();
          }
        }
      );
    });
  }
);

// Step 2: Link prospects to contacts by name
function linkContacts() {
  db.all(
    `SELECT p.id, p.contact, p.company_id, ct.id as contact_id, ct.first_name, ct.last_name
     FROM prospects p
     INNER JOIN company_contacts cc ON cc.company_id = p.company_id
     INNER JOIN contacts ct ON ct.id = cc.contact_id
     WHERE p.contact_id IS NULL 
       AND p.contact IS NOT NULL 
       AND p.contact != ''
       AND (
         LOWER(TRIM(p.contact)) = LOWER(TRIM(ct.first_name || ' ' || ct.last_name))
         OR LOWER(TRIM(p.contact)) = LOWER(TRIM(ct.last_name || ' ' || ct.first_name))
       )`,
    (err, matches) => {
      if (err) {
        console.error('❌ Error finding contact matches:', err);
        db.close();
        return;
      }

      console.log(`👥 Found ${matches.length} prospects to link with contacts\n`);

      if (matches.length === 0) {
        console.log('✅ No prospects need contact linking\n');
        db.close();
        console.log('🎉 Migration completed!');
        return;
      }

      let updated = 0;
      matches.forEach((match, index) => {
        db.run(
          'UPDATE prospects SET contact_id = ? WHERE id = ?',
          [match.contact_id, match.id],
          (updateErr) => {
            if (updateErr) {
              console.error(`❌ Error linking prospect ${match.id} to contact ${match.first_name} ${match.last_name}:`, updateErr);
            } else {
              console.log(`✅ Linked prospect ${match.id} to contact "${match.first_name} ${match.last_name}" (ID: ${match.contact_id})`);
              updated++;
            }

            if (index === matches.length - 1) {
              console.log(`\n📊 Updated ${updated} prospects with contact_id\n`);
              db.close();
              console.log('🎉 Migration completed!');
            }
          }
        );
      });
    }
  );
}
