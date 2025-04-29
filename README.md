# MP3 Auto Tagger

A modern web application that allows users to upload MP3 files, analyze them using the Gemini API, and automatically write ID3 metadata tags.

## Features

### MP3 Import
- Upload one or multiple MP3 files via drag & drop or file picker
- Preview uploaded files with basic information

### Audio Analysis
- Analyze MP3 files using Gemini API to extract:
  - Up to 14 keywords describing the music
  - 8 title suggestions
  - Main genre and subgenre
  - Technical and creative descriptions
  - Mood and usage keywords
  - Lyrics detection and language identification

### Metadata Management
- Select from suggested titles
- View and edit all extracted metadata
- Map metadata to ID3 v2.4 tags:
  - TIT2 (Title)
  - TCON (Genre)
  - TALB (Album = Subgenre)
  - COMM (Comment = Technical Description)
  - USLT (Lyrics)
  - Custom TXXX frames for keywords, mood, usage, and song flag

### Actions
- Rename MP3 files using the chosen title
- Write ID3 tags to the MP3 files
- Generate cover art based on keywords
- Export metadata as JSON

## Tech Stack

- **Frontend**: React with Material-UI
- **Backend**: Node.js with Express
- **File Handling**: Multer for uploads, node-id3 for tag management
- **API Integration**: Gemini API for text and image generation

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Gemini API key
4. Start the development server:
   ```
   npm run dev
   ```

## Development

### Frontend
The React frontend is built with Material-UI components for a modern, responsive UI. Key components include:
- FileUploader: Handles drag & drop file uploads
- FileList: Displays uploaded files
- MetadataEditor: Shows and allows editing of extracted metadata
- ActionButtons: Provides functionality for tag writing, renaming, etc.

### Backend
The Express backend handles:
- File uploads and storage
- Communication with the Gemini API
- ID3 tag reading and writing
- File operations (renaming, JSON export)

## Usage Workflow

1. **Upload**: Drag & drop or select MP3 files
2. **Analysis**: Files are analyzed by the Gemini API
3. **Review**: View and edit extracted metadata
4. **Actions**: Generate cover art, write tags, rename files, or export JSON

## JSON Export Format

```json
{
  "originalName": "example.mp3",
  "duration": 215,
  "createdAt": "2025-04-28T14:30:00Z",
  "metadata": {
    "title": "Chosen Title",
    "genre": "Pop",
    "subgenre": "Indie Pop",
    "technical": "128 kbps, 44.1 kHz, stereo",
    "creative": "A dreamy nostalgic ballad...",
    "keywords": ["nostalgia", "dreamy", "..."],
    "mood": ["calm", "melancholic"],
    "usage": ["background music", "podcast"],
    "lyrics": "Lyrics go here...",
    "language": "en",
    "song": 1
  }
}
```

## License

MIT