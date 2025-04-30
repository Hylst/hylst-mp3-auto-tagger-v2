// Configuration de déploiement pour MP3 Auto Tagger
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Fonction pour afficher des messages formatés
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Configurations pour différentes plateformes d'hébergement
const deployConfigs = {
  // Configuration pour un serveur traditionnel
  standard: {
    name: 'Serveur traditionnel',
    prepare: () => {
      // Créer un fichier README spécifique pour l'hébergement standard
      const readmeContent = `# MP3 Auto Tagger - Déploiement sur serveur traditionnel

## Prérequis
- Node.js 14+ installé sur le serveur
- npm ou yarn installé

## Instructions de déploiement

1. Téléchargez les fichiers du dossier \`dist\` sur votre serveur
2. Installez les dépendances :
   \`\`\`
   npm install --production
   \`\`\`
3. Configurez les variables d'environnement :
   - Copiez le fichier \`.env.example\` vers \`.env\`
   - Ajoutez votre clé API Gemini dans le fichier \`.env\`
4. Démarrez l'application :
   \`\`\`
   npm start
   \`\`\`
   ou utilisez un gestionnaire de processus comme PM2 :
   \`\`\`
   npm install -g pm2
   pm2 start server.js --name mp3-auto-tagger
   \`\`\`

5. Configurez un proxy inverse (Nginx/Apache) pour rediriger le trafic vers votre application

### Exemple de configuration Nginx
\`\`\`nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'README-STANDARD.md'),
        readmeContent
      );
      
      log('✓ Configuration pour serveur traditionnel préparée', colors.green);
    }
  },
  
  // Configuration pour Heroku
  heroku: {
    name: 'Heroku',
    prepare: () => {
      // Créer un fichier Procfile pour Heroku
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'Procfile'),
        'web: node server.js'
      );
      
      // Créer un fichier README spécifique pour Heroku
      const readmeContent = `# MP3 Auto Tagger - Déploiement sur Heroku

## Instructions de déploiement

1. Installez l'outil Heroku CLI et connectez-vous
   \`\`\`
   npm install -g heroku
   heroku login
   \`\`\`

2. Créez une nouvelle application Heroku
   \`\`\`
   heroku create votre-app-name
   \`\`\`

3. Initialisez un dépôt Git dans le dossier dist
   \`\`\`
   cd dist
   git init
   git add .
   git commit -m "Initial commit"
   \`\`\`

4. Ajoutez le remote Heroku et poussez le code
   \`\`\`
   heroku git:remote -a votre-app-name
   git push heroku master
   \`\`\`

5. Configurez les variables d'environnement
   \`\`\`
   heroku config:set GEMINI_API_KEY=votre_clé_api_ici
   \`\`\`

6. Ouvrez l'application dans votre navigateur
   \`\`\`
   heroku open
   \`\`\`
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'README-HEROKU.md'),
        readmeContent
      );
      
      log('✓ Configuration pour Heroku préparée', colors.green);
    }
  },
  
  // Configuration pour Vercel
  vercel: {
    name: 'Vercel',
    prepare: () => {
      // Créer un fichier vercel.json
      const vercelConfig = {
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
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
      );
      
      // Créer un fichier README spécifique pour Vercel
      const readmeContent = `# MP3 Auto Tagger - Déploiement sur Vercel

## Instructions de déploiement

1. Installez l'outil Vercel CLI et connectez-vous
   \`\`\`
   npm install -g vercel
   vercel login
   \`\`\`

2. Déployez l'application
   \`\`\`
   cd dist
   vercel
   \`\`\`

3. Configurez les variables d'environnement dans le dashboard Vercel
   - Allez sur https://vercel.com/dashboard
   - Sélectionnez votre projet
   - Allez dans "Settings" > "Environment Variables"
   - Ajoutez la variable GEMINI_API_KEY avec votre clé API

4. Redéployez l'application avec les variables d'environnement
   \`\`\`
   vercel --prod
   \`\`\`
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'README-VERCEL.md'),
        readmeContent
      );
      
      log('✓ Configuration pour Vercel préparée', colors.green);
    }
  },
  
  // Configuration pour Netlify
  netlify: {
    name: 'Netlify',
    prepare: () => {
      // Créer un fichier netlify.toml
      const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'netlify.toml'),
        netlifyConfig
      );
      
      // Créer un dossier functions
      const functionsDir = path.join(__dirname, 'dist', 'functions');
      if (!fs.existsSync(functionsDir)) {
        fs.mkdirSync(functionsDir, { recursive: true });
      }
      
      // Créer un fichier README spécifique pour Netlify
      const readmeContent = `# MP3 Auto Tagger - Déploiement sur Netlify

## Instructions de déploiement

1. Installez l'outil Netlify CLI et connectez-vous
   \`\`\`
   npm install -g netlify-cli
   netlify login
   \`\`\`

2. Initialisez votre site Netlify
   \`\`\`
   cd dist
   netlify init
   \`\`\`

3. Configurez les variables d'environnement
   \`\`\`
   netlify env:set GEMINI_API_KEY votre_clé_api_ici
   \`\`\`

4. Déployez l'application
   \`\`\`
   netlify deploy --prod
   \`\`\`

**Note importante**: Pour que l'application fonctionne correctement sur Netlify, vous devrez adapter le serveur Express pour fonctionner comme des fonctions Netlify. Consultez la documentation de Netlify pour plus d'informations.
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'dist', 'README-NETLIFY.md'),
        readmeContent
      );
      
      log('✓ Configuration pour Netlify préparée', colors.green);
    }
  }
};

// Fonction pour préparer les configurations de déploiement
function prepareDeployConfigs(platform = 'all') {
  log('🚀 Préparation des configurations de déploiement...', colors.blue);
  
  // Vérifier si le dossier dist existe
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    log('⚠️ Le dossier dist n\'existe pas. Veuillez d\'abord exécuter "npm run build:full"', colors.yellow);
    return;
  }
  
  if (platform === 'all') {
    // Préparer toutes les configurations
    Object.values(deployConfigs).forEach(config => {
      log(`🔧 Préparation de la configuration pour ${config.name}...`, colors.blue);
      config.prepare();
    });
  } else if (deployConfigs[platform]) {
    // Préparer une configuration spécifique
    log(`🔧 Préparation de la configuration pour ${deployConfigs[platform].name}...`, colors.blue);
    deployConfigs[platform].prepare();
  } else {
    log(`⚠️ Plateforme inconnue: ${platform}. Options disponibles: ${Object.keys(deployConfigs).join(', ')}`, colors.yellow);
    return;
  }
  
  log('✅ Configurations de déploiement préparées avec succès!', colors.green);
}

// Fonction principale
function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'all';
  
  prepareDeployConfigs(platform);
}

// Exécuter le script
main();