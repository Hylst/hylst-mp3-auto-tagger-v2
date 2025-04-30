/**
 * Configuration pour la gestion avancée des métadonnées MP3
 * Ce fichier contient les paramètres pour les formats de métadonnées et les modèles de nommage
 */

// Configuration des tags ID3 avancés
const advancedTags = {
  // Tags ID3v2.4 standard
  standard: {
    TIT2: { name: 'title', description: 'Titre' },
    TPE1: { name: 'artist', description: 'Artiste' },
    TALB: { name: 'album', description: 'Album' },
    TCON: { name: 'genre', description: 'Genre' },
    TRCK: { name: 'trackNumber', description: 'Numéro de piste' },
    TYER: { name: 'year', description: 'Année' },
    TDAT: { name: 'date', description: 'Date' },
    COMM: { name: 'comment', description: 'Commentaire' },
    USLT: { name: 'lyrics', description: 'Paroles' },
  },
  
  // Tags ID3v2.4 étendus
  extended: {
    TBPM: { name: 'bpm', description: 'Tempo (BPM)' },
    TKEY: { name: 'initialKey', description: 'Tonalité musicale' },
    TCOM: { name: 'composer', description: 'Compositeur' },
    TEXT: { name: 'lyricist', description: 'Parolier' },
    TPUB: { name: 'publisher', description: 'Éditeur' },
    TCOP: { name: 'copyright', description: 'Copyright' },
    TENC: { name: 'encodedBy', description: 'Encodé par' },
    TSSE: { name: 'encodingSettings', description: 'Paramètres d\'encodage' },
    TLAN: { name: 'language', description: 'Langue' },
    TCMP: { name: 'compilation', description: 'Compilation' },
    TDRC: { name: 'recordingTime', description: 'Date d\'enregistrement' },
    TDRL: { name: 'releaseTime', description: 'Date de sortie' },
  },
  
  // Tags personnalisés (TXXX)
  custom: {
    CREATIVE: { name: 'creative', description: 'Description créative' },
    KEYWORDS: { name: 'keywords', description: 'Mots-clés' },
    MOOD: { name: 'mood', description: 'Ambiance' },
    USAGE: { name: 'usage', description: 'Utilisation' },
    SONG: { name: 'song', description: 'Indicateur de chanson' },
    ENERGY: { name: 'energy', description: 'Niveau d\'énergie' },
    DANCEABILITY: { name: 'danceability', description: 'Aptitude à la danse' },
    ACOUSTICNESS: { name: 'acousticness', description: 'Caractère acoustique' },
    INSTRUMENTAL: { name: 'instrumental', description: 'Caractère instrumental' },
    TEMPO_CATEGORY: { name: 'tempoCategory', description: 'Catégorie de tempo' },
  }
};

// Modèles de nommage prédéfinis
const namingTemplates = {
  standard: {
    name: 'Standard',
    pattern: '{artist} - {title}',
    description: 'Format standard Artiste - Titre'
  },
  numbered: {
    name: 'Numéroté',
    pattern: '{trackNumber}. {title}',
    description: 'Format numéroté pour albums'
  },
  detailed: {
    name: 'Détaillé',
    pattern: '{artist} - {album} - {trackNumber} - {title}',
    description: 'Format détaillé avec album et numéro de piste'
  },
  genrePrefixed: {
    name: 'Préfixe Genre',
    pattern: '[{genre}] {artist} - {title}',
    description: 'Format avec préfixe de genre'
  },
  yearSuffixed: {
    name: 'Suffixe Année',
    pattern: '{artist} - {title} ({year})',
    description: 'Format avec année en suffixe'
  },
  keyBpm: {
    name: 'DJ Format',
    pattern: '{artist} - {title} [{initialKey}][{bpm}BPM]',
    description: 'Format DJ avec tonalité et BPM'
  },
  custom: {
    name: 'Personnalisé',
    pattern: '',
    description: 'Format personnalisé'
  }
};

// Préréglages pour différents types de musique
const musicPresets = {
  electronic: {
    name: 'Musique Électronique',
    namingTemplate: 'keyBpm',
    priorityTags: ['TBPM', 'TKEY', 'TCON', 'TXXX:ENERGY', 'TXXX:DANCEABILITY'],
    defaultValues: {
      genre: 'Electronic'
    }
  },
  classical: {
    name: 'Musique Classique',
    namingTemplate: 'detailed',
    priorityTags: ['TCOM', 'TALB', 'TRCK', 'TYER'],
    defaultValues: {
      genre: 'Classical'
    }
  },
  podcast: {
    name: 'Podcast',
    namingTemplate: 'standard',
    priorityTags: ['TALB', 'TDAT', 'TCON', 'COMM'],
    defaultValues: {
      genre: 'Podcast'
    }
  },
  soundtrack: {
    name: 'Bande Originale',
    namingTemplate: 'detailed',
    priorityTags: ['TALB', 'TCOM', 'TCON', 'TXXX:MOOD'],
    defaultValues: {
      genre: 'Soundtrack'
    }
  }
};

// Fonction pour appliquer un modèle de nommage
const applyNamingTemplate = (template, metadata) => {
  let result = template;
  
  // Remplacer les variables dans le modèle
  Object.keys(metadata).forEach(key => {
    if (metadata[key]) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, metadata[key]);
    }
  });
  
  // Nettoyer les variables non remplacées
  result = result.replace(/\{[^\}]+\}/g, '');
  
  // Nettoyer les caractères spéciaux et espaces multiples
  result = result.replace(/[\/:*?"<>|]/g, '_');
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};

export {
  advancedTags,
  namingTemplates,
  musicPresets,
  applyNamingTemplate
};