# Guide de déploiement sur Vercel - MP3 Auto Tagger

## Problème identifié

Lors du déploiement sur Vercel avec le preset VITE depuis GitHub, l'erreur suivante apparaît après avoir sélectionné un fichier MP3 :

```
Error uploading files: Unexpected token 'T', "The page c"... is not valid JSON
```

Cette erreur se produit uniquement dans l'environnement Vercel et non en local.

## Causes du problème

1. **Environnement serverless** : Vercel utilise des fonctions serverless qui ont des limitations concernant le système de fichiers.
2. **Gestion des uploads** : Le code actuel utilise `multer` pour stocker les fichiers dans un dossier local, ce qui n'est pas compatible avec l'architecture serverless de Vercel.
3. **Configuration des routes** : Les routes API ne sont pas correctement configurées pour l'environnement Vercel.

## Solutions implémentées

### 1. Fichier de configuration Vercel

Un fichier `vercel.json` a été créé à la racine du projet pour configurer correctement les routes API :

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "dist/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "dist/$1" }
  ],
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

### 2. Adaptateur pour Vercel

Un fichier `vercel-adapter.js` a été créé pour adapter la gestion des uploads dans un environnement serverless :

```javascript
// Adaptateur pour Vercel - Gestion des uploads dans un environnement serverless
const path = require('path');
const os = require('os');
const fs = require('fs');

// Fonction pour vérifier si l'application s'exécute sur Vercel
function isRunningOnVercel() {
  return process.env.VERCEL === '1';
}

// Configuration adaptée pour Vercel
function getUploadsDir() {
  // Sur Vercel, utiliser le dossier /tmp qui est disponible pour les fonctions serverless
  if (isRunningOnVercel()) {
    const tmpDir = path.join(os.tmpdir(), 'mp3-auto-tagger-uploads');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }
  
  // En local, utiliser le dossier uploads standard
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Fonction pour adapter la configuration multer
function getMulterStorage() {
  const uploadsDir = getUploadsDir();
  console.log(`Utilisation du dossier d'uploads: ${uploadsDir}`);
  
  return {
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  };
}

module.exports = {
  isRunningOnVercel,
  getUploadsDir,
  getMulterStorage
};
```

### 3. Modification du serveur

Le fichier `server.js` a été modifié pour utiliser l'adaptateur Vercel :

```javascript
// Importer l'adaptateur Vercel pour la gestion des uploads
const vercelAdapter = require('./vercel-adapter');

// Utiliser le dossier d'uploads adapté pour Vercel ou environnement local
const uploadsDir = vercelAdapter.getUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage(vercelAdapter.getMulterStorage());
```

### 4. Amélioration de la gestion des erreurs

Le composant `FileUploader.jsx` a été amélioré pour mieux gérer les erreurs de réponse :

```javascript
// Vérifier si la réponse est OK avant de tenter de parser le JSON
if (!response.ok) {
  throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
}

// Vérifier le type de contenu pour s'assurer qu'il s'agit bien de JSON
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  throw new Error(`Réponse non-JSON reçue: ${contentType}`);
}
```

## Instructions de déploiement

1. **Préparation du projet**
   - Assurez-vous que les fichiers `vercel.json` et `vercel-adapter.js` sont présents à la racine du projet
   - Vérifiez que les modifications dans `server.js` et `FileUploader.jsx` sont bien appliquées
   - Construisez votre application : `npm run build`

2. **Configuration des variables d'environnement sur Vercel**
   - Dans le dashboard Vercel, allez dans les paramètres de votre projet
   - Ajoutez la variable d'environnement `GEMINI_API_KEY` avec votre clé API

3. **Déploiement**
   - Utilisez l'interface Vercel pour déployer depuis votre dépôt GitHub
   - Ou utilisez la CLI Vercel :
     ```bash
     npm install -g vercel
     vercel login
     vercel
     ```

## Limitations et considérations

### Stockage temporaire sur Vercel

- Le dossier `/tmp` sur Vercel est limité à 512MB
- Les fichiers stockés dans `/tmp` sont temporaires et peuvent être supprimés à tout moment
- Pour une application en production avec beaucoup d'utilisateurs, envisagez d'utiliser un service de stockage externe

### Solutions alternatives pour le stockage

1. **Amazon S3 ou Google Cloud Storage**
   - Stockage cloud persistant et évolutif
   - Nécessite des modifications du code pour utiliser les SDK appropriés

2. **Cloudinary ou services similaires**
   - Services spécialisés dans la gestion de fichiers multimédias
   - Offrent des fonctionnalités supplémentaires comme le traitement d'images/audio

## Dépannage

Si vous rencontrez toujours des problèmes après avoir appliqué ces modifications :

1. **Vérifiez les logs Vercel**
   - Dans le dashboard Vercel, consultez les logs de fonction pour identifier les erreurs

2. **Testez l'API séparément**
   - Utilisez un outil comme Postman pour tester directement l'endpoint `/api/upload`

3. **Augmentez les logs côté serveur**
   - Ajoutez des logs détaillés dans `server.js` pour suivre le flux d'exécution

4. **Vérifiez les limites de taille**
   - Vercel a des limites sur la taille des requêtes (4MB par défaut)
   - Pour les fichiers plus grands, envisagez un upload direct vers un service de stockage