// Script de test pour MP3 Auto Tagger
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3002/api';
const TEST_MP3_PATH = path.join(__dirname, 'test-files', 'test-sample.mp3');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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

// Vérifier si le serveur est en cours d'exécution
async function checkServerStatus() {
  try {
    log('🔍 Vérification du statut du serveur...', colors.blue);
    await axios.get(`${API_BASE_URL}/status`);
    log('✓ Le serveur est en cours d'exécution', colors.green);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('✗ Le serveur n\'est pas en cours d\'exécution. Veuillez démarrer le serveur avec "npm run dev"', colors.red);
    } else {
      log(`✗ Erreur lors de la vérification du statut du serveur: ${error.message}`, colors.red);
    }
    return false;
  }
}

// Créer le dossier de test et le fichier MP3 de test si nécessaire
function prepareTestEnvironment() {
  try {
    log('🔧 Préparation de l\'environnement de test...', colors.blue);
    
    // Créer le dossier test-files s'il n'existe pas
    const testFilesDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
      log('✓ Dossier test-files créé', colors.green);
    }
    
    // Vérifier si le fichier MP3 de test existe
    if (!fs.existsSync(TEST_MP3_PATH)) {
      log('⚠️ Aucun fichier MP3 de test trouvé. Veuillez placer un fichier MP3 dans le dossier test-files avec le nom "test-sample.mp3"', colors.yellow);
      return false;
    }
    
    // Vérifier si le dossier uploads existe
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      log('✓ Dossier uploads créé', colors.green);
    }
    
    log('✓ Environnement de test prêt', colors.green);
    return true;
  } catch (error) {
    log(`✗ Erreur lors de la préparation de l'environnement de test: ${error.message}`, colors.red);
    return false;
  }
}

// Tester l'upload de fichier
async function testFileUpload() {
  try {
    log('🧪 Test de l\'upload de fichier...', colors.blue);
    
    // Créer un FormData et ajouter le fichier MP3
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(TEST_MP3_PATH);
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    formData.append('files', blob, 'test-sample.mp3');
    
    // Envoyer la requête
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      log('✓ Test d\'upload réussi', colors.green);
      return response.data.files[0];
    } else {
      log(`✗ Échec du test d'upload: ${response.data.error}`, colors.red);
      return null;
    }
  } catch (error) {
    log(`✗ Erreur lors du test d'upload: ${error.message}`, colors.red);
    return null;
  }
}

// Tester l'analyse des métadonnées
async function testMetadataAnalysis(fileInfo) {
  try {
    log('🧪 Test de l\'analyse des métadonnées...', colors.blue);
    
    // Vérifier si l'analyse a été effectuée lors de l'upload
    if (fileInfo.analysis) {
      log('✓ Analyse des métadonnées réussie', colors.green);
      log('📋 Résultats de l\'analyse:', colors.blue);
      console.log(JSON.stringify(fileInfo.analysis, null, 2));
      return true;
    } else {
      log('✗ Aucune analyse de métadonnées trouvée dans la réponse', colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Erreur lors du test d'analyse des métadonnées: ${error.message}`, colors.red);
    return false;
  }
}

// Tester la génération de couverture
async function testCoverArtGeneration(fileInfo) {
  try {
    log('🧪 Test de la génération de couverture...', colors.blue);
    
    // Vérifier si des mots-clés sont disponibles
    if (!fileInfo.analysis.keywords || fileInfo.analysis.keywords.length === 0) {
      log('⚠️ Aucun mot-clé disponible pour la génération de couverture', colors.yellow);
      return false;
    }
    
    // Envoyer la requête
    const response = await axios.post(`${API_BASE_URL}/generate-cover`, {
      keywords: fileInfo.analysis.keywords
    });
    
    if (response.data.success) {
      log('✓ Test de génération de couverture réussi', colors.green);
      log(`📷 URL de la couverture: ${response.data.imageUrl}`, colors.blue);
      return true;
    } else {
      log(`✗ Échec du test de génération de couverture: ${response.data.error}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Erreur lors du test de génération de couverture: ${error.message}`, colors.red);
    return false;
  }
}

// Tester l'écriture des tags
async function testWriteTags(fileInfo) {
  try {
    log('🧪 Test de l\'écriture des tags...', colors.blue);
    
    // Envoyer la requête
    const response = await axios.post(`${API_BASE_URL}/write-tags`, {
      filePath: fileInfo.path,
      metadata: fileInfo.analysis
    });
    
    if (response.data.success) {
      log('✓ Test d\'écriture des tags réussi', colors.green);
      return true;
    } else {
      log(`✗ Échec du test d'écriture des tags: ${response.data.error}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Erreur lors du test d'écriture des tags: ${error.message}`, colors.red);
    return false;
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests pour MP3 Auto Tagger', colors.blue);
  
  // Vérifier si le serveur est en cours d'exécution
  const serverRunning = await checkServerStatus();
  if (!serverRunning) return;
  
  // Préparer l'environnement de test
  const environmentReady = prepareTestEnvironment();
  if (!environmentReady) return;
  
  // Tester l'upload de fichier
  const fileInfo = await testFileUpload();
  if (!fileInfo) return;
  
  // Tester l'analyse des métadonnées
  const analysisSuccess = await testMetadataAnalysis(fileInfo);
  if (!analysisSuccess) return;
  
  // Tester la génération de couverture
  const coverGenSuccess = await testCoverArtGeneration(fileInfo);
  
  // Tester l'écriture des tags
  const writeTagsSuccess = await testWriteTags(fileInfo);
  
  // Résumé des tests
  log('\n📋 Résumé des tests:', colors.blue);
  log(`- Upload de fichier: ${fileInfo ? '✓' : '✗'}`, fileInfo ? colors.green : colors.red);
  log(`- Analyse des métadonnées: ${analysisSuccess ? '✓' : '✗'}`, analysisSuccess ? colors.green : colors.red);
  log(`- Génération de couverture: ${coverGenSuccess ? '✓' : '✗'}`, coverGenSuccess ? colors.green : colors.red);
  log(`- Écriture des tags: ${writeTagsSuccess ? '✓' : '✗'}`, writeTagsSuccess ? colors.green : colors.red);
  
  if (fileInfo && analysisSuccess && coverGenSuccess && writeTagsSuccess) {
    log('\n✅ Tous les tests ont réussi! L\'application est prête pour le déploiement.', colors.green);
  } else {
    log('\n⚠️ Certains tests ont échoué. Veuillez corriger les problèmes avant le déploiement.', colors.yellow);
  }
}

// Exécuter les tests
runTests();