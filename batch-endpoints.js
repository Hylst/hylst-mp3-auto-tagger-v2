// Endpoints pour le traitement par lots des fichiers MP3
const path = require('path');
const fs = require('fs');
const NodeID3 = require('node-id3');

module.exports = function(app) {
  // Endpoint pour écrire les tags ID3 dans plusieurs fichiers MP3 (traitement par lots)
  app.post('/api/write-batch-tags', async (req, res) => {
    try {
      const { files } = req.body;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ success: false, error: 'Aucun fichier spécifié pour le traitement par lots' });
      }
      
      console.log(`Début du traitement par lots pour ${files.length} fichiers`);
      
      const results = [];
      const errors = [];
      
      // Traiter chaque fichier séquentiellement
      for (let i = 0; i < files.length; i++) {
        const { filePath, metadata } = files[i];
        console.log(`Traitement du fichier ${i+1}/${files.length}: ${path.basename(filePath)}`);
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
          console.error(`Fichier non trouvé: ${filePath}`);
          errors.push({ filePath, error: 'Fichier non trouvé' });
          continue;
        }
        
        // Préparer les tags ID3 à partir des métadonnées
        const tags = {
          title: metadata.title || '',
          artist: metadata.artist || '',
          album: metadata.album || '',
          genre: metadata.genre || '',
          comment: {
            language: metadata.language || 'eng',
            text: metadata.creative || ''
          },
          userDefinedText: [
            {
              description: 'SUBGENRE',
              value: metadata.subgenre || ''
            },
            {
              description: 'TECHNICAL',
              value: metadata.technical || ''
            },
            {
              description: 'KEYWORDS',
              value: Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : ''
            },
            {
              description: 'MOOD',
              value: Array.isArray(metadata.mood) ? metadata.mood.join(', ') : ''
            },
            {
              description: 'USAGE',
              value: Array.isArray(metadata.usage) ? metadata.usage.join(', ') : ''
            }
          ]
        };
        
        // Ajouter les paroles si elles existent
        if (metadata.lyrics) {
          tags.unsynchronisedLyrics = {
            language: metadata.language || 'eng',
            text: metadata.lyrics
          };
        }
        
        // Ajouter la couverture d'album si elle existe
        if (metadata.coverArt) {
          // Si l'URL de la couverture commence par 'data:', c'est une image en base64
          if (metadata.coverArt.startsWith('data:')) {
            const base64Data = metadata.coverArt.split(',')[1];
            tags.image = {
              mime: metadata.coverArt.split(';')[0].split(':')[1],
              type: { id: 3, name: 'front cover' },
              description: 'Cover',
              imageBuffer: Buffer.from(base64Data, 'base64')
            };
          } else {
            // Sinon, c'est un chemin de fichier local
            try {
              const imageData = fs.readFileSync(metadata.coverArt);
              tags.image = {
                mime: 'image/jpeg', // Supposer JPEG par défaut
                type: { id: 3, name: 'front cover' },
                description: 'Cover',
                imageBuffer: imageData
              };
            } catch (err) {
              console.error(`Erreur lors de la lecture de l'image de couverture pour ${filePath}:`, err);
            }
          }
        }
        
        // Écrire les tags dans le fichier
        try {
          const success = NodeID3.write(tags, filePath);
          if (success) {
            console.log(`Tags ID3 écrits avec succès pour: ${path.basename(filePath)}`);
            results.push({ filePath, success: true });
          } else {
            console.error(`Échec de l'écriture des tags ID3 pour: ${path.basename(filePath)}`);
            errors.push({ filePath, error: 'Échec de l\'écriture des tags ID3' });
          }
        } catch (err) {
          console.error(`Erreur lors de l'écriture des tags ID3 pour ${path.basename(filePath)}:`, err);
          errors.push({ filePath, error: err.message });
        }
      }
      
      console.log(`Traitement par lots terminé: ${results.length} succès, ${errors.length} échecs`);
      
      return res.json({ 
        success: true,
        results,
        errors,
        logs: {
          message: `Tags ID3 écrits par lots: ${results.length} succès, ${errors.length} échecs`,
          details: `Traitement par lots terminé pour ${files.length} fichiers`
        }
      });
    } catch (error) {
      console.error('Erreur lors du traitement par lots des tags ID3:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint pour renommer plusieurs fichiers MP3 (traitement par lots)
  app.post('/api/rename-batch', async (req, res) => {
    try {
      const { files } = req.body;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ success: false, error: 'Aucun fichier spécifié pour le renommage par lots' });
      }
      
      console.log(`Début du renommage par lots pour ${files.length} fichiers`);
      
      const results = [];
      const errors = [];
      
      // Traiter chaque fichier séquentiellement
      for (let i = 0; i < files.length; i++) {
        const { filePath, newName, options = {} } = files[i];
        console.log(`Renommage du fichier ${i+1}/${files.length}: ${path.basename(filePath)} en ${newName}`);
        
        if (!filePath || !newName) {
          console.error('Chemin de fichier ou nouveau nom non spécifié');
          errors.push({ filePath, error: 'Chemin de fichier ou nouveau nom non spécifié' });
          continue;
        }
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
          console.error(`Fichier non trouvé: ${filePath}`);
          errors.push({ filePath, error: 'Fichier non trouvé' });
          continue;
        }
        
        const directory = path.dirname(filePath);
        const extension = path.extname(filePath);
        
        // Nettoyer le nouveau nom pour éviter les caractères problématiques dans les noms de fichiers
        let sanitizedName = newName.replace(/[\\/:*?"<>|]/g, '_');
        
        // Appliquer un modèle de nommage si spécifié dans les options
        if (options && options.useTemplate && options.template) {
          // Implémentation de modèles de nommage personnalisables
          // À développer selon les besoins
        }
        
        const newFilePath = path.join(directory, sanitizedName + extension);
        
        // Vérifier si le nouveau chemin existe déjà
        if (fs.existsSync(newFilePath) && filePath !== newFilePath) {
          console.error(`Un fichier avec ce nom existe déjà: ${sanitizedName + extension}`);
          errors.push({ filePath, error: 'Un fichier avec ce nom existe déjà' });
          continue;
        }
        
        try {
          // Renommer le fichier
          fs.renameSync(filePath, newFilePath);
          console.log(`Fichier renommé avec succès: ${path.basename(filePath)} → ${sanitizedName + extension}`);
          results.push({ 
            oldPath: filePath, 
            newPath: newFilePath,
            originalName: path.basename(filePath),
            newName: sanitizedName + extension
          });
        } catch (err) {
          console.error(`Erreur lors du renommage de ${path.basename(filePath)}:`, err);
          errors.push({ filePath, error: err.message });
        }
      }
      
      console.log(`Renommage par lots terminé: ${results.length} succès, ${errors.length} échecs`);
      
      return res.json({ 
        success: true, 
        results,
        errors,
        logs: {
          message: `Fichiers renommés par lots: ${results.length} succès, ${errors.length} échecs`,
          details: `Traitement par lots terminé pour ${files.length} fichiers`
        }
      });
    } catch (error) {
      console.error('Erreur lors du renommage par lots des fichiers:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint pour exporter les métadonnées de plusieurs fichiers au format JSON (traitement par lots)
  app.post('/api/export-batch-json', async (req, res) => {
    try {
      const { files } = req.body;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ success: false, error: 'Aucun fichier spécifié pour l\'exportation par lots' });
      }
      
      console.log(`Début de l'exportation JSON par lots pour ${files.length} fichiers`);
      
      const metadata = [];
      
      // Collecter les métadonnées de chaque fichier
      for (let i = 0; i < files.length; i++) {
        const { filePath, metadata: fileMetadata } = files[i];
        console.log(`Exportation des métadonnées pour ${i+1}/${files.length}: ${path.basename(filePath)}`);
        
        metadata.push({
          filePath,
          originalName: path.basename(filePath),
          metadata: {
            title: fileMetadata.title || '',
            artist: fileMetadata.artist || '',
            album: fileMetadata.album || '',
            genre: fileMetadata.genre || '',
            subgenre: fileMetadata.subgenre || '',
            technical: fileMetadata.technical || '',
            creative: fileMetadata.creative || '',
            keywords: fileMetadata.keywords || [],
            mood: fileMetadata.mood || [],
            usage: fileMetadata.usage || [],
            lyrics: fileMetadata.lyrics || '',
            language: fileMetadata.language || ''
          }
        });
      }
      
      console.log(`Exportation JSON par lots terminée pour ${metadata.length} fichiers`);
      
      return res.json({ 
        success: true, 
        metadata,
        logs: {
          message: `Exportation JSON par lots réussie`,
          details: `${metadata.length} fichiers exportés`
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'exportation JSON par lots:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
};