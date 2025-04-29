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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

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
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create a prompt for image generation
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
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
      return { imageUrl };
    } else {
      // If no image data is found, try to extract text that might contain image data
      const text = response.text();
      
      // Check if the text contains a base64 image
      const base64Match = text.match(/data:image\/(jpeg|png|gif);base64,([^"\s]+)/i);
      if (base64Match && base64Match[2]) {
        return { imageUrl: `data:image/${base64Match[1]};base64,${base64Match[2]}` };
      }
      
      // If we still don't have an image, use a placeholder
      console.warn('No image data found in Gemini response, using placeholder');
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
    const results = [];
    
    for (const file of req.files) {
      const filePath = file.path;
      const stats = fs.statSync(filePath);
      
      // Analyze the MP3 file
      const analysis = await analyzeWithGemini(filePath);
      
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
    
    res.json({ success: true, files: results });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to write ID3 tags
app.post('/api/write-tags', async (req, res) => {
  try {
    const { filePath, metadata } = req.body;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    const tags = {
      title: metadata.title,
      artist: metadata.artist || '',
      album: metadata.subgenre,
      genre: metadata.genre,
      comment: { language: 'eng', text: metadata.technical },
      userDefinedText: [
        { description: 'CREATIVE', value: metadata.creative },
        { description: 'KEYWORDS', value: metadata.keywords.join(', ') },
        { description: 'MOOD', value: metadata.mood.join(', ') },
        { description: 'USAGE', value: metadata.usage.join(', ') },
        { description: 'SONG', value: metadata.song || '1' }
      ]
    };
    
    // Add lyrics if present
    if (metadata.lyrics) {
      tags.unsynchronisedLyrics = {
        language: metadata.language || 'eng',
        text: metadata.lyrics
      };
    }
    
    // Add cover art if present
    if (metadata.coverArt) {
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
            console.log(`Added cover art (${imageType}) to ID3 tags`);
          }
        } else if (metadata.coverArt.startsWith('http')) {
          // For remote URLs, we would need to download the image first
          // This would be implemented in a production app
          console.log('Remote cover art URLs not supported yet');
        }
      } catch (imageError) {
        console.error('Error adding cover art to ID3 tags:', imageError);
      }
    }
    
    const success = NodeID3.write(tags, filePath);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write tags' });
    }
  } catch (error) {
    console.error('Error writing ID3 tags:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to rename file
app.post('/api/rename', (req, res) => {
  try {
    const { filePath, newName } = req.body;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    const dir = path.dirname(filePath);
    const newPath = path.join(dir, newName + '.mp3');
    
    fs.renameSync(filePath, newPath);
    
    res.json({ success: true, newPath });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to generate cover art
app.post('/api/generate-cover', async (req, res) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
      return res.status(400).json({ success: false, error: 'Keywords are required for cover art generation' });
    }
    
    console.log('Generating cover art with keywords:', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    const result = await generateCoverArt(keywords);
    
    res.json({ success: true, imageUrl: result.imageUrl });
  } catch (error) {
    console.error('Error generating cover art:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to export JSON
app.post('/api/export-json', (req, res) => {
  try {
    const { data, filename } = req.body;
    
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const jsonPath = path.join(exportsDir, `${filename || 'export'}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    
    res.json({ success: true, path: jsonPath });
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});