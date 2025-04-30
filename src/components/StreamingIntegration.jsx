import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import streamingService from '../services/streamingService';

const StreamingIntegration = ({ onImportMetadata }) => {
  const [searchQuery, setSearchQuery] = useState({ title: '', artist: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [configOpen, setConfigOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    spotify: '',
    appleMusic: '',
    deezer: ''
  });

  // Effectuer la recherche
  const handleSearch = async () => {
    if (!searchQuery.title && !searchQuery.artist) {
      setError('Veuillez saisir au moins un titre ou un artiste');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSearchResults([]);

      const results = await streamingService.searchMetadata(searchQuery);
      setSearchResults(results);

      if (results.length === 0) {
        setError('Aucun résultat trouvé');
      }
    } catch (err) {
      setError(`Erreur lors de la recherche: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sélectionner une piste
  const handleSelectTrack = async (track) => {
    try {
      setIsLoading(true);
      setError('');

      const details = await streamingService.getTrackDetails(track.platform, track.id);
      setSelectedTrack(details);
    } catch (err) {
      setError(`Erreur lors de la récupération des détails: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Importer les métadonnées
  const handleImport = () => {
    if (!selectedTrack) return;

    const formattedMetadata = streamingService.importMetadata(selectedTrack);
    onImportMetadata(formattedMetadata);
  };

  // Gérer les changements dans le formulaire de recherche
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements dans le formulaire de configuration
  const handleApiKeyChange = (e) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  // Sauvegarder la configuration
  const handleSaveConfig = () => {
    streamingService.setApiKeys(apiKeys);
    setConfigOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Intégration Streaming</Typography>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />}
            onClick={() => setConfigOpen(true)}
          >
            Configuration
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Titre"
            name="title"
            value={searchQuery.title}
            onChange={handleSearchInputChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Artiste"
            name="artist"
            value={searchQuery.artist}
            onChange={handleSearchInputChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={isLoading}
          >
            Rechercher
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {searchResults.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Résultats ({searchResults.length})
            </Typography>
            <List>
              {searchResults.map((track, index) => (
                <React.Fragment key={`${track.platform}-${track.id}`}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem 
                    alignItems="flex-start"
                    button 
                    onClick={() => handleSelectTrack(track)}
                    selected={selectedTrack && selectedTrack.id === track.id}
                  >
                    <ListItemAvatar>
                      {track.coverArt ? (
                        <Avatar alt={track.title} src={track.coverArt} />
                      ) : (
                        <Avatar>
                          <MusicNoteIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={track.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {track.artist}
                          </Typography>
                          {track.album && ` — ${track.album}`}
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={track.platform} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {selectedTrack && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Détails de la piste
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {selectedTrack.coverArt && (
                  <Avatar 
                    alt={selectedTrack.title} 
                    src={selectedTrack.coverArt} 
                    sx={{ width: 80, height: 80 }}
                    variant="rounded"
                  />
                )}
                <Box>
                  <Typography variant="h6">{selectedTrack.title}</Typography>
                  <Typography variant="subtitle1">{selectedTrack.artist}</Typography>
                  <Typography variant="body2">
                    Album: {selectedTrack.album || 'Non spécifié'}
                  </Typography>
                  <Typography variant="body2">
                    Genre: {selectedTrack.genre || 'Non spécifié'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CloudDownloadIcon />}
                      onClick={handleImport}
                    >
                      Importer les métadonnées
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Dialogue de configuration */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)}>
        <DialogTitle>Configuration des API Streaming</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Clé API Spotify"
              name="spotify"
              value={apiKeys.spotify}
              onChange={handleApiKeyChange}
              fullWidth
              margin="normal"
              helperText="Obtenir une clé sur https://developer.spotify.com"
            />
            <TextField
              label="Clé API Apple Music"
              name="appleMusic"
              value={apiKeys.appleMusic}
              onChange={handleApiKeyChange}
              fullWidth
              margin="normal"
              helperText="Obtenir une clé sur https://developer.apple.com"
            />
            <TextField
              label="Clé API Deezer"
              name="deezer"
              value={apiKeys.deezer}
              onChange={handleApiKeyChange}
              fullWidth
              margin="normal"
              helperText="Obtenir une clé sur https://developers.deezer.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveConfig} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StreamingIntegration;