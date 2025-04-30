// Fonction serverless pour Netlify
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NodeID3 = require('node-id3');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Importer l'adaptateur Netlify pour la gestion des uploads
const netlifyAdapter = require('../../netlify-adapter');

// Créer l'application Express
const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());

// Utiliser le dossier d'uploads adapté pour Netlify ou environnement local
const uploadsDir = netlifyAdapter.getUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage(netlifyAdapter.getMulterStorage());

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'audio/mpeg') {
      return cb(new Error('Only MP3 files are allowed'), false);
    }
    cb(null, true);
  }
});

// Endpoint de statut pour vérifier si la fonction est en cours d'exécution
router.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'La fonction Netlify est en cours d\'exécution' });
});

// Réutiliser les fonctions d'analyse du fichier server.js principal
// Fonction d'analyse avec Gemini (version simplifiée pour l'exemple)
async function analyzeWithGemini(filePath) {
  try {
    // Initialize the Gemini API client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return {
        titles: ["Sample Title 1", "Sample Title 2"],
        genre: "Unknown",
        subgenre: "Unknown",
        technical: "Unknown",
        creative: "Unknown",
        keywords: ["unknown"],
        mood: ["unknown"],
        usage: ["unknown"],
        lyrics: "",
        language: ""
      };
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Extract basic information about the file
    const fileName = path.basename(filePath);
    
    // Read the audio file as binary data
    const fileData = fs.readFileSync(filePath);
    
    // Créer un prompt pour l'analyse audio
    const prompt = `Analyze this MP3 audio file and provide the following information in JSON format:
    - titles: An array of 8 creative title suggestions based on the audio content
    - genre: The main music genre that best fits this audio
    - subgenre: A more specific subgenre classification
    - technical: A technical description of audio characteristics
    - creative: A creative description of the audio content
    - keywords: An array of up to 14 descriptive keywords
    - mood: An array of mood descriptors
    - usage: An array of potential usage scenarios
    - lyrics: Any detected lyrics in the audio (empty string if none)
    - language: The detected language of any vocals (empty string if instrumental)
    
    Format your response as valid JSON only, with no additional text.`;

    // Implémenter l'appel à l'API Gemini ici
    // Pour cet exemple, nous retournons des données fictives
    return {
      titles: ["Sample Title 1", "Sample Title 2"],
      genre: "Unknown",
      subgenre: "Unknown",
      technical: "Unknown",
      creative: "Unknown",
      keywords: ["unknown"],
      mood: ["unknown"],
      usage: ["unknown"],
      lyrics: "",
      language: ""
    };
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw error;
  }
}

// Endpoint pour l'upload et l'analyse de fichiers MP3
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.path);

    // Lire les métadonnées existantes
    const existingTags = NodeID3.read(req.file.path) || {};
    
    // Analyser le fichier avec Gemini
    const analysisResult = await analyzeWithGemini(req.file.path);
    
    // Retourner les résultats
    res.json({
      existingTags,
      analysis: analysisResult,
      filePath: req.file.path,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: error.message || 'Error processing upload' });
  }
});

// Endpoint pour mettre à jour les tags MP3
router.post('/update-tags', express.json(), async (req, res) => {
  try {
    const { filePath, tags } = req.body;
    
    if (!filePath || !tags) {
      return res.status(400).json({ error: 'Missing filePath or tags' });
    }
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Mettre à jour les tags
    const success = NodeID3.write(tags, filePath);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update tags' });
    }
    
    // Lire les tags mis à jour pour confirmation
    const updatedTags = NodeID3.read(filePath);
    
    res.json({
      success: true,
      message: 'Tags updated successfully',
      updatedTags
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ error: error.message || 'Error updating tags' });
  }
});

// Utiliser le routeur avec le préfixe
app.use('/.netlify/functions/server', router);

// Exporter le handler serverless
module.exports = serverless(app);