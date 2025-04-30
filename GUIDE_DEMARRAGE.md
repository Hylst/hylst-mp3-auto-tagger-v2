# Guide de Démarrage Rapide - MP3 Auto Tagger

Ce guide vous aidera à tester, construire et déployer l'application MP3 Auto Tagger.

## Prérequis

- Node.js 14+ installé sur votre machine
- npm ou yarn installé
- Une clé API Gemini (obtenue sur https://ai.google.dev/)

## Configuration initiale

1. **Cloner le dépôt et installer les dépendances**
   ```bash
   git clone <url-du-repo>
   cd "MP3 Auto Tagger vtrae"
   npm install
   ```

2. **Configurer les variables d'environnement**
   - Copiez le fichier `.env.example` vers `.env`
   - Ajoutez votre clé API Gemini dans le fichier `.env`
   ```
   GEMINI_API_KEY=votre_clé_api_ici
   ```

## Tester l'application

### Méthode 1: Démarrage manuel

1. **Démarrer le serveur backend**
   ```bash
   npm run dev
   ```
   Le serveur backend sera accessible à l'adresse http://localhost:3002

2. **Démarrer le serveur frontend (dans un autre terminal)**
   ```bash
   npx vite
   ```
   L'application sera accessible à l'adresse http://localhost:5173

### Méthode 2: Test automatisé

1. **Préparer un fichier MP3 de test**
   - Créez un dossier `test-files` à la racine du projet
   - Placez un fichier MP3 dans ce dossier et nommez-le `test-sample.mp3`

2. **Exécuter le script de test**
   ```bash
   npm run test:app
   ```
   Ce script vérifiera si le serveur est en cours d'exécution, puis testera les principales fonctionnalités de l'application.

## Construire pour la production

### Méthode 1: Build standard

```bash
npm run build
```
Cette commande créera un dossier `dist` avec les fichiers optimisés pour la production.

### Méthode 2: Build complet avec configuration de déploiement

```bash
npm run build:full
```
Cette commande créera un dossier `dist` avec tous les fichiers nécessaires pour le déploiement, y compris le serveur et les configurations.

## Déployer l'application

### Préparer les configurations de déploiement

Après avoir exécuté `npm run build:full`, vous pouvez préparer les configurations pour différentes plateformes d'hébergement :

```bash
# Pour toutes les plateformes
npm run deploy:config

# Pour une plateforme spécifique (standard, heroku, vercel, netlify)
npm run deploy:config -- standard
```

### Déploiement sur un serveur traditionnel

1. Téléchargez les fichiers du dossier `dist` sur votre serveur
2. Installez les dépendances : `npm install --production`
3. Configurez les variables d'environnement
4. Démarrez l'application : `npm start` ou utilisez PM2

### Déploiement sur Heroku

Consultez le fichier `README-HEROKU.md` généré dans le dossier `dist` pour des instructions détaillées.

### Déploiement sur Vercel

Consultez le fichier `README-VERCEL.md` généré dans le dossier `dist` pour des instructions détaillées.

### Déploiement sur Netlify

Consultez le fichier `README-NETLIFY.md` généré dans le dossier `dist` pour des instructions détaillées.

## Résolution des problèmes courants

### Le serveur ne démarre pas

- Vérifiez que le port 3002 n'est pas déjà utilisé par une autre application
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez que le fichier `.env` est correctement configuré

### Erreurs lors de l'upload de fichiers

- Vérifiez que le dossier `uploads` existe et a les permissions d'écriture
- Vérifiez que les fichiers sont au format MP3

### Erreurs avec l'API Gemini

- Vérifiez que votre clé API est valide et correctement configurée
- Vérifiez votre quota d'utilisation de l'API Gemini

## Ressources supplémentaires

- [Documentation de l'API Gemini](https://ai.google.dev/docs)
- [Documentation de Node.js](https://nodejs.org/en/docs/)
- [Documentation de React](https://reactjs.org/docs/getting-started.html)
- [Documentation de Material UI](https://mui.com/getting-started/usage/)