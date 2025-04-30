import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { namingTemplates, musicPresets, advancedTags, applyNamingTemplate } from '../config/metadataConfig';

const AdvancedMetadataSettings = ({ metadata, onMetadataUpdate, onApplyNamingTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [customTemplate, setCustomTemplate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [enabledTags, setEnabledTags] = useState([]);
  const [previewFileName, setPreviewFileName] = useState('');
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);
  
  // Initialiser les tags activés avec les tags standard
  useEffect(() => {
    setEnabledTags(Object.keys(advancedTags.standard));
  }, []);
  
  // Mettre à jour l'aperçu du nom de fichier lorsque le modèle ou les métadonnées changent
  useEffect(() => {
    if (selectedTemplate === 'custom' && isCustomTemplate) {
      setPreviewFileName(applyNamingTemplate(customTemplate, metadata));
    } else if (namingTemplates[selectedTemplate]) {
      setPreviewFileName(applyNamingTemplate(namingTemplates[selectedTemplate].pattern, metadata));
    }
  }, [selectedTemplate, customTemplate, metadata, isCustomTemplate]);
  
  // Appliquer un préréglage de type de musique
  const handlePresetChange = (event) => {
    const presetKey = event.target.value;
    setSelectedPreset(presetKey);
    
    if (presetKey && musicPresets[presetKey]) {
      const preset = musicPresets[presetKey];
      
      // Appliquer le modèle de nommage du préréglage
      setSelectedTemplate(preset.namingTemplate);
      
      // Activer les tags prioritaires pour ce préréglage
      setEnabledTags([...Object.keys(advancedTags.standard), ...preset.priorityTags]);
      
      // Appliquer les valeurs par défaut
      if (preset.defaultValues) {
        onMetadataUpdate({ ...preset.defaultValues });
      }
    }
  };
  
  // Gérer le changement de modèle de nommage
  const handleTemplateChange = (event) => {
    const template = event.target.value;
    setSelectedTemplate(template);
    
    if (template === 'custom') {
      setIsCustomTemplate(true);
    } else {
      setIsCustomTemplate(false);
      // Appliquer le modèle sélectionné
      if (namingTemplates[template]) {
        onApplyNamingTemplate(namingTemplates[template].pattern);
      }
    }
  };
  
  // Gérer le changement du modèle personnalisé
  const handleCustomTemplateChange = (event) => {
    const value = event.target.value;
    setCustomTemplate(value);
    onApplyNamingTemplate(value);
  };
  
  // Appliquer le modèle de nommage actuel
  const applyTemplate = () => {
    const pattern = isCustomTemplate ? customTemplate : namingTemplates[selectedTemplate].pattern;
    onApplyNamingTemplate(pattern);
  };
  
  // Exporter la configuration
  const exportConfig = () => {
    const config = {
      template: selectedTemplate,
      customTemplate: customTemplate,
      enabledTags: enabledTags,
      preset: selectedPreset
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mp3-tagger-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Importer une configuration
  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          if (config.template) setSelectedTemplate(config.template);
          if (config.customTemplate) setCustomTemplate(config.customTemplate);
          if (config.enabledTags) setEnabledTags(config.enabledTags);
          if (config.preset) setSelectedPreset(config.preset);
          
          // Appliquer le modèle importé
          const pattern = config.template === 'custom' ? config.customTemplate : namingTemplates[config.template]?.pattern;
          if (pattern) onApplyNamingTemplate(pattern);
        } catch (error) {
          console.error('Erreur lors de l\'importation de la configuration:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Paramètres Avancés de Métadonnées
        <Tooltip title="Aide sur les paramètres avancés">
          <IconButton size="small" onClick={() => setOpenHelpDialog(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Préréglages par Type de Musique</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sélectionner un préréglage</InputLabel>
          <Select
            value={selectedPreset}
            onChange={handlePresetChange}
            label="Sélectionner un préréglage"
          >
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {Object.entries(musicPresets).map(([key, preset]) => (
              <MenuItem key={key} value={key}>{preset.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Modèles de Nommage</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Modèle de nommage</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              label="Modèle de nommage"
            >
              {Object.entries(namingTemplates).map(([key, template]) => (
                <MenuItem key={key} value={key}>
                  {template.name} - {template.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {isCustomTemplate && (
            <TextField
              fullWidth
              label="Modèle personnalisé"
              value={customTemplate}
              onChange={handleCustomTemplateChange}
              helperText="Utilisez {title}, {artist}, etc. comme variables"
              sx={{ mb: 2 }}
            />
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Aperçu:</Typography>
            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
              <Typography variant="body2">{previewFileName || 'Aperçu du nom de fichier'}</Typography>
            </Paper>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={applyTemplate}
            sx={{ mr: 1 }}
          >
            Appliquer le modèle
          </Button>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Tags ID3 Avancés</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>Tags Standard</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {Object.entries(advancedTags.standard).map(([tagId, tagInfo]) => (
              <Chip 
                key={tagId}
                label={tagInfo.description}
                color={enabledTags.includes(tagId) ? "primary" : "default"}
                onClick={() => {
                  if (enabledTags.includes(tagId)) {
                    setEnabledTags(enabledTags.filter(t => t !== tagId));
                  } else {
                    setEnabledTags([...enabledTags, tagId]);
                  }
                }}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>Tags Étendus</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {Object.entries(advancedTags.extended).map(([tagId, tagInfo]) => (
              <Chip 
                key={tagId}
                label={tagInfo.description}
                color={enabledTags.includes(tagId) ? "secondary" : "default"}
                onClick={() => {
                  if (enabledTags.includes(tagId)) {
                    setEnabledTags(enabledTags.filter(t => t !== tagId));
                  } else {
                    setEnabledTags([...enabledTags, tagId]);
                  }
                }}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>Tags Personnalisés</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {Object.entries(advancedTags.custom).map(([tagId, tagInfo]) => (
              <Chip 
                key={tagId}
                label={tagInfo.description}
                color={enabledTags.includes(`TXXX:${tagId}`) ? "info" : "default"}
                onClick={() => {
                  const fullTagId = `TXXX:${tagId}`;
                  if (enabledTags.includes(fullTagId)) {
                    setEnabledTags(enabledTags.filter(t => t !== fullTagId));
                  } else {
                    setEnabledTags([...enabledTags, fullTagId]);
                  }
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={exportConfig}
        >
          Exporter la configuration
        </Button>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={<FileUploadIcon />}
        >
          Importer une configuration
          <input
            type="file"
            hidden
            accept=".json"
            onChange={importConfig}
          />
        </Button>
      </Box>
      
      {/* Dialogue d'aide */}
      <Dialog open={openHelpDialog} onClose={() => setOpenHelpDialog(false)} maxWidth="md">
        <DialogTitle>Aide sur les paramètres avancés</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Modèles de nommage</Typography>
          <Typography variant="body2" paragraph>
            Les modèles de nommage vous permettent de définir comment vos fichiers MP3 seront renommés. 
            Utilisez les variables entre accolades pour insérer des métadonnées.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>Variables disponibles:</Typography>
          <Grid container spacing={1}>
            {['title', 'artist', 'album', 'genre', 'trackNumber', 'year', 'bpm', 'initialKey'].map(variable => (
              <Grid item key={variable}>
                <Chip label={`{${variable}}`} variant="outlined" size="small" />
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Tags ID3 Avancés</Typography>
          <Typography variant="body2" paragraph>
            Les tags ID3 sont des métadonnées stockées dans les fichiers MP3. Vous pouvez activer ou désactiver 
            différents types de tags selon vos besoins.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>Types de tags:</Typography>
          <Typography variant="body2">
            <strong>Tags Standard:</strong> Les tags de base comme le titre, l'artiste, l'album, etc.
          </Typography>
          <Typography variant="body2">
            <strong>Tags Étendus:</strong> Tags supplémentaires comme le BPM, la tonalité, le compositeur, etc.
          </Typography>
          <Typography variant="body2">
            <strong>Tags Personnalisés:</strong> Tags définis par l'utilisateur pour des informations spécifiques.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Préréglages</Typography>
          <Typography variant="body2" paragraph>
            Les préréglages appliquent automatiquement des configurations optimisées pour différents types de musique.
            Ils définissent le modèle de nommage, les tags prioritaires et certaines valeurs par défaut.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelpDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedMetadataSettings;