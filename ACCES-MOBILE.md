# Accès Mobile - Guide d'utilisation

## Configuration effectuée

L'application est maintenant configurée pour être accessible depuis votre téléphone sur le même réseau WiFi.

### Modifications apportées :
- ✅ Backend configuré pour écouter sur toutes les interfaces (`0.0.0.0`)
- ✅ Frontend Vite configuré pour accepter les connexions réseau
- ✅ Affichage automatique de l'adresse IP au démarrage du serveur

## Comment accéder depuis votre téléphone

### Étape 1 : Démarrer l'application

1. Lancez l'application avec `DEMARRAGE.bat`
2. Le serveur affichera dans la console :
   ```
   🚀 Serveur démarré sur le port 5000
   📍 API disponible sur http://localhost:5000/api
   📱 Accès mobile: http://192.168.X.X:5000/api    <-- NOTEZ CETTE ADRESSE
   ```

3. Vite affichera également :
   ```
   Local:   http://localhost:5173/
   Network: http://192.168.X.X:5173/    <-- NOTEZ CETTE ADRESSE
   ```

### Étape 2 : Connecter votre téléphone

**IMPORTANT** : Votre téléphone et votre ordinateur doivent être sur le **MÊME RÉSEAU WiFi**

1. Connectez votre téléphone au même WiFi que votre ordinateur
2. Ouvrez le navigateur de votre téléphone (Chrome, Safari, etc.)
3. Tapez l'adresse affichée dans "Network" (exemple : `http://192.168.1.10:5173`)

### Étape 3 : Utiliser l'application

Vous pouvez maintenant utiliser l'application normalement depuis votre téléphone !

## Résolution des problèmes

### L'adresse ne fonctionne pas ?

1. **Vérifiez que vous êtes sur le même WiFi**
   - L'ordinateur et le téléphone doivent être sur le même réseau

2. **Pare-feu Windows**
   - Windows peut bloquer les connexions
   - Autorisez Node.js dans le pare-feu Windows si demandé

3. **L'application ne démarre pas ?**
   - Redémarrez avec `DEMARRAGE.bat`
   - Attendez que les deux serveurs (backend + frontend) soient démarrés

### Adresse IP changée ?

Votre adresse IP locale peut changer si :
- Vous redémarrez votre ordinateur
- Vous changez de réseau WiFi
- Votre routeur réinitialise les adresses

**Solution** : Relancez l'application et notez la nouvelle adresse affichée

## Notes importantes

- 📱 Fonctionne sur tous les appareils du même réseau (téléphone, tablette, autre ordinateur)
- 🔒 Accessible uniquement sur votre réseau local (pas depuis Internet)
- ⚡ Les performances dépendent de la qualité de votre WiFi
- 🔄 L'application se synchronise en temps réel entre tous les appareils connectés

## Exemple d'utilisation

**Sur PC** : http://localhost:5173
**Sur téléphone** : http://192.168.1.10:5173 (remplacez par votre IP)

Les deux accès pointent vers la même application et partagent les mêmes données !
