# Documentation des Fonctionnalités

## Vue d'Ensemble

Cette application permet de gérer des projets, tâches, clients et fournisseurs avec une interface moderne et intuitive.

---

## ⭐ Nouvelles Fonctionnalités

### 📧 Notifications par Email (Nouveau!)

**Description:**
Reçois automatiquement des emails quand tu termines une tâche ou un projet.

**Configuration:**
1. Va dans **Paramètres > Profil** et configure ton email
2. Va dans **Paramètres > Notifications** et active:
   - ✅ Notifications de tâches
   - ✅ Notifications de projet

**Utilisation:**
- Termine une tâche → Email automatique envoyé!
- Marque un projet comme "Terminé" → Email de félicitations!

**Note:** En développement, consulte la console du serveur pour le lien de prévisualisation des emails.

---

### 🎨 Thèmes et Couleurs Personnalisables (Nouveau!)

**Description:**
Change l'apparence de l'application selon tes préférences.

**Thèmes disponibles:**
- **Clair** : Interface lumineuse (par défaut)
- **Sombre** : Mode sombre pour tes yeux
- **Automatique** : Suit les préférences système (bientôt)

**Couleurs principales:**
- 🔵 Bleu (par défaut)
- 🟢 Vert
- 🟣 Violet
- 🔴 Rouge

**Comment changer:**
1. Va dans **Paramètres > Apparence**
2. Choisis ton thème
3. Sélectionne ta couleur préférée
4. L'interface change instantanément!

---

## Dashboard

### Statistiques
- **Projets en cours** : Nombre de projets avec statut "En cours"
- **Clients** : Nombre total de clients
- **Tâches en cours** : Nombre de tâches non terminées

### Projets Récents
- Affiche les 4 derniers projets
- Barre de progression visuelle
- Code couleur par statut
- Nom du client associé

### Tâches Importantes
- **En retard** : Tâches dont la date d'échéance est dépassée
- **À venir** : Tâches dans les 3 prochains jours
- Affichage du projet associé
- Badge de priorité (Haute, Moyenne, Basse)

### Alertes
- Notification si tâches en retard
- Notification si échéances proches
- Disparaît automatiquement si rien à signaler

---

## Gestion des Projets

### Créer un Projet
1. Cliquer sur "Nouveau projet"
2. Remplir les champs :
   - Nom du projet (obligatoire)
   - Description (optionnel)
   - Client (sélection dans la liste)
   - Statut (En cours / En attente / Terminé)
   - Progression (0-100%)
   - Date d'échéance (optionnel)
3. Cliquer sur "Créer"

### Modifier un Projet
1. Cliquer sur l'icône crayon
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Supprimer un Projet
1. Cliquer sur l'icône corbeille
2. Confirmer dans la boîte de dialogue
3. Le projet et ses tâches sont supprimés

### Logique Automatique
- **Si projet = "Terminé"** :
  - Toutes les tâches du projet passent en terminé
  - La progression monte automatiquement à 100%
- **Si une tâche est marquée terminée** :
  - La progression du projet se met à jour proportionnellement
  - Exemple : 3 tâches sur 10 terminées = 30% de progression

### Recherche
- Recherche par nom de projet
- Recherche par nom de client
- Mise à jour en temps réel

---

## Gestion des Tâches

### Créer une Tâche
1. Cliquer sur "Nouvelle tâche"
2. Remplir les champs :
   - Titre (obligatoire)
   - Description (optionnel)
   - Projet (sélection dans la liste)
   - Priorité (Haute / Moyenne / Basse)
   - Date d'échéance (optionnel)
3. Cliquer sur "Créer"

### Modifier une Tâche
1. Cliquer sur l'icône crayon
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Marquer comme Terminée
1. Cocher la case à gauche de la tâche
2. La tâche passe dans la section "Terminées"
3. Elle apparaît avec un style rayé

### Supprimer une Tâche
1. Cliquer sur l'icône corbeille
2. Confirmer dans la boîte de dialogue

### Organisation Visuelle
- **Section "À faire"** : Tâches non terminées
- **Section "Terminées"** : Tâches complétées
- Code couleur par priorité :
  - Rouge : Haute
  - Jaune : Moyenne
  - Bleu : Basse

### Statistiques
Affichage en haut de la page :
- Nombre de tâches à faire
- Nombre de tâches terminées
- Total des tâches

---

## Gestion des Clients

### Créer un Client
1. Cliquer sur "Nouveau client"
2. Remplir les champs :
   - Nom (obligatoire)
   - Email (obligatoire, unique)
   - Téléphone (optionnel)
   - Adresse (optionnel)
3. Cliquer sur "Créer"

### Modifier un Client
1. Cliquer sur l'icône crayon
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Supprimer un Client
1. Cliquer sur l'icône corbeille
2. Confirmer dans la boîte de dialogue personnalisée
3. Si le client a des projets, ils passent en "Sans client"

### Informations Affichées
- Nom du client
- Email
- Téléphone
- Adresse
- Nombre de projets associés

---

## Gestion des Fournisseurs

### Créer un Fournisseur
1. Cliquer sur "Nouveau fournisseur"
2. Remplir les champs :
   - Nom (obligatoire)
   - Email (obligatoire, unique)
   - Téléphone (optionnel)
   - Catégorie (sélection)
3. Cliquer sur "Créer"

### Modifier un Fournisseur
1. Cliquer sur l'icône crayon
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Supprimer un Fournisseur
1. Cliquer sur l'icône corbeille
2. Confirmer dans la boîte de dialogue

### Catégories Disponibles
- Informatique
- Fournitures
- Services
- Autre

### Informations Affichées
- Nom du fournisseur
- Email
- Téléphone
- Catégorie (avec badge coloré)

---

## Calendrier

### Vue Calendrier
- Grille 7 colonnes (jours) × 6 lignes (semaines)
- Affichage des jours du mois précédent et suivant
- Mise en évidence du jour actuel (fond violet)
- Navigation mois par mois (flèches)
- Bouton "Aujourd'hui" pour revenir au mois actuel

### Affichage des Tâches
- Jusqu'à 3 tâches par jour
- Code couleur par priorité :
  - Rouge : Haute priorité
  - Jaune : Moyenne priorité
  - Bleu : Basse priorité
  - Vert : Tâche terminée (rayée)
- Indicateur "+X" si plus de 4 éléments

### Affichage des Projets
- 1 projet maximum par jour (deadline)
- Badge violet pour les projets
- Nom du projet affiché

### Échéances à Venir
- Liste des tâches des 7 prochains jours
- Affichage de la date d'échéance
- Nom du projet associé
- Badge de priorité

### Statistiques
- Nombre de tâches avec échéance non terminées
- Nombre de projets avec deadline actifs
- Nombre de tâches en retard (en rouge)

---

## Boîtes de Dialogue Personnalisées

Au lieu d'utiliser les alertes du navigateur, l'application utilise des boîtes de dialogue personnalisées :

### Types de Dialogue
- **Danger** (rouge) : Suppressions
- **Warning** (jaune) : Avertissements
- **Info** (bleu) : Informations

### Fonctionnalités
- Design moderne et cohérent avec l'application
- Boutons personnalisables
- Animation d'apparition
- Fermeture par clic sur le fond ou bouton "Annuler"

---

## API Routes

### Projets
- `GET /api/projects` - Liste tous les projets
- `POST /api/projects` - Crée un projet
- `PATCH /api/projects/:id` - Met à jour un projet
- `DELETE /api/projects/:id` - Supprime un projet

### Tâches
- `GET /api/tasks` - Liste toutes les tâches
- `POST /api/tasks` - Crée une tâche
- `PATCH /api/tasks/:id` - Met à jour une tâche
- `DELETE /api/tasks/:id` - Supprime une tâche

### Clients
- `GET /api/clients` - Liste tous les clients
- `POST /api/clients` - Crée un client
- `PATCH /api/clients/:id` - Met à jour un client
- `DELETE /api/clients/:id` - Supprime un client

### Fournisseurs
- `GET /api/suppliers` - Liste tous les fournisseurs
- `POST /api/suppliers` - Crée un fournisseur
- `PATCH /api/suppliers/:id` - Met à jour un fournisseur
- `DELETE /api/suppliers/:id` - Supprime un fournisseur

### Statistiques
- `GET /api/stats` - Récupère les statistiques du dashboard

---

## Base de Données

### Tables
- **User** : Utilisateurs de l'application
- **Client** : Clients de l'entreprise
- **Supplier** : Fournisseurs
- **Project** : Projets avec progression et échéances
- **Task** : Tâches liées aux projets
- **Event** : Événements du calendrier (pour future intégration Outlook)

### Relations
- Un projet appartient à un client (optionnel)
- Un projet appartient à un utilisateur
- Une tâche appartient à un projet
- Une tâche appartient à un utilisateur (optionnel)

### Visualiser la Base de Données
```bash
cd backend
npx prisma studio
```

Prisma Studio s'ouvre dans le navigateur et permet de :
- Voir toutes les données
- Modifier directement les enregistrements
- Ajouter/supprimer des données
- Explorer les relations

---

## Résolution de Problèmes

### Les données ne s'affichent pas
1. Vérifier que le backend est lancé (http://localhost:5000)
2. Ouvrir la console du navigateur (F12)
3. Vérifier les erreurs API
4. Vérifier que la base de données contient des données (Prisma Studio)

### Erreur lors de la création/modification
1. Vérifier les champs obligatoires
2. Vérifier l'unicité de l'email (clients/fournisseurs)
3. Consulter les logs du backend
4. Vérifier la console du navigateur

### Réinitialiser l'application
```bash
cd backend
node prisma/clear-data.js
```

Cela supprime toutes les données et crée uniquement l'utilisateur admin.

### Redémarrer les serveurs
Si l'application ne répond plus :
1. Fermer les deux terminaux (backend + frontend)
2. Relancer avec DEMARRAGE.bat

---

## Conseils d'Utilisation

### Workflow Recommandé
1. Créer les clients d'abord
2. Créer les projets et les associer aux clients
3. Créer les tâches et les associer aux projets
4. Suivre l'avancement sur le Dashboard
5. Utiliser le calendrier pour les échéances

### Bonnes Pratiques
- Définir des échéances réalistes
- Utiliser les priorités pour organiser les tâches
- Mettre à jour régulièrement la progression des projets
- Vérifier les alertes du Dashboard quotidiennement
- Marquer les tâches terminées immédiatement

### Maintenance
- Supprimer les projets terminés après archivage
- Nettoyer les tâches obsolètes
- Mettre à jour les informations clients régulièrement
- Vérifier les fournisseurs inactifs

---

## Prochaines Étapes Possibles

### Améliorations Potentielles
1. **Authentification** : Login/Register avec JWT
2. **Multi-utilisateurs** : Assigner des tâches à différents utilisateurs
3. **Notifications** : Alertes par email pour les échéances
4. **Export** : Export PDF/Excel des rapports
5. **Fichiers** : Upload de documents liés aux projets
6. **Graphiques** : Visualisation des statistiques
7. **Intégration Outlook** : Synchronisation du calendrier
8. **Mode sombre** : Thème dark
9. **Application mobile** : Version React Native

---

## Support Technique

### Logs Backend
Les logs du serveur apparaissent dans le terminal backend :
- Requêtes reçues
- Erreurs éventuelles
- Connexions à la base de données

### Logs Frontend
Ouvrir la console du navigateur (F12) pour voir :
- Erreurs JavaScript
- Requêtes API
- Avertissements React

### Documentation Externe
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Application développée avec React, Node.js et SQLite**
