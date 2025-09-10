# Guide de diagnostic geocoding - Render vs Local

## Problèmes fréquents et solutions

### 1. Variables d'environnement manquantes

**Problème :** Les clés API ou configurations ne sont pas définies sur Render.

**Solution :**
1. Aller dans le dashboard Render → votre service → Environment
2. Ajouter les variables depuis `.env.render`
3. Redéployer le service

**Variables critiques :**
- `JWT_SECRET` (OBLIGATOIRE)
- `NODE_ENV=production`
- `GEOCODING_API_KEY` (si service payant)

### 2. Timeout réseau

**Problème :** Render a des timeouts plus stricts que l'environnement local.

**Solutions implémentées :**
- Timeout de 8-10 secondes pour le geocoding
- Fallback gracieux si le geocoding échoue
- Création du prospect même sans coordonnées

### 3. HTTPS/HTTP

**Problème :** Render force HTTPS, certains services de geocoding peuvent avoir des problèmes.

**Solution :** Code modifié pour forcer HTTPS dans tous les appels API.

### 4. Limites de taux (Rate limiting)

**Problème :** Trop de requêtes simultanées vers l'API de geocoding.

**Solutions implémentées :**
- Timeout individuels par requête
- Logs détaillés pour identifier les échecs
- Fallback sans coordonnées

### 5. Performance réseau

**Problème :** Latence réseau plus élevée sur Render.

**Solutions :**
- Test de connectivité au démarrage
- Augmentation des timeouts
- Logs détaillés des performances

## Comment diagnostiquer

### 1. Vérifier les logs Render

```bash
# Dans le dashboard Render, aller à Logs
# Chercher ces messages :
✅ Network connectivity: OK
🌍 Starting geocoding for address: [address]
📍 Geocoding successful: {latitude, longitude}
❌ Geocoding error: [error message]
```

### 2. Tester manuellement

```bash
# Test API geocoding direct
curl -X POST https://your-app.onrender.com/api/geocode \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "Paris, France"}'
```

### 3. Variables d'environnement à vérifier

Dans Render Environment Variables :
- `NODE_ENV=production`
- `JWT_SECRET=[une clé secrète forte]`
- `PORT` (automatique sur Render)

## Messages de diagnostic

### Logs normaux (succès)
```
🚀 MAPLYO SERVER STARTED SUCCESSFULLY
✅ Network connectivity: OK
🌍 Starting geocoding for address: [address]
📍 Geocoding successful: {lat: X, lng: Y}
```

### Logs d'erreur (à corriger)
```
❌ Network connectivity test failed
❌ Geocoding error: timeout
⚠️ Geocoding returned no results
```

## Actions correctives

### Si le geocoding échoue complètement :
1. Vérifier la connectivité réseau dans les logs
2. Augmenter les timeouts si nécessaire
3. Considérer un service de geocoding payant plus fiable

### Si les prospects ne se créent pas :
1. Vérifier que `JWT_SECRET` est défini
2. Vérifier la base de données SQLite
3. Consulter les logs d'erreur complets

### Si performance dégradée :
1. Monitorer les timeouts dans les logs
2. Optimiser les requêtes de geocoding
3. Implémenter un cache de geocoding si nécessaire

## Configuration Render recommandée

**Plan :** Starter ou supérieur (les plans gratuits ont des limitations)
**Région :** Choisir la région la plus proche de vos utilisateurs
**Build Command :** `npm install; npm run build`
**Start Command :** `node server/index.cjs`

## Surveillance continue

Surveiller ces métriques dans les logs Render :
- Taux de succès du geocoding
- Temps de réponse moyen
- Erreurs de timeout
- Connectivité réseau
