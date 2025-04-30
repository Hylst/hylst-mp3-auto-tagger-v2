# Guide de déploiement sur Vercel - MP3 Auto Tagger

## Problème identifié

Lors du déploiement sur Vercel avec le preset VITE, vous avez rencontré l'erreur suivante après avoir sélectionné un fichier MP3 :

```
Error uploading files: Unexpected token 'T', "The page c"... is not valid JSON
```

Ce problème est dû à la façon dont Vercel gère les requêtes API dans un environnement serverless, en particulier pour l'upload de fichiers.

## Solution

### 1. Configuration correcte avec vercel.json

Un fichier `vercel.json` a été créé à la racine de votre projet pour configurer correctement les routes API :

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

### 2. Instructions de déploiement

1. **Préparation du projet**
   - Assurez-vous que le fichier `vercel.json` est présent à la racine du projet
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

### 3. Limitations et solutions alternatives

#### Problème de stockage temporaire

Vercel a des limitations pour le stockage de fichiers dans un environnement serverless :

- Les fonctions serverless ne peuvent pas écrire dans le système de fichiers de manière persistante
- Le dossier `/tmp` est disponible mais limité en taille (512MB) et en durée

#### Solutions alternatives

1. **Utiliser un service de stockage externe**
   - Configurez Amazon S3, Google Cloud Storage ou un service similaire
   - Modifiez le code pour uploader directement vers ce service

2. **Utiliser une API serverless compatible**
   - Adaptez le code pour traiter les fichiers en mémoire sans écriture sur disque
   - Utilisez des services comme Cloudinary pour le traitement des fichiers multimédias

## Conclusion

Le déploiement d'applications avec upload de fichiers sur Vercel nécessite une configuration spéciale en raison de la nature serverless de la plateforme. Le fichier `vercel.json` fourni devrait résoudre les problèmes de routage, mais vous devrez peut-être adapter votre code pour gérer les fichiers différemment dans un environnement serverless.