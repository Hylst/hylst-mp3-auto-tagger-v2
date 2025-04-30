# Guide d'Intégration avec les Services de Streaming

Ce document explique comment utiliser les fonctionnalités d'intégration avec les services de streaming musical dans MP3 Auto Tagger.

## Présentation

L'intégration avec les services de streaming vous permet de rechercher et d'importer des métadonnées depuis des plateformes populaires comme Spotify, Apple Music et Deezer. Cette fonctionnalité vous aide à obtenir des informations précises et complètes pour vos fichiers MP3 sans avoir à les saisir manuellement.

## Configuration des API

Pour utiliser l'intégration avec les services de streaming, vous devez configurer les clés API pour chaque plateforme :

1. **Spotify** : Créez un compte développeur sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) et créez une application pour obtenir une clé API.

2. **Apple Music** : Inscrivez-vous au [Apple Developer Program](https://developer.apple.com/programs/) et suivez les instructions pour obtenir une clé API MusicKit.

3. **Deezer** : Créez un compte sur [Deezer Developers](https://developers.deezer.com/) et enregistrez une application pour obtenir une clé API.

Une fois que vous avez obtenu vos clés API, cliquez sur le bouton "Configuration" dans l'onglet "Intégration Streaming" de l'application et entrez vos clés.

## Utilisation

### Recherche de métadonnées

1. Sélectionnez un fichier MP3 dans la liste des fichiers.
2. Accédez à l'onglet "Intégration Streaming".
3. Entrez le titre et/ou l'artiste dans les champs de recherche.
4. Cliquez sur "Rechercher" pour lancer la recherche sur les plateformes configurées.
5. Les résultats s'afficheront dans une liste en dessous.

### Importation des métadonnées

1. Cliquez sur un résultat dans la liste pour afficher les détails complets.
2. Vérifiez les informations affichées (titre, artiste, album, genre, etc.).
3. Cliquez sur "Importer les métadonnées" pour appliquer ces informations à votre fichier MP3.
4. Les métadonnées importées seront automatiquement appliquées au fichier sélectionné.

## Métadonnées importées

Les métadonnées suivantes peuvent être importées depuis les services de streaming :

- Titre
- Artiste
- Album
- Genre
- Année de sortie
- Numéro de piste
- Pochette d'album

## Limitations actuelles

- L'importation des paroles n'est pas encore prise en charge.
- Certaines plateformes peuvent limiter le nombre de requêtes par jour selon leur politique d'API.
- La qualité des pochettes d'album peut varier selon la plateforme.

## Dépannage

### Aucun résultat trouvé

Si votre recherche ne donne aucun résultat :

1. Vérifiez l'orthographe du titre et de l'artiste.
2. Essayez d'utiliser moins de termes dans votre recherche.
3. Assurez-vous que vos clés API sont correctement configurées et valides.

### Erreurs d'API

Si vous rencontrez des erreurs lors de l'utilisation des API :

1. Vérifiez que vos clés API sont toujours valides.
2. Assurez-vous que vous n'avez pas dépassé les limites de requêtes quotidiennes.
3. Vérifiez votre connexion Internet.

## Développements futurs

Les améliorations suivantes sont prévues pour les prochaines versions :

- Support pour d'autres services de streaming (YouTube Music, Tidal, etc.)
- Importation des paroles depuis les services qui les fournissent
- Synchronisation bidirectionnelle des playlists
- Reconnaissance audio pour identifier automatiquement les morceaux
- Amélioration de la recherche avec filtres avancés

## Feedback

Vos commentaires sur cette fonctionnalité sont les bienvenus ! Si vous rencontrez des problèmes ou avez des suggestions d'amélioration, veuillez nous contacter à travers l'interface de l'application ou via notre site web.