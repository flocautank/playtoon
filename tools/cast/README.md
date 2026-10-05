# Synth Horde — cast « Living Sound »

| Fichier | Rôle |
|---|---|
| `build.py` | Script Blender (headless, `bpy` 4.x) : modélise les 9 têtes de héros sur un squelette commun et leurs 7 animations, les 10 familles d'ennemis, les 3 boss, les tours d'enceintes et les objets ; écrit `js/bonk-cast-data.js`. |
| `poster.html`, `poster.mjs` | Rendent la distribution avec les vrais modèles, fond transparent → `apps/synth-horde/assets/cast/` (icône, capsules, visuels de boutique). |

Régénérer : `pip install bpy` (Python 3.11), puis `python tools/cast/build.py`, puis `node tools/cast/poster.mjs`,
`node apps/synth-horde/make-assets.mjs` et `node apps/desktop/steam/make-art.mjs`.

Conventions : Blender Z en haut et l'avant vers −Y, converti en Y en haut / avant vers +Z. Chaque pièce rigide a un pivot
(origine de l'objet) ; ses animations sont écrites en GLSL dans `js/bonk-cast.js` (`ANIM`), par type. Matériaux spéciaux :
`Accent`/`Accent2` (couleurs du personnage), `Screen` (oscilloscope), `Noise` (neige télé), `beat=True` (pulse sur la musique).
