# Installation et configuration de Maplyo

Ce guide vous accompagne dans la mise en place de Maplyo sur votre machine locale ou sur un serveur.

## Prérequis

- **Node.js** 18+ et **npm** 9+
- **Git** pour cloner le dépôt
- Un éditeur de code (VS Code recommandé)

## Installation en développement

### 1. Cloner le dépôt

```bash
git clone https://github.com/Maplyo/Maplyo.git
cd Maplyo
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

**⚠️ IMPORTANT - Sécurité** : Vous DEVEZ modifier le fichier `.env` et remplacer les valeurs par défaut :

#### Générer une clé JWT sécurisée

**Méthode 1 - Node.js** (Recommandée) :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Méthode 2 - PowerShell** (Windows) :
```powershell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [BitConverter]::ToString($bytes).Replace('-', '').ToLower()
```

**Méthode 3 - OpenSSL** (Linux/Mac) :
```bash
openssl rand -hex 32
```

Copiez le résultat et remplacez la valeur de `JWT_SECRET` dans votre fichier `.env` :

```env
JWT_SECRET=votre_clé_générée_de_64_caractères_hexadécimaux
```

### 4. Lancer l'application

#### Option A : Démarrage complet (Frontend + Backend)

```bash
npm run dev        # Frontend (Vite) sur http://localhost:3000
npm run server:dev # Backend (Express) sur http://localhost:3001
```

Lancez ces deux commandes dans des terminaux séparés.

#### Option B : Utiliser les tâches VS Code

Si vous utilisez VS Code, vous pouvez utiliser les tâches prédéfinies :
- Appuyez sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
- Tapez "Run Task"
- Sélectionnez "🚀 Start Maplyo Full Stack"

### 5. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001

## Premier utilisateur

Au premier lancement, l'application créera automatiquement un utilisateur super-admin si aucun utilisateur n'existe.

Vous pouvez également créer un super-utilisateur manuellement avec le script :

```bash
node scripts/init-superuser.cjs
```

## Base de données

Maplyo utilise SQLite par défaut. La base de données est créée automatiquement dans `database/maplyo.db`.

Les migrations SQL sont disponibles dans `database/migrations/` et s'appliquent automatiquement au démarrage du serveur.

## Scripts utiles

```bash
# Développement
npm run dev              # Démarre le frontend (Vite)
npm run server:dev       # Démarre le backend avec rechargement auto (nodemon)

# Production
npm run build            # Compile le frontend pour la production
npm start                # Build + démarre le serveur en mode production

# Utilitaires
node scripts/list-users.cjs              # Liste tous les utilisateurs
node scripts/reset-superuser-password.cjs # Réinitialise le mot de passe admin
node scripts/force-admin-superuser.cjs   # Force un utilisateur en super-admin
```

## Dépannage

### Le serveur ne démarre pas

**Erreur : "Server configuration error"**
- Vérifiez que votre fichier `.env` existe
- Vérifiez que `JWT_SECRET` est défini et non vide
- Régénérez une clé JWT sécurisée si nécessaire

**Port déjà utilisé**
- Modifiez `PORT` dans `.env` (par défaut 3001 pour le backend, 3000 pour le frontend)
- Ou arrêtez le processus utilisant le port

### Problèmes de géocodage

- Le géocodage utilise OpenStreetMap par défaut (gratuit, sans clé API)
- Pour de meilleures performances, ajoutez une clé MapQuest dans `.env` :
  ```env
  MAPQUEST_API_KEY=votre_clé_mapquest
  ```

### Base de données corrompue

Pour réinitialiser complètement la base de données :

```bash
# Sauvegarde (optionnelle)
cp database/maplyo.db database/maplyo.db.backup

# Suppression et recréation
rm database/maplyo.db
npm run server:dev  # Redémarre et recrée la base
```

## Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les instructions de contribution.

## Sécurité

Pour signaler une vulnérabilité de sécurité, consultez [SECURITY.md](SECURITY.md).

## Support

Consultez [SUPPORT.md](SUPPORT.md) pour obtenir de l'aide.
