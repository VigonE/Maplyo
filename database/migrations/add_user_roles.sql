-- Migration pour ajouter la gestion des rôles utilisateurs
-- 3 niveaux : super_user, admin, user

-- Ajouter la colonne role avec 'user' par défaut
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('super_user', 'admin', 'user'));

-- Définir admin@maplyo.com comme super_user
UPDATE users SET role = 'super_user' WHERE email = 'admin@maplyo.com';

-- Créer le super_user s'il n'existe pas encore
-- (mot de passe : Admin123! - bcrypt hash avec salt rounds=10)
INSERT OR IGNORE INTO users (email, password, name, role) 
VALUES ('admin@maplyo.com', '$2a$10$YourBcryptHashHere', 'Super Admin', 'super_user');
