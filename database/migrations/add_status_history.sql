-- Migration pour ajouter le suivi historique des changements de statut

-- Créer la table status_history
CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  changed_by INTEGER,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_status_history_prospect ON status_history(prospect_id);
CREATE INDEX IF NOT EXISTS idx_status_history_date ON status_history(changed_at);

-- Initialiser l'historique avec les statuts actuels
INSERT INTO status_history (prospect_id, old_status, new_status, changed_at)
SELECT id, NULL, status, created_at
FROM prospects
WHERE NOT EXISTS (
  SELECT 1 FROM status_history WHERE prospect_id = prospects.id
);
