import React from 'react';
import { Snackbar, Alert, Typography, Paper, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LogNotification = ({ open, message, severity, onClose }) => {
  // Pour les messages simples, utiliser Snackbar
  if (typeof message === 'string') {
    return (
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onClose} severity={severity || 'info'} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    );
  }
  
  // Pour les logs détaillés (objets avec titre et détails), utiliser un Paper flottant
  return (
    <Snackbar 
      open={open} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={null} // Ne pas fermer automatiquement les logs détaillés
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 2, 
          maxWidth: 400, 
          maxHeight: 300, 
          overflow: 'auto',
          backgroundColor: severity === 'error' ? '#fdeded' : 
                          severity === 'warning' ? '#fff4e5' : 
                          severity === 'success' ? '#edf7ed' : '#e5f6fd'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {message.title || 'Notification'}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {message.details && (
          <Typography variant="body2">
            {typeof message.details === 'string' 
              ? message.details 
              : JSON.stringify(message.details, null, 2)}
          </Typography>
        )}
      </Paper>
    </Snackbar>
  );
};

export default LogNotification;