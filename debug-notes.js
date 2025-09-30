import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'maplyo.db');
console.log('Chemin DB:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Récupérer quelques notes existantes
  const prospects = db.prepare(`
    SELECT id, name, notes, notes_last_updated, created_at 
    FROM prospects 
    WHERE notes IS NOT NULL AND notes != '' 
    ORDER BY notes_last_updated DESC 
    LIMIT 5
  `).all();
  
  console.log('=== Échantillon de notes existantes ===');
  prospects.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.name}`);
    console.log(`Notes last updated: ${p.notes_last_updated}`);
    console.log(`Created: ${p.created_at}`);
    console.log(`Notes (200 chars): ${p.notes.substring(0, 200)}...`);
    
    // Vérifier si les notes contiennent des spans avec data-daily-date
    const hasDataDailyDate = p.notes.includes('data-daily-date');
    const hasColoredSpans = p.notes.includes('style="color:') || p.notes.includes('style="color:');
    
    console.log(`Contient data-daily-date: ${hasDataDailyDate}`);
    console.log(`Contient des spans colorés: ${hasColoredSpans}`);
    console.log('---');
  });
  
  db.close();
} catch (error) {
  console.error('Erreur:', error);
}