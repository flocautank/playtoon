# Playtoon

Trois jeux jouables directement dans le navigateur, sans installation ni dépendance serveur.
Une barre de navigation fine en haut permet de passer de l'un à l'autre ; le jeu masqué est mis en pause.

| Onglet | Genre | En deux mots |
|---|---|---|
| **Bloc Party** | Puzzle casual, tout public | Pose les pièces sur une grille 8×8, complète lignes et colonnes, enchaîne les combos. Inspiré des puzzles de blocs du top des stores mobiles. |
| **Star Forge** | Clicker / idle | Clique l'étoile, achète des forges, des améliorations et des paliers. Attrape les comètes dorées. Déclenche une **Supernova** pour gagner des Novae permanentes et développer la **Constellation** (méta-progression). Production hors-ligne. |
| **Neon Bonk** | Survivor-like 3D | La boucle de Megabonk, en esthétique synthwave néon : à la troisième personne, cours, saute (double saut), glisse ; tes armes tirent seules. XP → choix d'améliorations à rareté, coffres payés en or, sanctuaires, élites, 10 minutes puis boss, portail. Personnages à débloquer. |

## Contrôles de Neon Bonk

- **ZQSD / WASD** (ou flèches) : se déplacer — la position des touches est lue physiquement, les deux dispositions de clavier marchent
- **Souris** : caméra (clic dans le jeu pour capturer le pointeur)
- **Espace** : sauter, deux fois en l'air · **Maj** : glisser (garde l'élan, accélère en descente)
- **E** : ouvrir un coffre / entrer dans le portail · **1 2 3** : choisir une amélioration · **R** : relancer le tirage · **Échap** : pause
- Sur mobile : joystick à gauche, glisser à droite pour la caméra, boutons SAUT et E.

## Technique

- HTML, CSS et JavaScript natifs (modules ES), aucun build.
- Neon Bonk utilise [three.js](https://threejs.org) r170, embarqué dans `vendor/` (licence MIT) : le site ne dépend d'aucun CDN.
- Graphismes 100 % procéduraux (shaders néon, grille, ciel synthwave), sons synthétisés en WebAudio.
- Progression sauvegardée dans le `localStorage` du navigateur.

## Installer Playtoon

Playtoon est une PWA : depuis le site, « Ajouter à l'écran d'accueil » (mobile) ou l'icône d'installation de la
barre d'adresse (Chrome, Edge) l'installe comme une application. Une fois chargé, il reste jouable hors-ligne.

## Outils de développement

- `node tools/smoke.mjs` — test de fumée Chromium headless (les trois jeux, desktop + mobile, PWA hors-ligne)
- `node tools/bp-levels.mjs` — solveur glouton qui calibre les 40 niveaux d'Aventure de Bloc Party
- `node tools/sf-balance.mjs` — joueur simulé qui mesure la progression de Star Forge
- `node tools/make-icons.mjs` — régénère les icônes de la PWA

## Publication

Le site est servi par GitHub Pages depuis la branche `gh-pages`, que le workflow `.github/workflows/publier.yml`
aligne sur `main` à chaque push.

Site : https://flocautank.github.io/playtoon/

Tester en local : `python3 -m http.server` à la racine, puis ouvrir http://localhost:8000.
