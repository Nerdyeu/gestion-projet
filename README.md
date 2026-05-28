# Samsara Reports — Page Web Standalone

Une **seule page HTML** qui appelle directement l'API Samsara depuis votre navigateur.

## Comment lancer

Double-cliquez simplement sur **`index.html`** — ça s'ouvre dans votre navigateur. C'est tout.

(Ou clic droit → Ouvrir avec → Chrome / Edge / Firefox)

## Utilisation

1. Sélectionnez votre région Samsara (US ou EU)
2. Collez votre token API
3. Cliquez **Sauvegarder**
4. Si vous ne savez pas la région : cliquez **Détecter la région**
5. Choisissez la période, les véhicules, les métriques
6. Cliquez **Générer le rapport**
7. Vous pouvez exporter en CSV

## Confidentialité

- **Aucun backend.** Aucun serveur intermédiaire.
- Le token est stocké dans le **localStorage** de votre navigateur uniquement.
- Les requêtes vont directement à `api.samsara.com` ou `api.eu.samsara.com`.

## Note sur CORS

Samsara autorise les appels depuis le navigateur. Si vous voyez une erreur CORS dans la console, dites-le moi — il faudra alors une petite passerelle.
