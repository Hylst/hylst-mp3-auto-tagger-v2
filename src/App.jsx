import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, Button } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import MetadataEditor from './components/MetadataEditor';
import MetadataAdvancedPanel from './components/MetadataAdvancedPanel';
import StreamingIntegration from './components/StreamingIntegration';
import ActionButtons from './components/ActionButtons';
import BatchProcessing from './components/BatchProcessing';
import LogNotification from './components/LogNotification';
import logService from './services/logService';
import streamingService from './services/streamingService';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [activeTab, setActiveTab] = useState(0);

  // Effet pour s'abonner aux logs du service
  useEffect(() => {
    const unsubscribe = logService.subscribe((log) => {
      if (log.type === 'clear') return;
      
      setNotification({
        open: true,
        message: log.message,
        severity: log.severity
      });
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleFilesUploaded = (uploadedFiles) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const toggleBatchMode = () => {
    setBatchMode(!batchMode);
    if (!batchMode) {
      // Entrer en mode traitement par lots
      setSelectedFiles([]);
    } else {
      // Quitter le mode traitement par lots
      setSelectedFiles([]);
    }
  };

  const handleBatchSelect = (file) => {
    setSelectedFiles(prevSelectedFiles => {
      const fileIndex = prevSelectedFiles.findIndex(f => f.id === file.id);
      if (fileIndex >= 0) {
        // Si le fichier est déjà sélectionné, le retirer
        return prevSelectedFiles.filter(f => f.id !== file.id);
      } else {
        // Sinon, l'ajouter à la sélection
        return [...prevSelectedFiles, file];
      }
    });
  };

  const handleMetadataUpdate = (fileId, updatedMetadata) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        return { ...file, analysis: { ...file.analysis, ...updatedMetadata } };
      }
      return file;
    }));

    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({
        ...selectedFile,
        analysis: { ...selectedFile.analysis, ...updatedMetadata }
      });
    }
  };

  const handleGenerateCoverArt = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError('');
      
      // S'assurer que les mots-clés sont correctement formatés
      const keywords = selectedFile.analysis.keywords || [];
      console.log('Envoi de la requête de génération de couverture avec les mots-clés:', keywords);

      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCoverArtUrl(data.imageUrl);
        handleMetadataUpdate(selectedFile.id, { coverArt: data.imageUrl });
        
        // Afficher les logs s'ils sont présents dans la réponse
        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Failed to generate cover art');
      }
    } catch (err) {
      setError('Error generating cover art: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteTags = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/write-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile.path,
          metadata: selectedFile.analysis,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Afficher les logs s'ils sont présents dans la réponse
        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Failed to write tags');
      }
    } catch (err) {
      setError('Error writing tags: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (customName) => {
    if (!selectedFile) return;
    
    // Utiliser le nom personnalisé s'il est fourni, sinon utiliser le titre
    const newName = customName || selectedFile.analysis.title;
    
    if (!newName) {
      setError('Aucun nom de fichier spécifié');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile.path,
          newName: newName,
          // Ajouter des options pour les modèles de nommage personnalisables
          options: {
            useTemplate: !!customName
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the file path in state
        const updatedFiles = files.map(file => {
          if (file.id === selectedFile.id) {
            return { ...file, path: data.newPath };
          }
          return file;
        });

        setFiles(updatedFiles);
        setSelectedFile({ ...selectedFile, path: data.newPath });
        
        // Afficher les logs s'ils sont présents dans la réponse
        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Échec du renommage du fichier');
      }
    } catch (err) {
      setError('Erreur lors du renommage du fichier: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJson = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError('');

      const exportData = {
        originalName: selectedFile.originalName,
        duration: selectedFile.duration || 0,
        createdAt: selectedFile.createdAt,
        metadata: {
          title: selectedFile.analysis.title,
          genre: selectedFile.analysis.genre,
          subgenre: selectedFile.analysis.subgenre,
          technical: selectedFile.analysis.technical,
          creative: selectedFile.analysis.creative,
          keywords: selectedFile.analysis.keywords,
          mood: selectedFile.analysis.mood,
          usage: selectedFile.analysis.usage,
          lyrics: selectedFile.analysis.lyrics,
          language: selectedFile.analysis.language,
          song: selectedFile.analysis.song || 1
        }
      };

      const filename = selectedFile.analysis.title || 'export';
      console.log('Préparation de l\'export JSON:', filename);
      
      // Utiliser la nouvelle API qui renvoie directement le contenu pour téléchargement
      const response = await fetch('/api/export-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: exportData,
          filename: filename
        }),
      });
      
      if (response.ok) {
        // Récupérer le blob de la réponse
        const blob = await response.blob();
        
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(blob);
        
        // Créer un élément <a> pour déclencher le téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        logService.success('Exportation JSON terminée', `Fichier: ${filename}.json téléchargé`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to export JSON');
      }
    } catch (err) {
      setError('Error exporting JSON: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Gérer l'importation des métadonnées depuis les services de streaming
  const handleImportStreamingMetadata = (metadata) => {
    if (!selectedFile) return;
    
    // Mettre à jour les métadonnées avec celles importées
    handleMetadataUpdate(selectedFile.id, metadata);
    
    // Afficher une notification de succès
    logService.success('Métadonnées importées avec succès', 
      `Les métadonnées ont été importées depuis ${metadata.source.platform}.`);
  };
  
  // Sauvegarder les métadonnées
  const handleSaveMetadata = (metadata) => {
    if (!selectedFile) return;

    // Mettre à jour les métadonnées dans l'état
    handleMetadataUpdate(selectedFile.id, metadata);
    
    // Afficher une notification de succès
    logService.success('Métadonnées mises à jour avec succès', 
      'Les modifications ont été enregistrées dans la mémoire de l\'application.');
  };

  const handleWriteBatchTags = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsLoading(true);
      setError('');
      setBatchProgress({ current: 0, total: selectedFiles.length });

      const response = await fetch('/api/write-batch-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: selectedFiles.map(file => ({
            filePath: file.path,
            metadata: file.analysis,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Échec de l\'écriture des tags par lots');
      }
    } catch (err) {
      setError('Erreur lors de l\'écriture des tags par lots: ' + err.message);
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  };

  const handleRenameBatchFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsLoading(true);
      setError('');
      setBatchProgress({ current: 0, total: selectedFiles.length });

      const response = await fetch('/api/rename-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: selectedFiles.map(file => ({
            filePath: file.path,
            newName: file.analysis.title,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour les chemins de fichiers dans l'état
        const updatedFiles = [...files];
        data.results.forEach(result => {
          const fileIndex = updatedFiles.findIndex(file => file.path === result.oldPath);
          if (fileIndex >= 0) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], path: result.newPath };
          }
        });

        setFiles(updatedFiles);
        
        // Mettre à jour selectedFiles avec les nouveaux chemins
        setSelectedFiles(prevSelectedFiles => {
          return prevSelectedFiles.map(file => {
            const result = data.results.find(r => r.oldPath === file.path);
            if (result) {
              return { ...file, path: result.newPath };
            }
            return file;
          });
        });

        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Échec du renommage des fichiers par lots');
      }
    } catch (err) {
      setError('Erreur lors du renommage des fichiers par lots: ' + err.message);
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  };

  const handleExportBatchJson = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/export-batch-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: selectedFiles.map(file => ({
            filePath: file.path,
            metadata: file.analysis,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Télécharger le fichier JSON
        const dataStr = JSON.stringify(data.metadata, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'batch_metadata_export.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        if (data.logs) {
          logService.success(data.logs.message, data.logs.details);
        }
      } else {
        setError(data.error || 'Échec de l\'exportation JSON par lots');
      }
    } catch (err) {
      setError('Erreur lors de l\'exportation JSON par lots: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="app-container">
      <LogNotification 
        open={notification.open} 
        message={notification.message} 
        severity={notification.severity} 
        onClose={handleNotificationClose} 
      />
      <Box sx={{ my: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom align="center">
          MP3 Auto Tagger
        </Typography>
        
        {files.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <FileUploader onFilesUploaded={handleFilesUploaded} isLoading={isLoading} />
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant={batchMode ? "contained" : "outlined"}
                color="primary"
                startIcon={<PlaylistAddCheckIcon />}
                onClick={toggleBatchMode}
              >
                {batchMode ? "Quitter le mode par lots" : "Mode traitement par lots"}
              </Button>
            </Box>

            {batchMode && (
              <BatchProcessing
                selectedFiles={selectedFiles}
                onCancelBatchMode={toggleBatchMode}
                onWriteBatchTags={handleWriteBatchTags}
                onRenameBatchFiles={handleRenameBatchFiles}
                onExportBatchJson={handleExportBatchJson}
                isLoading={isLoading}
                batchProgress={batchProgress}
              />
            )}
            
            <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
              <FileList 
                files={files} 
                selectedFile={selectedFile} 
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect} 
                onBatchSelect={handleBatchSelect}
                batchMode={batchMode}
              />
            </Paper>
            
            {selectedFile && (
              <>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Éditeur Standard" />
                    <Tab label="Métadonnées Avancées" />
                    <Tab label="Intégration Streaming" />
                  </Tabs>
                  
                  {activeTab === 0 && (
                    <MetadataEditor 
                      file={selectedFile} 
                      onMetadataUpdate={(metadata) => handleMetadataUpdate(selectedFile.id, metadata)} 
                      coverArtUrl={coverArtUrl}
                    />
                  )}
                  
                  {activeTab === 1 && (
                    <MetadataAdvancedPanel 
                      file={selectedFile}
                      onSave={handleSaveMetadata}
                      onRename={handleRenameFile}
                      coverArtUrl={coverArtUrl}
                    />
                  )}
                  
                  {activeTab === 2 && (
                    <StreamingIntegration 
                      onImportMetadata={handleImportStreamingMetadata}
                    />
                  )}
                </Paper>
                
                <Paper elevation={3} sx={{ p: 3 }}>
                  <ActionButtons 
                    onGenerateCoverArt={handleGenerateCoverArt}
                    onWriteTags={handleWriteTags}
                    onRenameFile={() => handleRenameFile()}
                    onExportJson={handleExportJson}
                    onSaveMetadata={handleSaveMetadata}
                    isLoading={isLoading}
                  />
                  
                  {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {error}
                    </Typography>
                  )}
                </Paper>
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;