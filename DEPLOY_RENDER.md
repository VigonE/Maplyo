# Guide de déploiement Render - Maplyo

## Problème résolu : Geocoding qui ne fonctionne pas sur Render

### Modifications apportées

#### 1. Geocoding robuste (`server/index.cjs`)
- ✅ Fonction `geocodeAddressSafely` avec timeout de 8-10 secondes
- ✅ Fallback gracieux : création de prospects même si geocoding échoue
- ✅ Logs détaillés pour identifier les problèmes
- ✅ Statistiques de monitoring en temps réel
- ✅ Test de connectivité réseau au démarrage

#### 2. Configuration Render optimisée
- ✅ `render.yaml` mis à jour avec plan Starter (recommandé vs gratuit)
- ✅ Variables d'environnement définies
- ✅ Health check configuré
- ✅ Timeouts ajustés pour Render

#### 3. Outils de diagnostic
- ✅ Route `/api/system/diagnostic` pour tester en production
- ✅ Script `scripts/test-geocoding.js` pour valider le déploiement
- ✅ Guide complet dans `GEOCODING_DIAGNOSTIC.md`

### Configuration Render requise

#### Variables d'environnement (dans le dashboard Render)
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
REQUEST_TIMEOUT=30000
GEOCODING_TIMEOUT=10000
LOG_LEVEL=info
```

#### Commandes de build et start
```
Build Command: npm install && npm run build
Start Command: node server/index.cjs
```

### Test après déploiement

1. **Vérifier les logs Render** pour ces messages :
   ```
   ✅ Network connectivity: OK
   🚀 MAPLYO SERVER STARTED SUCCESSFULLY
   ```

2. **Tester l'API geocoding** :
   ```bash
   npm run test:geocoding:prod
   ```

3. **Accéder au diagnostic système** :
   ```
   https://your-app.onrender.com/api/system/diagnostic
   ```

### Résolution des problèmes courants

#### Geocoding échoue mais prospects se créent
- ✅ **Normal** : Le système continue à fonctionner sans coordonnées
- 📍 Les prospects apparaissent dans la liste mais pas sur la carte
- 🔧 Vérifier la connectivité réseau dans les logs

#### Timeouts fréquents
- 🔧 Considérer un plan Render supérieur (Starter au lieu de Free)
- 🔧 Augmenter `GEOCODING_TIMEOUT` dans les variables d'environnement
- 🔧 Vérifier la région Render (choisir la plus proche)

#### Performance dégradée
- 📊 Surveiller les statistiques dans les logs : `📊 Geocoding Stats`
- 🔧 Optimiser les requêtes (éviter les geocoding répétés)
- 💡 Considérer un service de geocoding payant plus rapide

### Améliorations futures possibles

1. **Cache de geocoding** : Sauvegarder les résultats pour éviter les requêtes répétées
2. **Service alternatif** : Google Maps Geocoding API (payant mais plus fiable)
3. **Queue système** : Traiter le geocoding en arrière-plan
4. **Geocoding batch** : Traiter plusieurs adresses simultanément

### Monitoring en production

Les logs Render afficheront automatiquement :
- Taux de succès du geocoding toutes les 10 minutes
- Temps de réponse des requêtes
- Erreurs de connectivité réseau
- Statistiques de performance globale

### Support et maintenance

- 📋 Consulter `GEOCODING_DIAGNOSTIC.md` pour le troubleshooting complet
- 🧪 Utiliser `npm run test:geocoding:prod` pour valider régulièrement
- 📊 Surveiller les logs Render pour détecter les dégradations
- 🔧 Ajuster les timeouts selon les performances observées
