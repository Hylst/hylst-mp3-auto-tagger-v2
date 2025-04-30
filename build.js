// Script de build pour MP3 Auto Tagger
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Vérifier si le dossier dist existe et le créer si nécessaire
function checkDistFolder() {
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    log('✓ Dossier dist créé', colors.green);
  }
}

// Mettre à jour package.json pour ajouter les scripts de build
function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Ajouter les scripts nécessaires s'ils n'existent pas
  let updated = false;
  
  if (!packageJson.scripts.build) {
    packageJson.scripts.build = 'vite build';
    updated = true;
  }
  
  if (!packageJson.scripts['build:full']) {
    packageJson.scripts['build:full'] = 'node build.js';
    updated = true;
  }
  
  if (!packageJson.scripts.preview) {
    packageJson.scripts.preview = 'vite preview';
    updated = true;
  }
  
  if (!packageJson.scripts['start:prod']) {
    packageJson.scripts['start:prod'] = 'node server.js';
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✓ package.json mis à jour avec les scripts de build', colors.green);
  }
}

// Exécuter le build Vite
function runViteBuild() {
  try {
    log('🔨 Exécution du build frontend avec Vite...', colors.blue);
    execSync('npx vite build', { stdio: 'inherit' });
    log('✓ Build frontend terminé avec succès', colors.green);
    return true;
  } catch (error) {
    log(`✗ Erreur lors du build frontend: ${error.message}`, colors.red);
    return false;
  }
}

// Copier les fichiers nécessaires pour la production
function copyProductionFiles() {
  try {
    // Copier server.js dans dist
    fs.copyFileSync(
      path.join(__dirname, 'server.js'),
      path.join(__dirname, 'dist', 'server.js')
    );
    
    // Copier package.json (version simplifiée pour la production)
    const packageJson = require('./package.json');
    const prodPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: 'server.js',
      scripts: {
        start: 'node server.js'
      },
      dependencies: packageJson.dependencies
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'dist', 'package.json'),
      JSON.stringify(prodPackageJson, null, 2)
    );
    
    // Créer un exemple de .env pour la production
    const envExample = 'GEMINI_API_KEY=your_api_key_here\nPORT=3002\n';
    fs.writeFileSync(
      path.join(__dirname, 'dist', '.env.example'),
      envExample
    );
    
    // Créer un README pour le déploiement
    const readmeContent = `# MP3 Auto Tagger - Version de Production

## Installation

1. Installez les dépendances :
   \`\`\`
   npm install
   \`\`\`

2. Configurez les variables d'environnement :
   - Copiez le fichier `.env.example` vers `.env`
   - Ajoutez votre clé API Gemini dans le fichier `.env`

3. Démarrez l'application :
   \`\`\`
   npm start
   \`\`\`

L'application sera accessible à l'adresse http://localhost:3002
`;
    
    fs.writeFileSync(
      path.join(__dirname, 'dist', 'README.md'),
      readmeContent
    );
    
    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(__dirname, 'dist', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    log('✓ Fichiers de production copiés avec succès', colors.green);
    return true;
  } catch (error) {
    log(`✗ Erreur lors de la copie des fichiers: ${error.message}`, colors.red);
    return false;
  }
}

// Fonction principale
async function build() {
  log('🚀 Démarrage du processus de build pour MP3 Auto Tagger', colors.blue);
  
  // Mettre à jour package.json
  updatePackageJson();
  
  // Vérifier le dossier dist
  checkDistFolder();
  
  // Exécuter le build Vite
  const buildSuccess = runViteBuild();
  if (!buildSuccess) {
    log('⚠️ Le build a échoué, arrêt du processus', colors.yellow);
    return;
  }
  
  // Copier les fichiers pour la production
  const copySuccess = copyProductionFiles();
  if (!copySuccess) {
    log('⚠️ La copie des fichiers a échoué', colors.yellow);
    return;
  }
  
  log('✅ Build terminé avec succès! Le dossier "dist" contient la version de production.', colors.green);
  log('📋 Instructions de déploiement :', colors.blue);
  log('1. Copiez le contenu du dossier "dist" sur votre serveur', colors.reset);
  log('2. Installez les dépendances avec "npm install"', colors.reset);
  log('3. Configurez le fichier .env avec votre clé API', colors.reset);
  log('4. Démarrez l'application avec "npm start"', colors.reset);
}

// Exécuter le build
build();