# Mode Démo - Maplyo CRM

## Vue d'ensemble

Le mode démo de Maplyo CRM permet aux utilisateurs de tester toutes les fonctionnalités de l'application sans nécessiter de compte ou de connexion. Les données sont temporaires et stockées uniquement dans la session du navigateur.

## Fonctionnalités

### Accès à la démo
- **Bouton "Essayer la démo"** sur la page de connexion
- Accès instantané sans création de compte
- Pas besoin de credentials

### Données de démonstration
Le mode démo inclut des données réalistes :
- **7 prospects** à différents stades du funnel (contact, lead, qualified, proposal, negotiation, won, lost)
- **7 entreprises** avec informations complètes
- **7 contacts** associés aux entreprises
- **6 tâches** (todos) avec différentes priorités et échéances
- Données géolocalisées sur la carte de France

### Fonctionnalités disponibles en mode démo

✅ **Disponibles :**
- Visualisation et gestion des prospects
- Carte interactive avec géolocalisation
- Création, modification et suppression de prospects
- Gestion des entreprises et contacts
- Gestion des tâches (todos)
- Filtres et recherches
- Rapports et prévisions de revenus
- Rapport d'entonnoir (funnel report)
- Changement de thème (Default, Retro)

❌ **Non disponibles (cachées) :**
- Paramètres système (System Settings)
- Gestion des utilisateurs (User Management)
- Import CSV
- Fonctions d'administration

### Isolation des sessions
- Chaque utilisateur a sa propre session isolée
- Les modifications d'un utilisateur n'affectent pas les autres
- Identifiant de session unique généré automatiquement
- Stockage dans `sessionStorage` du navigateur

### Persistance des données
- Les données sont sauvegardées automatiquement dans `sessionStorage`
- Les modifications persistent pendant la session du navigateur
- **Toutes les données sont réinitialisées** à la fermeture de l'onglet/navigateur
- Bandeau informatif visible en haut de l'application

## Architecture technique

### Store Pinia - `demo.js`
Gère l'état et les données du mode démo :
- Initialisation des données de démo
- CRUD pour prospects, companies, contacts, todos
- Sauvegarde/chargement dans sessionStorage
- Isolation des sessions utilisateur

### Service API - `api.js`
Intercepte les appels API en mode démo :
- Wrapper `createDemoWrapper` pour chaque fonction API
- Redirection vers le store démo au lieu du backend
- Simulation de délais réseau (100-300ms) pour réalisme

### Store Prospects - `prospects.js`
Adapté pour le mode démo :
- Détection automatique du mode démo
- Chargement des données depuis le store démo
- Utilisation des wrappers API

### Interface utilisateur

#### Bandeau de notification
Un bandeau bleu en haut de l'application indique le mode démo :
- Icône de lecture
- Message explicatif
- Bouton "Quitter la démo"

#### Page de connexion
- Bouton "Essayer la démo" avec icône
- Design distinct (bordure bleue)
- Texte explicatif

#### Dashboard
- Fonctions admin masquées automatiquement
- Indicateur visuel dans le menu des paramètres
- Message "Mode Démo" dans le menu déroulant

## Flux utilisateur

1. **Entrée en mode démo**
   - Utilisateur clique sur "Essayer la démo"
   - `demoStore.initDemoMode()` initialise les données
   - Session démo créée avec ID unique
   - Redirection vers le dashboard

2. **Utilisation**
   - Toutes les modifications sont locales
   - Sauvegarde automatique dans sessionStorage
   - Bandeau rappelant le mode temporaire

3. **Sortie du mode démo**
   - Clic sur "Quitter la démo" → retour au login
   - Fermeture de l'onglet → nettoyage automatique
   - Données supprimées de sessionStorage

## Données de démo détaillées

### Prospects
1. **TechCorp Solutions** (Paris) - Lead - 50 000€ - 60%
2. **InnovaTech SARL** (Lyon) - Qualified - 75 000€ - 75%
3. **GlobalServices SA** (Paris) - Proposal - 120 000€ - 85%
4. **DigiMarket France** (Bordeaux) - Negotiation - 95 000€ - 90%
5. **FutureTech Industries** (Nice) - Contact - 30 000€ - 40%
6. **CloudSystems Europe** (Paris) - Won - 150 000€ - 100% ✅
7. **SmartBusiness Solutions** (Paris) - Lost - 40 000€ - 0% ❌

### Tâches (Todos)
- Préparer démo technique InnovaTech (High)
- Relancer GlobalServices pour proposition (High)
- Finaliser contrat DigiMarket (Urgent)
- Envoyer documentation TechCorp (Medium, ✅ Completed)
- Appel de qualification FutureTech (Medium)
- Mettre à jour pipeline hebdomadaire (Low)

## Utilisation pour démonstrations commerciales

Le mode démo est idéal pour :
- **Démonstrations commerciales** - Montrer toutes les fonctionnalités
- **Tests utilisateurs** - Permettre l'essai sans engagement
- **Formations** - Environnement sûr pour apprendre
- **Captures d'écran** - Données réalistes et professionnelles

## Limitations

- Pas de persistance entre sessions
- Impossible de sauvegarder les données
- Pas d'accès aux fonctions d'administration
- Pas d'import/export de données
- Session isolée (pas de collaboration)

## Support multi-utilisateurs

Le système permet à plusieurs utilisateurs d'utiliser la démo simultanément :
- Session ID unique par utilisateur
- Stockage sessionStorage isolé par onglet
- Aucune interférence entre utilisateurs
- Scalabilité illimitée (tout côté client)

## Maintenance et mise à jour

Pour modifier les données de démo :
1. Éditer `src/stores/demo.js`
2. Modifier les tableaux `demoProspects`, `demoCompanies`, `demoContacts`, `demoTodos`
3. Les nouvelles données seront disponibles immédiatement

## Sécurité

- Aucune donnée n'est envoyée au serveur
- Tout fonctionne côté client
- Nettoyage automatique à la fermeture
- Impossible d'affecter les données réelles
- Pas d'accès aux fonctions sensibles

---

**Note :** Le mode démo est conçu pour être une expérience complète et réaliste de Maplyo CRM, permettant aux utilisateurs de découvrir toutes les fonctionnalités principales sans engagement ni risque.
