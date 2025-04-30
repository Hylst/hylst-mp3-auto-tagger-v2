require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NodeID3 = require('node-id3');
const axios = require('axios');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3002; // Changé de 3000 à 3002 pour éviter les conflits de port

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint de statut pour vérifier si le serveur est en cours d'exécution
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Le serveur est en cours d\'exécution' });
});

// Importer l'adaptateur Vercel pour la gestion des uploads
const vercelAdapter = require('./vercel-adapter');

// Utiliser le dossier d'uploads adapté pour Vercel ou environnement local
const uploadsDir = vercelAdapter.getUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage(vercelAdapter.getMulterStorage());


const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'audio/mpeg') {
      return cb(new Error('Only MP3 files are allowed'), false);
    }
    cb(null, true);
  }
});

// Mock Gemini API response for development
const mockGeminiAnalysis = (filename) => {
  return {
    titles: [
      "Summer Breeze", "Ocean Waves", "Sunset Dreams", 
      "Coastal Journey", "Beach Memories", "Tropical Escape", 
      "Island Vibes", "Paradise Found"
    ],
    genre: "Electronic",
    subgenre: "Chillwave",
    technical: "128 kbps, 44.1 kHz, stereo track with balanced frequency response",
    creative: "A dreamy electronic piece that evokes images of sunset beaches and ocean waves, with atmospheric pads and gentle percussion.",
    keywords: [
      "relaxing", "atmospheric", "electronic", "ambient", "beach", 
      "ocean", "waves", "sunset", "tropical", "chill", 
      "summer", "vacation", "coastal", "dreamy"
    ],
    mood: ["calm", "relaxed", "peaceful", "nostalgic"],
    usage: ["meditation", "background music", "travel videos", "relaxation"],
    lyrics: filename.includes('lyrics') ? "Sample lyrics would go here..." : "",
    language: filename.includes('lyrics') ? "en" : ""
  };
};

// Analyze MP3 with Gemini API
async function analyzeWithGemini(filePath) {
  try {
    // Initialize the Gemini API client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return mockGeminiAnalysis(path.basename(filePath));
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Extract basic information about the file
    const fileName = path.basename(filePath);
    
    // Read the audio file as binary data
    const fileData = fs.readFileSync(filePath);
    
    // Create a prompt for audio analysis with the actual audio content
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
    
    // Prepare the audio data for the API request
    const audioData = {
      inlineData: {
        data: fileData.toString('base64'),
        mimeType: 'audio/mpeg'
      }
    };
    
    // Set generation config for better JSON responses
    const generationConfig = {
      temperature: 0.2,  // Lower temperature for more deterministic responses
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };
    
    // Generate content with Gemini using both the prompt and audio data
    const result = await model.generateContent([prompt, audioData], { generationConfig });
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the JSON response
      const analysisData = JSON.parse(text);
      
      // Validate the response structure
      const requiredFields = ['titles', 'genre', 'subgenre', 'technical', 'creative', 'keywords', 'mood', 'usage'];
      const missingFields = requiredFields.filter(field => !analysisData[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Gemini response missing fields: ${missingFields.join(', ')}. Using mock data.`);
        return { ...mockGeminiAnalysis(fileName), ...analysisData };
      }
      
      // Ensure arrays are properly formatted
      ['titles', 'keywords', 'mood', 'usage'].forEach(field => {
        if (analysisData[field] && !Array.isArray(analysisData[field])) {
          analysisData[field] = analysisData[field].split(/,\s*/);
        }
      });
      
      return analysisData;
    } catch (parseError) {
      console.error('Error parsing Gemini API response:', parseError);
      // Fallback to mock data if parsing fails
      return mockGeminiAnalysis(fileName);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to mock data if API call fails
    return mockGeminiAnalysis(path.basename(filePath));
  }
}

// Generate cover art with Gemini API
async function generateCoverArt(keywords) {
  try {
    // Initialize the Gemini API client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return { imageUrl: 'https://via.placeholder.com/500x500?text=Generated+Cover+Art' };
    }
    
    // Vérifier que les mots-clés sont valides
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
      console.error('Aucun mot-clé fourni pour la génération de pochette');
      return { imageUrl: 'https://via.placeholder.com/500x500?text=Keywords+Required' };
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create a prompt for image generation
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    console.log(`Génération de pochette avec les mots-clés: ${keywordsString}`);
    
    const prompt = `Generate a high-quality album cover art image based on these keywords: ${keywordsString}. 
    The image should be visually appealing, professional, and suitable for use as album artwork.
    Return ONLY the base64-encoded image data without any text or explanation.`;
    
    // Set generation config for image output
    const generationConfig = {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048,
      responseMimeType: 'image/jpeg'
    };
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt, { generationConfig });
    const response = await result.response;
    
    // Check if we have a binary response (image data)
    if (response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts && 
        response.candidates[0].content.parts[0] && 
        response.candidates[0].content.parts[0].inlineData) {
      
      // Extract the base64 image data
      const imageData = response.candidates[0].content.parts[0].inlineData.data;
      
      // Create a data URL for the image
      const imageUrl = `data:image/jpeg;base64,${imageData}`;
      console.log('Pochette générée avec succès (format inlineData)');
      return { imageUrl };
    } else {
      // If no image data is found, try to extract text that might contain image data
      const text = response.text();
      console.log('Recherche de données d\'image dans la réponse textuelle');
      
      // Check if the text contains a base64 image
      const base64Match = text.match(/data:image\/(jpeg|png|gif);base64,([^"\s]+)/i);
      if (base64Match && base64Match[2]) {
        console.log(`Pochette trouvée dans le texte (format ${base64Match[1]})`);
        return { imageUrl: `data:image/${base64Match[1]};base64,${base64Match[2]}` };
      }
      
      // If we still don't have an image, use a placeholder
      console.warn('Aucune donnée d\'image trouvée dans la réponse Gemini, utilisation d\'un placeholder');
      const placeholderText = encodeURIComponent(keywordsString.substring(0, 30));
      return { imageUrl: `https://via.placeholder.com/500x500?text=${placeholderText}` };
    }
  } catch (error) {
    console.error('Error generating cover art with Gemini API:', error);
    // Fallback to placeholder if API call fails
    return { imageUrl: 'https://via.placeholder.com/500x500?text=Generated+Cover+Art' };
  }
}

// API endpoint to upload MP3 files
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    console.log(`Début du traitement de ${req.files.length} fichier(s) MP3`);
    const results = [];
    
    for (const file of req.files) {
      const filePath = file.path;
      const stats = fs.statSync(filePath);
      
      console.log(`Analyse du fichier MP3: ${file.originalname}`);
      // Analyze the MP3 file
      const analysis = await analyzeWithGemini(filePath);
      console.log(`Analyse terminée pour ${file.originalname}: genre détecté: ${analysis.genre}, sous-genre: ${analysis.subgenre}`);
      
      results.push({
        id: path.basename(filePath),
        originalName: file.originalname,
        path: filePath,
        size: file.size,
        duration: 0, // In a real app, extract this from the MP3
        createdAt: stats.birthtime,
        analysis
      });
    }
    
    console.log(`Traitement terminé avec succès pour ${req.files.length} fichier(s)`);
    res.json({ success: true, files: results, logs: { message: `${req.files.length} fichier(s) analysé(s) avec succès`, details: req.files.map(f => f.originalname) } });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Importer les fonctions de gestion des métadonnées avancées
const metadataConfigPath = path.join(__dirname, 'src', 'config', 'metadataConfig.js');
let advancedTags, namingTemplates, musicPresets, applyNamingTemplate;

// Charger dynamiquement la configuration des métadonnées
try {
  // Pour Node.js, nous devons utiliser require() au lieu d'import
  const metadataConfig = require('./src/config/metadataConfig.js');
  advancedTags = metadataConfig.advancedTags;
  namingTemplates = metadataConfig.namingTemplates;
  musicPresets = metadataConfig.musicPresets;
  applyNamingTemplate = metadataConfig.applyNamingTemplate;
  console.log('Configuration des métadonnées avancées chargée avec succès');
} catch (error) {
  console.error('Erreur lors du chargement de la configuration des métadonnées:', error);
  // Définir des valeurs par défaut en cas d'erreur
  advancedTags = { standard: {}, extended: {}, custom: {} };
  namingTemplates = {};
  musicPresets = {};
  applyNamingTemplate = (template, metadata) => template;
}

// API endpoint to write ID3 tags
app.post('/api/write-tags', async (req, res) => {
  try {
    const { filePath, metadata, namingTemplate } = req.body;
    
    // Vérifier que les paramètres requis sont présents
    if (!filePath) {
      console.error('Aucun chemin de fichier fourni pour l\'écriture des tags ID3');
      return res.status(400).json({ success: false, error: 'File path is required' });
    }
    
    if (!metadata) {
      console.error('Aucune métadonnée fournie pour l\'écriture des tags ID3');
      return res.status(400).json({ success: false, error: 'Metadata is required' });
    }
    
    const fileName = path.basename(filePath);
    
    console.log(`Début de l'écriture des tags ID3 pour: ${fileName}`);
    console.log(`Chemin complet du fichier: ${filePath}`);
    
    // Vérifier si le chemin est absolu ou relatif
    const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    console.log(`Chemin absolu utilisé: ${absoluteFilePath}`);
    
    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`Fichier non trouvé: ${absoluteFilePath}`);
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    console.log(`Préparation des tags pour: ${fileName}`);
    console.log(`Tags à écrire: titre="${metadata.title || 'Non spécifié'}", genre="${metadata.genre || 'Non spécifié'}", sous-genre="${metadata.subgenre || 'Non spécifié'}"`);
    
    // Préparer les tags standard et étendus
    const tags = {
      title: metadata.title || '',
      artist: metadata.artist || '',
      album: metadata.subgenre || '',
      genre: metadata.genre || '',
      comment: { language: 'eng', text: metadata.technical || '' },
      userDefinedText: [
        { description: 'CREATIVE', value: metadata.creative || '' },
        { description: 'KEYWORDS', value: Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : '' },
        { description: 'MOOD', value: Array.isArray(metadata.mood) ? metadata.mood.join(', ') : '' },
        { description: 'USAGE', value: Array.isArray(metadata.usage) ? metadata.usage.join(', ') : '' },
        { description: 'SONG', value: metadata.song || '1' }
      ]
    };
    
    // Ajouter les tags ID3v2.4 étendus s'ils sont présents dans les métadonnées
    if (metadata.bpm) tags.bpm = metadata.bpm;
    if (metadata.initialKey) tags.initialKey = metadata.initialKey;
    if (metadata.composer) tags.composer = metadata.composer;
    if (metadata.publisher) tags.publisher = metadata.publisher;
    if (metadata.copyright) tags.copyright = metadata.copyright;
    if (metadata.encodedBy) tags.encodedBy = metadata.encodedBy;
    if (metadata.encodingSettings) tags.encodingSettings = metadata.encodingSettings;
    if (metadata.language) tags.language = metadata.language;
    if (metadata.compilation) tags.compilation = metadata.compilation;
    if (metadata.year) tags.year = metadata.year;
    if (metadata.trackNumber) tags.trackNumber = metadata.trackNumber;
    if (metadata.date) tags.date = metadata.date;
    
    // Ajouter des tags personnalisés supplémentaires
    if (metadata.energy) {
      tags.userDefinedText.push({ description: 'ENERGY', value: metadata.energy });
    }
    if (metadata.danceability) {
      tags.userDefinedText.push({ description: 'DANCEABILITY', value: metadata.danceability });
    }
    if (metadata.acousticness) {
      tags.userDefinedText.push({ description: 'ACOUSTICNESS', value: metadata.acousticness });
    }
    if (metadata.instrumental) {
      tags.userDefinedText.push({ description: 'INSTRUMENTAL', value: metadata.instrumental });
    }
    if (metadata.tempoCategory) {
      tags.userDefinedText.push({ description: 'TEMPO_CATEGORY', value: metadata.tempoCategory });
    }
    
    // Add lyrics if present
    if (metadata.lyrics) {
      console.log(`Ajout des paroles en langue: ${metadata.language || 'eng'}`);
      tags.unsynchronisedLyrics = {
        language: metadata.language || 'eng',
        text: metadata.lyrics
      };
    }
    
    // Add cover art if present
    if (metadata.coverArt) {
      console.log(`Traitement de la pochette d'album pour: ${fileName}`);
      try {
        // Check if the coverArt is a data URL
        if (metadata.coverArt.startsWith('data:image/')) {
          // Extract the base64 data from the data URL
          const matches = metadata.coverArt.match(/^data:image\/(\w+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const imageType = matches[1];
            const imageBuffer = Buffer.from(matches[2], 'base64');
            
            // Add the image to the tags
            tags.image = {
              mime: `image/${imageType}`,
              type: { id: 3, name: 'front cover' }, // 3 is the ID for front cover
              description: 'Album cover',
              imageBuffer
            };
            console.log(`Pochette d'album ajoutée (${imageType}) aux tags ID3`);
          } else {
            console.warn('Format de données d\'image invalide dans la pochette');
          }
        } else if (metadata.coverArt.startsWith('http')) {
          // For remote URLs, we would need to download the image first
          // This would be implemented in a production app
          console.log('Les URLs distantes pour les pochettes ne sont pas encore supportées');
        } else {
          console.warn('Format de pochette non reconnu:', metadata.coverArt.substring(0, 30) + '...');
        }
      } catch (imageError) {
        console.error(`Erreur lors de l'ajout de la pochette aux tags ID3:`, imageError);
      }
    }
    
    console.log(`Écriture des tags ID3 dans le fichier: ${fileName}`);
    const success = NodeID3.write(tags, absoluteFilePath);
    
    if (success) {
      console.log(`Tags ID3 écrits avec succès pour: ${fileName}`);
      res.json({ 
        success: true, 
        logs: { 
          message: `Tags ID3 écrits avec succès`, 
          details: `Fichier: ${fileName}\nTitre: ${metadata.title || 'Non spécifié'}\nGenre: ${metadata.genre || 'Non spécifié'}\nSous-genre: ${metadata.subgenre || 'Non spécifié'}` 
        } 
      });
    } else {
      console.error(`Échec de l'écriture des tags ID3 pour: ${fileName}`);
      res.status(500).json({ success: false, error: 'Failed to write tags' });
    }
  } catch (error) {
    console.error('Error writing ID3 tags:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint pour appliquer un modèle de nommage
app.post('/api/apply-naming-template', (req, res) => {
  try {
    const { filePath, metadata, templatePattern } = req.body;
    
    // Vérifier que les paramètres requis sont présents
    if (!filePath || !templatePattern) {
      console.error('Paramètres manquants pour l\'application du modèle de nommage');
      return res.status(400).json({ success: false, error: 'File path and template pattern are required' });
    }
    
    // Vérifier si le fichier existe
    const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`Fichier non trouvé: ${absoluteFilePath}`);
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Appliquer le modèle de nommage
    const newFileName = applyNamingTemplate(templatePattern, metadata);
    
    // Construire le nouveau chemin complet
    const dirName = path.dirname(absoluteFilePath);
    const newFilePath = path.join(dirName, `${newFileName}.mp3`);
    
    console.log(`Application du modèle de nommage: ${path.basename(absoluteFilePath)} -> ${newFileName}.mp3`);
    
    // Renvoyer le nouveau nom sans effectuer le renommage
    res.json({ 
      success: true, 
      originalPath: absoluteFilePath,
      newName: newFileName,
      newPath: newFilePath,
      logs: { message: `Modèle de nommage appliqué avec succès`, details: `Nouveau nom: ${newFileName}.mp3` } 
    });
  } catch (error) {
    console.error('Erreur lors de l\'application du modèle de nommage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to rename file
app.post('/api/rename', (req, res) => {
  try {
    const { filePath, newName, useTemplate } = req.body;
    
    // Vérifier que les paramètres requis sont présents
    if (!filePath) {
      console.error('Aucun chemin de fichier fourni pour le renommage');
      return res.status(400).json({ success: false, error: 'File path is required' });
    }
    
    if (!newName) {
      console.error('Aucun nouveau nom fourni pour le renommage');
      return res.status(400).json({ success: false, error: 'New name is required' });
    }
    
    // Nettoyer le nouveau nom pour éviter les caractères problématiques dans les noms de fichiers
    const sanitizedNewName = newName.replace(/[\\/:*?"<>|]/g, '_');
    
    const originalFileName = path.basename(filePath);
    
    console.log(`Demande de renommage du fichier: ${originalFileName} en ${sanitizedNewName}.mp3`);
    console.log(`Chemin complet du fichier: ${filePath}`);
    
    // Vérifier si le chemin est absolu ou relatif
    const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    console.log(`Chemin absolu utilisé: ${absoluteFilePath}`);
    
    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`Fichier non trouvé pour le renommage: ${absoluteFilePath}`);
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    const dir = path.dirname(absoluteFilePath);
    const newPath = path.join(dir, sanitizedNewName + '.mp3');
    
    // Vérifier si le nouveau chemin existe déjà
    if (fs.existsSync(newPath) && absoluteFilePath !== newPath) {
      console.error(`Un fichier avec le nom ${sanitizedNewName}.mp3 existe déjà`);
      return res.status(409).json({ success: false, error: 'A file with this name already exists' });
    }
    
    console.log(`Renommage de ${originalFileName} vers ${sanitizedNewName}.mp3`);
    try {
      fs.renameSync(absoluteFilePath, newPath);
    } catch (renameError) {
      console.error(`Erreur lors du renommage: ${renameError.message}`);
      return res.status(500).json({ success: false, error: `Erreur lors du renommage: ${renameError.message}` });
    }
    console.log(`Fichier renommé avec succès: ${originalFileName} → ${sanitizedNewName}.mp3`);
    
    res.json({ 
      success: true, 
      newPath,
      logs: {
        message: `Fichier renommé avec succès`,
        details: `${originalFileName} → ${sanitizedNewName}.mp3`
      }
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to generate cover art
app.post('/api/generate-cover', async (req, res) => {
  try {
    const { keywords } = req.body;
    
    console.log('Requête de génération de pochette reçue');
    console.log('Mots-clés reçus:', keywords);
    
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
      console.error('Aucun mot-clé fourni pour la génération de pochette');
      return res.status(400).json({ success: false, error: 'Keywords are required for cover art generation' });
    }
    
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    console.log(`Début de la génération de pochette avec les mots-clés: ${keywordsStr}`);
    const result = await generateCoverArt(keywords);
    console.log(`Pochette générée avec succès`);
    
    res.json({ 
      success: true, 
      imageUrl: result.imageUrl,
      logs: {
        message: `Pochette générée avec succès`,
        details: `Mots-clés utilisés: ${keywordsStr}`
      }
    });
  } catch (error) {
    console.error('Error generating cover art:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to export JSON
app.post('/api/export-json', (req, res) => {
  try {
    const { data, filename } = req.body;
    const exportFilename = `${filename || 'export'}.json`;
    
    console.log(`Début de l'exportation JSON pour: ${exportFilename}`);
    
    // Vérifier que les données sont valides
    if (!data) {
      console.error('Aucune donnée fournie pour l\'exportation JSON');
      return res.status(400).json({ success: false, error: 'No data provided for export' });
    }
    
    // Convertir les données en JSON formaté
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Configurer les en-têtes pour forcer le téléchargement
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${exportFilename}`);
    
    // Envoyer le contenu JSON directement au client pour téléchargement
    console.log(`Envoi du fichier JSON pour téléchargement: ${exportFilename}`);
    res.send(jsonContent);
    
    console.log(`Exportation JSON terminée avec succès: ${exportFilename}`);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Intégrer les endpoints de traitement par lots
require('./batch-endpoints')(app);

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=== MP3 Auto Tagger ===`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API endpoints disponibles:`);
  console.log(`- POST /api/upload: Télécharger et analyser des fichiers MP3`);
  console.log(`- POST /api/write-tags: Écrire les tags ID3`);
  console.log(`- POST /api/rename: Renommer un fichier`);
  console.log(`- POST /api/generate-cover: Générer une pochette d'album`);
  console.log(`- POST /api/export-json: Exporter les métadonnées en JSON`);
  console.log(`- POST /api/write-batch-tags: Écrire les tags ID3 par lots`);
  console.log(`- POST /api/rename-batch: Renommer des fichiers par lots`);
  console.log(`- POST /api/export-batch-json: Exporter les métadonnées par lots`);
  console.log(`======================`);
});