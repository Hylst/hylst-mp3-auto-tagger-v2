import React, { useState } from 'react';
import { Box, Button, Typography, Stack, CircularProgress, Alert, Chip, Paper, Divider, LinearProgress } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CodeIcon from '@mui/icons-material/Code';
import CancelIcon from '@mui/icons-material/Cancel';

const BatchProcessing = ({
  selectedFiles,
  onCancelBatchMode,
  onWriteBatchTags,
  onRenameBatchFiles,
  onExportBatchJson,
  isLoading,
  batchProgress
}) => {
  const [error, setError] = useState('');

  if (!selectedFiles || selectedFiles.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Alert severity="info">
          Aucun fichier sélectionné pour le traitement par lots. Veuillez sélectionner des fichiers dans la liste.
        </Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<CancelIcon />} 
          onClick={onCancelBatchMode}
          sx={{ mt: 2 }}
        >
          Quitter le mode traitement par lots
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Traitement par lots
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Appliquez des actions à plusieurs fichiers simultanément
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Fichiers sélectionnés: {selectedFiles.length}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedFiles.map(file => (
            <Chip 
              key={file.id} 
              label={file.originalName} 
              variant="outlined" 
              size="small" 
            />
          ))}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {batchProgress && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Progression: {batchProgress.current}/{batchProgress.total} fichiers
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(batchProgress.current / batchProgress.total) * 100} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="center"
        alignItems="center"
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={<EditIcon />}
          onClick={onWriteBatchTags}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Écrire les tags ID3'}
        </Button>
        
        <Button
          variant="contained"
          color="success"
          startIcon={<DriveFileRenameOutlineIcon />}
          onClick={onRenameBatchFiles}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Renommer les fichiers'}
        </Button>
        
        <Button
          variant="contained"
          color="info"
          startIcon={<CodeIcon />}
          onClick={onExportBatchJson}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Exporter en JSON'}
        </Button>
      </Stack>

      <Button 
        variant="outlined" 
        color="primary" 
        startIcon={<CancelIcon />} 
        onClick={onCancelBatchMode}
        sx={{ mt: 2 }}
        fullWidth
      >
        Quitter le mode traitement par lots
      </Button>
    </Paper>
  );
};

export default BatchProcessing;