# Samsara Reports

Application web de rapports de consommation de flotte via l'API Samsara.

## Lancement

### Windows
Double-cliquez sur **DEMARRAGE.bat**

### Manuel (2 terminaux)

**Terminal 1 — Backend**
```bash
cd backend
npm install
npx prisma db push
node server.js
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```

Ouvrez **http://localhost:4000**

## Configuration

1. Ouvrez l'application
2. Entrez votre token API Samsara (disponible dans Samsara → Paramètres → Accès API)
3. Cliquez sur Sauvegarder puis Tester

## Fonctionnalités

- Configuration du token API Samsara
- Sélection de la période (raccourcis + dates libres)
- Sélection des véhicules
- Métriques : carburant (%), distance (km), heures moteur
- Calcul du coût estimé (prix carburant + capacité réservoir)
- Tableau trié par colonne avec totaux
- Export CSV
