# Guide de déploiement sur Netlify - MP3 Auto Tagger

## Introduction

Ce guide explique comment déployer l'application MP3 Auto Tagger sur Netlify, une plateforme d'hébergement serverless similaire à Vercel. Netlify offre un déploiement continu à partir de votre dépôt GitHub et prend en charge les fonctions serverless nécessaires pour notre application.

## Prérequis

- Un compte Netlify
- Un dépôt GitHub contenant votre projet MP3 Auto Tagger
- Node.js version 18 ou supérieure

## Fichiers de configuration ajoutés

Pour permettre le déploiement sur Netlify, les fichiers suivants ont été ajoutés au projet :

1. **netlify.toml** : Configuration principale pour Netlify
2. **netlify-adapter.js** : Adaptateur pour gérer les uploads de fichiers dans l'environnement serverless
3. **netlify/functions/server.js** : Version adaptée du serveur Express pour les fonctions Netlify

## Étapes de déploiement

### 1. Préparation du projet

1. Assurez-vous que tous les fichiers de configuration sont présents dans votre dépôt :
   - `netlify.toml`
   - `netlify-adapter.js`
   - `netlify/functions/server.js`

2. Vérifiez que la dépendance `serverless-http` est ajoutée à votre `package.json`

3. Construisez votre application :
   ```bash
   npm run build
   ```

### 2. Configuration sur Netlify

1. Connectez-vous à votre compte Netlify

2. Cliquez sur "New site from Git"

3. Sélectionnez GitHub comme fournisseur Git

4. Autorisez Netlify à accéder à vos dépôts GitHub

5. Sélectionnez le dépôt contenant votre projet MP3 Auto Tagger

6. Dans les options de déploiement :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`

7. Configurez les variables d'environnement :
   - Cliquez sur "Advanced build settings"
   - Ajoutez la variable `GEMINI_API_KEY` avec votre clé API Gemini

8. Cliquez sur "Deploy site"

### 3. Vérification du déploiement

1. Une fois le déploiement terminé, Netlify vous fournira une URL pour votre site

2. Accédez à cette URL pour vérifier que votre application fonctionne correctement

3. Testez l'upload d'un fichier MP3 pour confirmer que les fonctions serverless fonctionnent

## Résolution des problèmes courants

### Erreur lors de l'upload de fichiers

Si vous rencontrez des erreurs lors de l'upload de fichiers MP3, vérifiez les points suivants :

1. **Logs des fonctions** : Dans le dashboard Netlify, allez dans "Functions" pour voir les logs d'erreur

2. **Taille des fichiers** : Netlify limite la taille des requêtes à 10MB par défaut. Pour les fichiers plus grands :
   - Allez dans "Site settings" > "Functions" > "Serverless functions"
   - Augmentez la limite de taille des requêtes

3. **Timeout des fonctions** : Les fonctions Netlify ont un timeout par défaut de 10 secondes
   - Pour les opérations plus longues, ajustez le timeout dans les paramètres des fonctions

### Problèmes de routage

Si certaines routes ne fonctionnent pas correctement :

1. Vérifiez les redirections dans le fichier `netlify.toml`

2. Assurez-vous que les chemins d'API commencent par `/.netlify/functions/server` dans votre code frontend

## Limitations et considérations

### Stockage temporaire sur Netlify

- Le dossier `/tmp` sur Netlify est limité à 512MB
- Les fichiers stockés dans `/tmp` sont temporaires et peuvent être supprimés à tout moment
- Pour une application en production avec beaucoup d'utilisateurs, envisagez d'utiliser un service de stockage externe

### Solutions alternatives pour le stockage

1. **Amazon S3 ou Google Cloud Storage**
   - Stockage cloud persistant et évolutif
   - Nécessite des modifications du code pour utiliser les SDK appropriés

2. **Cloudinary ou services similaires**
   - Services spécialisés dans la gestion de fichiers multimédias
   - Offrent des fonctionnalités supplémentaires comme le traitement d'images/audio

## Conclusion

Le déploiement d'applications avec upload de fichiers sur Netlify nécessite une configuration spéciale en raison de la nature serverless de la plateforme. Les fichiers de configuration fournis devraient résoudre les problèmes de routage et de gestion des fichiers, mais vous devrez peut-être adapter davantage votre code en fonction des besoins spécifiques de votre application.