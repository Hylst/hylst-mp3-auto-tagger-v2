# Guide de Gestion Avancée des Métadonnées MP3

Ce document explique les nouvelles fonctionnalités de gestion avancée des métadonnées implémentées dans l'application MP3 Auto Tagger.

## Formats de Métadonnées Avancés

L'application prend désormais en charge un ensemble étendu de tags ID3v2.4, permettant une description plus riche et plus précise de vos fichiers audio.

### Tags ID3v2.4 Standard

| Tag ID | Description | Utilisation |
|--------|-------------|-------------|
| TIT2   | Titre       | Titre de la piste |
| TPE1   | Artiste     | Nom de l'artiste ou du groupe |
| TALB   | Album       | Nom de l'album |
| TCON   | Genre       | Genre musical |
| TRCK   | Numéro de piste | Position dans l'album |
| TYER   | Année       | Année de sortie |
| COMM   | Commentaire | Description technique ou notes |
| USLT   | Paroles     | Paroles de la chanson |

### Tags ID3v2.4 Étendus

| Tag ID | Description | Utilisation |
|--------|-------------|-------------|
| TBPM   | Tempo (BPM) | Battements par minute |
| TKEY   | Tonalité    | Tonalité musicale (ex: Cm, G#) |
| TCOM   | Compositeur | Auteur de la musique |
| TEXT   | Parolier    | Auteur des paroles |
| TPUB   | Éditeur     | Maison d'édition |
| TCOP   | Copyright   | Informations de droits d'auteur |
| TLAN   | Langue      | Langue des paroles |
| TDRC   | Date d'enregistrement | Date de l'enregistrement |

### Tags Personnalisés

L'application utilise des tags TXXX (User Defined Text Information) pour stocker des informations supplémentaires :

| Description | Utilisation |
|-------------|-------------|
| CREATIVE    | Description créative du morceau |
| KEYWORDS    | Mots-clés descriptifs |
| MOOD        | Ambiance du morceau |
| USAGE       | Utilisations recommandées |
| ENERGY      | Niveau d'énergie |
| DANCEABILITY | Aptitude à la danse |
| ACOUSTICNESS | Caractère acoustique |

## Modèles de Nommage

L'application propose désormais des modèles de nommage personnalisables pour renommer vos fichiers MP3 de manière cohérente et organisée.

### Modèles Prédéfinis

| Nom | Format | Description |
|-----|--------|-------------|
| Standard | `{artist} - {title}` | Format standard Artiste - Titre |
| Numéroté | `{trackNumber}. {title}` | Format numéroté pour albums |
| Détaillé | `{artist} - {album} - {trackNumber} - {title}` | Format détaillé avec album et numéro de piste |
| Préfixe Genre | `[{genre}] {artist} - {title}` | Format avec préfixe de genre |
| Suffixe Année | `{artist} - {title} ({year})` | Format avec année en suffixe |
| DJ Format | `{artist} - {title} [{initialKey}][{bpm}BPM]` | Format DJ avec tonalité et BPM |

### Variables Disponibles

Vous pouvez utiliser les variables suivantes dans vos modèles personnalisés :

- `{title}` - Titre de la piste
- `{artist}` - Nom de l'artiste
- `{album}` - Nom de l'album
- `{genre}` - Genre musical
- `{trackNumber}` - Numéro de piste
- `{year}` - Année de sortie
- `{bpm}` - Tempo en BPM
- `{initialKey}` - Tonalité musicale

## Préréglages par Type de Musique

L'application propose des préréglages optimisés pour différents types de musique, qui définissent automatiquement :

- Le modèle de nommage recommandé
- Les tags prioritaires à remplir
- Des valeurs par défaut pour certains champs

### Préréglages Disponibles

| Type | Description | Modèle de nommage | Tags prioritaires |
|------|-------------|-------------------|-------------------|
| Musique Électronique | Optimisé pour DJ | DJ Format | BPM, Tonalité, Énergie |
| Musique Classique | Pour collections classiques | Détaillé | Compositeur, Album, Numéro de piste |
| Podcast | Pour émissions et podcasts | Standard | Album, Date, Commentaire |
| Bande Originale | Pour musiques de films/jeux | Détaillé | Album, Compositeur, Ambiance |

## Exportation et Importation de Configurations

Vous pouvez désormais exporter vos configurations de métadonnées personnalisées et les importer ultérieurement ou les partager avec d'autres utilisateurs.

Les configurations exportées incluent :
- Le modèle de nommage sélectionné
- Les tags ID3 activés
- Le préréglage de type de musique

## Utilisation

1. Ouvrez l'onglet "Paramètres Avancés" dans l'éditeur de métadonnées
2. Sélectionnez un préréglage de type de musique (optionnel)
3. Choisissez ou créez un modèle de nommage
4. Activez les tags ID3 que vous souhaitez utiliser
5. Appliquez le modèle pour prévisualiser le nouveau nom de fichier
6. Enregistrez les métadonnées et renommez le fichier si désiré

## Conseils d'Organisation

- Utilisez des modèles cohérents pour tous les fichiers d'un même album ou projet
- Incluez le genre pour faciliter le tri par type de musique
- Pour les DJ, incluez toujours la tonalité et le BPM dans le nom de fichier
- Pour les collections classiques, privilégiez l'inclusion du compositeur
- Exportez vos configurations préférées pour les réutiliser facilement