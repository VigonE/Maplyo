# 🚀 Guide de déploiement Maplyo sur Render

## Configuration rapide

### 1. Préparer le repository
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Sur Render.com

1. **Créer un nouveau Web Service**
   - Connectez votre repository GitHub
   - Sélectionnez la branche `main` ou `master`

2. **Configuration automatique**
   - Render détectera automatiquement le `render.yaml`
   - Ou configurez manuellement :

3. **Configuration manuelle** (si render.yaml ne fonctionne pas)
   - **Name**: `maplyo`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`

4. **Variables d'environnement**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Générez une clé sécurisée (32+ caractères)
   - `PORT`: `10000` (automatique sur Render)

### 3. Variables d'environnement importantes

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Mode production |
| `JWT_SECRET` | `votre-cle-secrete-unique` | Clé pour JWT (TRÈS IMPORTANT) |
| `PORT` | `10000` | Port Render (auto) |

## ✅ Checklist pré-déploiement

- [x] **Dependencies**: Packages de production dans `dependencies`
- [x] **Scripts**: `start` script configuré
- [x] **Database**: SQLite avec création auto du dossier
- [x] **Static files**: `express.static('dist')` configuré
- [x] **Environment**: Variables d'environnement gérées
- [x] **Build**: Vite build produit le dossier `dist`
- [x] **CORS**: Configuré pour tous les domaines
- [x] **File uploads**: Limite 50MB configurée

## 🔧 Fonctionnalités incluses

- ✅ **Frontend**: Vue.js SPA compilé
- ✅ **Backend**: Express.js API
- ✅ **Database**: SQLite embarqué
- ✅ **Auth**: JWT avec sessions
- ✅ **Upload**: Sauvegarde/Restauration DB
- ✅ **Map**: Cartes Leaflet
- ✅ **Responsive**: Interface mobile

## 🚀 URLs une fois déployé

- **App**: `https://votre-app.onrender.com`
- **API**: `https://votre-app.onrender.com/api`

## 🛠️ Dépannage

### Erreur de build
```bash
# Tester en local
npm install
npm run build
npm run server
```

### Base de données
- SQLite se crée automatiquement
- Pas de configuration externe nécessaire
- Données persistantes sur le disque Render

### Performance
- **Free tier**: Peut hiberner après 15min d'inactivité
- **Paid tier**: Toujours actif

## 📝 Notes importantes

1. **Premier déploiement**: Peut prendre 5-10 minutes
2. **Hibernation**: App gratuite s'endort après 15min
3. **Database**: Persiste entre les redémarrages
4. **Logs**: Consultables dans le dashboard Render
5. **Custom domain**: Configurable dans les settings

## 🔐 Sécurité

- ✅ JWT_SECRET unique généré
- ✅ CORS configuré
- ✅ Variables d'environnement sécurisées
- ✅ Pas de secrets dans le code
