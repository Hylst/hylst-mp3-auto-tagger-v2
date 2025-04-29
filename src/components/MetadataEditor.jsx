import React, { useState } from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Chip, Paper, Divider, Card, CardMedia } from '@mui/material';

const MetadataEditor = ({ file, onMetadataUpdate, coverArtUrl }) => {
  const [selectedTitle, setSelectedTitle] = useState(file.analysis.titles?.[0] || '');

  if (!file || !file.analysis) {
    return null;
  }

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    setSelectedTitle(newTitle);
    onMetadataUpdate({ title: newTitle });
  };

  const handleInputChange = (field) => (event) => {
    onMetadataUpdate({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Metadata Editor
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left column - Basic metadata */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Title Selection</Typography>
            <TextField
              select
              fullWidth
              label="Select Title"
              value={selectedTitle}
              onChange={handleTitleChange}
              helperText="Choose one of the suggested titles"
              variant="outlined"
            >
              {file.analysis.titles?.map((title, index) => (
                <MenuItem key={index} value={title}>
                  {title}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Genre Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Main Genre"
                  value={file.analysis.genre || ''}
                  onChange={handleInputChange('genre')}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Subgenre"
                  value={file.analysis.subgenre || ''}
                  onChange={handleInputChange('subgenre')}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Descriptions</Typography>
            <TextField
              fullWidth
              label="Technical Description"
              value={file.analysis.technical || ''}
              onChange={handleInputChange('technical')}
              variant="outlined"
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Creative Description"
              value={file.analysis.creative || ''}
              onChange={handleInputChange('creative')}
              variant="outlined"
              multiline
              rows={3}
            />
          </Box>
        </Grid>

        {/* Right column - Keywords, mood, usage, cover art */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Keywords</Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}
            >
              {file.analysis.keywords?.map((keyword, index) => (
                <Chip key={index} label={keyword} color="primary" variant="outlined" />
              ))}
            </Paper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>Mood</Typography>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {file.analysis.mood?.map((mood, index) => (
                    <Chip key={index} label={mood} color="secondary" variant="outlined" />
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>Usage</Typography>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {file.analysis.usage?.map((usage, index) => (
                    <Chip key={index} label={usage} color="info" variant="outlined" />
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {file.analysis.lyrics && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Lyrics ({file.analysis.language || 'unknown'})
              </Typography>
              <TextField
                fullWidth
                value={file.analysis.lyrics || ''}
                onChange={handleInputChange('lyrics')}
                variant="outlined"
                multiline
                rows={4}
              />
            </Box>
          )}

          {coverArtUrl && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Cover Art</Typography>
              <Card sx={{ maxWidth: 300, mx: 'auto' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={coverArtUrl}
                  alt="Generated Cover Art"
                />
              </Card>
            </Box>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          ID3 Tag Mapping:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          TIT2 (Title), TCON (Genre), TALB (Album = Subgenre), COMM (Comment = Technical Description),
          USLT (Lyrics), custom TXXX frames for keywords, mood, usage, and song flag
        </Typography>
      </Box>
    </Box>
  );
};

export default MetadataEditor;