# Guide de Déploiement sur Render

Ce guide vous explique comment déployer votre application de gestion de projet sur Render.

## Prérequis

1. Un compte GitHub
2. Un compte Render (gratuit)
3. Votre code poussé sur GitHub

## Étape 1: Préparer votre repository GitHub

### 1.1 Initialiser Git (si ce n'est pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Créer un repository sur GitHub

1. Allez sur https://github.com
2. Cliquez sur le bouton "+" en haut à droite
3. Sélectionnez "New repository"
4. Nommez-le "gestion-projet"
5. **NE PAS** cocher "Initialize this repository with a README"
6. Cliquez sur "Create repository"

### 1.3 Pousser votre code sur GitHub

```bash
git remote add origin https://github.com/VOTRE_USERNAME/gestion-projet.git
git branch -M main
git push -u origin main
```

## Étape 2: Créer un compte Render

1. Allez sur https://render.com
2. Cliquez sur "Get Started for Free"
3. Connectez-vous avec votre compte GitHub
4. Autorisez Render à accéder à vos repositories

## Étape 3: Déployer le Backend

1. Sur le tableau de bord Render, cliquez sur "New +"
2. Sélectionnez "Web Service"
3. Connectez votre repository GitHub "gestion-projet"
4. Configurez le service:
   - **Name**: `gestion-projet-backend`
   - **Region**: Choisissez la région la plus proche (Europe West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run db:seed`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Ajoutez les variables d'environnement (cliquez sur "Advanced" puis "Add Environment Variable"):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `file:./prod.db`
   - `JWT_SECRET` = (générez une chaîne aléatoire de 32+ caractères)
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_PASS` = `mzlx rsdk dzit alul` (votre mot de passe d'application Gmail)

6. Cliquez sur "Create Web Service"
7. **IMPORTANT**: Notez l'URL de votre backend (ex: https://gestion-projet-backend.onrender.com)

## Étape 4: Déployer le Frontend

1. Sur le tableau de bord Render, cliquez sur "New +"
2. Sélectionnez "Static Site"
3. Connectez le même repository GitHub
4. Configurez le site:
   - **Name**: `gestion-projet-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Ajoutez la variable d'environnement:
   - `VITE_API_URL` = `https://gestion-projet-backend.onrender.com/api`
     (Remplacez par l'URL réelle de votre backend notée à l'étape 3)

6. Cliquez sur "Create Static Site"

## Étape 5: Vérifier le déploiement

1. Attendez que les deux services soient déployés (indicateur vert)
2. Cliquez sur l'URL du frontend pour ouvrir votre application
3. Testez les fonctionnalités:
   - Création de projets
   - Ajout de tâches
   - Gestion des clients
   - Notifications par email

## Problèmes courants

### Le backend ne démarre pas
- Vérifiez les logs dans Render
- Assurez-vous que toutes les variables d'environnement sont correctement configurées

### Le frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` pointe vers la bonne URL du backend
- Vérifiez les logs du backend pour voir si les requêtes arrivent

### Les emails ne sont pas envoyés
- Vérifiez que `SMTP_PASS` est correctement configuré
- Assurez-vous que l'email est configuré dans le profil utilisateur

## Mise à jour de l'application

Pour mettre à jour votre application après des modifications:

```bash
git add .
git commit -m "Description des modifications"
git push
```

Render redéploiera automatiquement votre application!

## Support

Si vous rencontrez des problèmes, consultez:
- Documentation Render: https://render.com/docs
- Logs dans le tableau de bord Render
