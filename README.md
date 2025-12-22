# Application de Gestion de Projet

Application de gestion de projet complète avec React, Node.js et SQLite.

## Démarrage Rapide

### Windows
Double-cliquez sur **DEMARRAGE.bat**

### Manuel
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Puis ouvrez : **http://localhost:5173**

---

## Fonctionnalités

### Dashboard
- Statistiques en temps réel (projets, clients, tâches)
- Projets récents avec barres de progression
- Tâches en retard et à venir
- Alertes intelligentes

### Gestion des Projets
- Créer, modifier, supprimer des projets
- Associer à un client
- Suivre la progression (0-100%)
- Définir des dates d'échéance
- Statuts : En cours, En attente, Terminé
- Recherche par nom ou client
- Logique automatique :
  - Si projet terminé → toutes ses tâches passent en terminé
  - Si projet terminé → progression monte à 100%
  - Si tâche terminée → progression du projet se met à jour

### Gestion des Tâches
- Créer, modifier, supprimer des tâches
- Marquer comme complète/incomplète
- Assigner à un projet
- Priorités : Haute, Moyenne, Basse
- Dates d'échéance
- Statistiques : À faire / Terminées / Total
- Séparation visuelle des tâches

### Gestion des Clients
- Créer, modifier, supprimer des clients
- Coordonnées complètes (nom, email, téléphone, adresse)
- Affichage du nombre de projets par client
- Boîtes de dialogue personnalisées

### Gestion des Fournisseurs
- Créer, modifier, supprimer des fournisseurs
- Coordonnées complètes
- Catégorisation (Informatique, Fournitures, Services, Autre)

### Calendrier
- Vue calendrier mensuelle complète
- Affichage des tâches et projets par date
- Navigation mois par mois
- Bouton "Aujourd'hui"
- Couleurs par priorité
- Échéances à venir (7 prochains jours)
- Statistiques des échéances

---

## Stack Technique

### Backend
- **Framework** : Express.js
- **ORM** : Prisma
- **Base de données** : SQLite
- **Port** : 5000

### Frontend
- **Framework** : React 18
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router
- **HTTP Client** : Axios
- **Icônes** : Lucide React
- **Port** : 5173

---

## Structure du Projet

```
gestion-projet/
├── backend/
│   ├── server.js              # Serveur Express avec routes API
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de base de données
│   │   ├── dev.db             # Base SQLite
│   │   ├── seed.js            # Données d'exemple
│   │   └── clear-data.js      # Réinitialisation
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/             # Pages de l'app
    │   ├── components/        # Composants réutilisables
    │   └── services/          # API client
    └── package.json
```

---

## Commandes Utiles

### Backend
```bash
# Lancer le serveur
node server.js

# Ouvrir Prisma Studio (voir la BDD)
npx prisma studio

# Réinitialiser les données
node prisma/clear-data.js
```

### Frontend
```bash
# Lancer en développement
npm run dev

# Build pour production
npm run build
```

---

## Support

Pour plus d'informations, consultez **FONCTIONNALITES.md**
