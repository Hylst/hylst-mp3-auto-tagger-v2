// Script de déploiement pour Netlify
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Préparation du déploiement pour Netlify...');

// Vérifier si les fichiers de configuration existent
const requiredFiles = [
  'netlify.toml',
  'netlify-adapter.js',
  'netlify/functions/server.js'
];

let missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Fichiers manquants pour le déploiement Netlify:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Vérifier si serverless-http est installé
const packageJson = require('./package.json');
if (!packageJson.dependencies['serverless-http']) {
  console.log('📦 Installation de serverless-http...');
  try {
    execSync('npm install --save serverless-http', { stdio: 'inherit' });
    console.log('✅ serverless-http installé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation de serverless-http:', error.message);
    process.exit(1);
  }
}

// Construire l'application
console.log('🔨 Construction de l\'application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application construite avec succès');
} catch (error) {
  console.error('❌ Erreur lors de la construction de l\'application:', error.message);
  process.exit(1);
}

// Vérifier si le dossier dist existe
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error('❌ Le dossier dist n\'a pas été créé. Vérifiez votre configuration de build.');
  process.exit(1);
}

console.log('\n✅ Préparation terminée! Votre projet est prêt pour le déploiement sur Netlify.');
console.log('\nPour déployer avec Netlify CLI:');
console.log('1. Installez Netlify CLI: npm install -g netlify-cli');
console.log('2. Connectez-vous: netlify login');
console.log('3. Initialisez le projet: netlify init');
console.log('4. Déployez: netlify deploy --prod');

console.log('\nOu déployez directement depuis l\'interface Netlify en connectant votre dépôt GitHub.');
console.log('N\'oubliez pas de configurer la variable d\'environnement GEMINI_API_KEY dans les paramètres de votre site Netlify.');