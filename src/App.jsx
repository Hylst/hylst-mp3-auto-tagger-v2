import React, { useState } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import MetadataEditor from './components/MetadataEditor';
import ActionButtons from './components/ActionButtons';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverArtUrl, setCoverArtUrl] = useState('');

  const handleFilesUploaded = (uploadedFiles) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
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

      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: selectedFile.analysis.keywords,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCoverArtUrl(data.imageUrl);
        handleMetadataUpdate(selectedFile.id, { coverArt: data.imageUrl });
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

      if (!data.success) {
        setError(data.error || 'Failed to write tags');
      }
    } catch (err) {
      setError('Error writing tags: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async () => {
    if (!selectedFile || !selectedFile.analysis.title) return;

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
          newName: selectedFile.analysis.title,
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
      } else {
        setError(data.error || 'Failed to rename file');
      }
    } catch (err) {
      setError('Error renaming file: ' + err.message);
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

      const response = await fetch('/api/export-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: exportData,
          filename: selectedFile.analysis.title || 'export'
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to export JSON');
      }
    } catch (err) {
      setError('Error exporting JSON: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="app-container">
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
            <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
              <FileList 
                files={files} 
                selectedFile={selectedFile} 
                onFileSelect={handleFileSelect} 
              />
            </Paper>
            
            {selectedFile && (
              <>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <MetadataEditor 
                    file={selectedFile} 
                    onMetadataUpdate={(metadata) => handleMetadataUpdate(selectedFile.id, metadata)} 
                    coverArtUrl={coverArtUrl}
                  />
                </Paper>
                
                <Paper elevation={3} sx={{ p: 3 }}>
                  <ActionButtons 
                    onGenerateCoverArt={handleGenerateCoverArt}
                    onWriteTags={handleWriteTags}
                    onRenameFile={handleRenameFile}
                    onExportJson={handleExportJson}
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