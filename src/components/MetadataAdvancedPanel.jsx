import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import SettingsIcon from '@mui/icons-material/Settings';

import MetadataEditor from './MetadataEditor';
import AdvancedMetadataSettings from './AdvancedMetadataSettings';

const MetadataAdvancedPanel = ({ file, onSave, onRename, coverArtUrl }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [metadata, setMetadata] = useState({});
  const [namingTemplate, setNamingTemplate] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Initialiser les métadonnées à partir du fichier
  useEffect(() => {
    if (file && file.analysis) {
      setMetadata({
        title: file.analysis.titles?.[0] || '',
        artist: '',
        album: file.analysis.subgenre || '',
        genre: file.analysis.genre || '',
        technical: file.analysis.technical || '',
        creative: file.analysis.creative || '',
        keywords: file.analysis.keywords || [],
        mood: file.analysis.mood || [],
        usage: file.analysis.usage || [],
        lyrics: file.analysis.lyrics || '',
        language: file.analysis.language || ''
      });
    }
  }, [file]);

  // Gérer les changements de métadonnées
  const handleMetadataUpdate = (updates) => {
    setMetadata(prev => ({ ...prev, ...updates }));
  };

  // Gérer l'application d'un modèle de nommage
  const handleApplyNamingTemplate = async (template) => {
    setNamingTemplate(template);
    
    try {
      const response = await fetch('/api/apply-naming-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: file.path,
          metadata: metadata,
          templatePattern: template
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreviewFileName(data.newName);
        setNotification({
          open: true,
          message: `Modèle appliqué: ${data.newName}`,
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: `Erreur: ${data.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du modèle de nommage:', error);
      setNotification({
        open: true,
        message: `Erreur: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Sauvegarder les métadonnées
  const handleSave = () => {
    onSave({
      ...metadata,
      coverArt: coverArtUrl
    });
  };

  // Renommer le fichier avec le nom prévisualisé
  const handleRename = () => {
    if (previewFileName) {
      onRename(previewFileName);
    } else {
      setNotification({
        open: true,
        message: 'Veuillez d\'abord appliquer un modèle de nommage',
        severity: 'warning'
      });
    }
  };

  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Changer d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!file) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<SaveIcon />} label="Métadonnées" />
          <Tab icon={<SettingsIcon />} label="Paramètres Avancés" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <MetadataEditor 
              file={{ ...file, analysis: { ...file.analysis, ...metadata } }} 
              onMetadataUpdate={handleMetadataUpdate} 
              coverArtUrl={coverArtUrl} 
            />
          )}
          
          {activeTab === 1 && (
            <AdvancedMetadataSettings 
              metadata={metadata} 
              onMetadataUpdate={handleMetadataUpdate}
              onApplyNamingTemplate={handleApplyNamingTemplate}
            />
          )}
        </Box>
      </Paper>

      {previewFileName && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" gutterBottom>Aperçu du nom de fichier:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {previewFileName}.mp3
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />} 
          onClick={handleSave}
        >
          Enregistrer les métadonnées
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<DriveFileRenameOutlineIcon />} 
          onClick={handleRename}
          disabled={!previewFileName}
        >
          Renommer le fichier
        </Button>
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MetadataAdvancedPanel;