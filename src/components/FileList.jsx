import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider, Checkbox } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const FileList = ({ files, selectedFile, selectedFiles = [], onFileSelect, onBatchSelect, batchMode = false }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom>
        Uploaded Files ({files.length}) {batchMode && <span style={{ fontSize: '0.8em', color: 'text.secondary' }}> - Mode traitement par lots</span>}
      </Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {files.map((file, index) => (
          <React.Fragment key={file.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem disablePadding>
              <ListItemButton 
                selected={batchMode ? selectedFiles.some(f => f.id === file.id) : (selectedFile && selectedFile.id === file.id)}
                onClick={() => batchMode ? onBatchSelect(file) : onFileSelect(file)}
              >
                {batchMode && (
                  <Checkbox
                    edge="start"
                    checked={selectedFiles.some(f => f.id === file.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                )}
                <ListItemAvatar>
                  <Avatar>
                    <MusicNoteIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={file.originalName}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {file.analysis.genre} / {file.analysis.subgenre}
                      </Typography>
                      {` — ${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default FileList;