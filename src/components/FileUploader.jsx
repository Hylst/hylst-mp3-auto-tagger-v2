import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUploader = ({ onFilesUploaded, isLoading }) => {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    try {
      setUploading(true);
      setError('');

      // Filter only MP3 files
      const mp3Files = acceptedFiles.filter(file => file.type === 'audio/mpeg');
      
      if (mp3Files.length === 0) {
        setError('No MP3 files were selected');
        return;
      }

      const formData = new FormData();
      mp3Files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onFilesUploaded(data.files);
      } else {
        setError(data.error || 'Failed to upload files');
      }
    } catch (err) {
      setError('Error uploading files: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3']
    },
    multiple: true,
  });

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload MP3 Files
      </Typography>
      
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 4,
          mb: 3,
          backgroundColor: isDragActive ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        {isDragActive ? (
          <Typography>Drop the MP3 files here...</Typography>
        ) : (
          <Typography>Drag & drop MP3 files here, or click to select files</Typography>
        )}
      </Box>

      <Button
        variant="contained"
        component="label"
        disabled={uploading || isLoading}
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {uploading ? 'Uploading...' : 'Select MP3 Files'}
        <input
          type="file"
          hidden
          accept=".mp3,audio/mpeg"
          multiple
          onChange={(e) => {
            if (e.target.files.length > 0) {
              onDrop(Array.from(e.target.files));
            }
          }}
        />
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUploader;