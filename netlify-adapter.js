// Adaptateur pour Netlify - Gestion des uploads dans un environnement serverless
const path = require('path');
const os = require('os');
const fs = require('fs');

// Fonction pour vérifier si l'application s'exécute sur Netlify
function isRunningOnNetlify() {
  return process.env.NETLIFY === 'true';
}

// Configuration adaptée pour Netlify
function getUploadsDir() {
  // Sur Netlify, utiliser le dossier /tmp qui est disponible pour les fonctions serverless
  if (isRunningOnNetlify()) {
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
  isRunningOnNetlify,
  getUploadsDir,
  getMulterStorage
};