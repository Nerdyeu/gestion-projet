# Samsara Reports

## Lancement

### Méthode simple (Windows)

Double-cliquez sur **`LANCER.bat`**.

### Méthode manuelle

Ouvrez un terminal dans ce dossier et tapez :

```bash
node server.js
```

Puis ouvrez **http://localhost:3000** dans votre navigateur.

## Utilisation

1. Sélectionnez votre région Samsara (US ou EU)
2. Collez votre token API
3. Cliquez **Sauvegarder** (le token est testé automatiquement)
4. Si vous ne savez pas la région : cliquez **Détecter la région**
5. Choisissez la période, les véhicules, les métriques
6. Cliquez **Générer le rapport**
7. Exportez en CSV si besoin

## Architecture

- **`index.html`** : interface (HTML + Tailwind via CDN + JavaScript vanilla)
- **`server.js`** : mini serveur local (Node.js, sans dépendances) qui sert la page et fait office de proxy vers Samsara pour contourner CORS

## Confidentialité

- Le token est stocké dans le **localStorage** de votre navigateur
- Les requêtes passent par le proxy local qui les transmet à Samsara
- Aucune donnée n'est conservée côté serveur
