import React from 'react';
import { Box, Button, Stack, CircularProgress } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CodeIcon from '@mui/icons-material/Code';

const ActionButtons = ({
  onGenerateCoverArt,
  onWriteTags,
  onRenameFile,
  onExportJson,
  isLoading
}) => {
  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="center"
        alignItems="center"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ImageIcon />}
          onClick={onGenerateCoverArt}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Cover Art'}
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          startIcon={<EditIcon />}
          onClick={onWriteTags}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Write ID3 Tags'}
        </Button>
        
        <Button
          variant="contained"
          color="success"
          startIcon={<DriveFileRenameOutlineIcon />}
          onClick={onRenameFile}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Rename File'}
        </Button>
        
        <Button
          variant="contained"
          color="info"
          startIcon={<CodeIcon />}
          onClick={onExportJson}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Export JSON'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ActionButtons;