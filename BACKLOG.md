# Backlog Playtoon

Développement itératif des trois jeux. Une itération = un chantier : implémenté, testé en Chromium
headless (`node tools/smoke.mjs`, zéro erreur console, captures relues), poussé sur `main`
(`gh-pages` suit via le workflow), déploiement Pages vérifié.

## À faire (ordre de priorité)

1. **[Neon Bonk] Bestiaire et sanctuaires** — chargeur (fonce en ligne droite), diviseur (se scinde à la mort) ; sanctuaire de défi (fait venir une élite contre un coffre gratuit), sanctuaire d'avarice (+or, +ennemis) ; jarres destructibles.
2. **[Neon Bonk] Musique** — boucle synthwave procédurale (basse arpégée, batterie), intensité selon le danger.
3. **[Star Forge] Équilibrage** — simulation d'un joueur optimal : 1re Supernova visée à ~15–20 min ; option de notation scientifique.
4. **[Bloc Party] Défi du jour** — graine quotidienne identique pour tout le monde, meilleur score du jour.
5. **[Transverse] PWA** — manifest + icône pour installer Playtoon sur l'écran d'accueil mobile.

## Fait

- **v1** (2026-09-25) — les trois jeux jouables, nav fine à 3 onglets, publication GitHub Pages.
- **Itération 1** (2026-09-25) — bouton son global dans la nav ; Neon Bonk : crédits gagnés à chaque run et boutique permanente (9 améliorations, dont relances et résurrection).
- **Itération 2** (2026-09-25) — Neon Bonk : deuxième étape « La Fournaise » (palette braise, relief plus accidenté, difficulté qui démarre à la 8e minute, 8 min), boss 2 « Hydre de magma » (×2,6 PV, plus rapide, engendre des ennemis) ; la victoire vient après le 2e portail ; crédits d'étape.
- **Itération 3** (2026-09-25) — Bloc Party : mode Aventure de 40 niveaux déterministes (💎 à libérer dans des lignes de pierres à trous, ou N lignes à effacer), coups limités, 1 à 3 étoiles, carte de progression, nouveau tirage offert une fois par niveau ; calibré par solveur glouton (`tools/bp-levels.mjs` : 38/40 réussis).
- **Itération 4** (2026-09-25) — Bloc Party : pièces 🪙 (1 par ligne en classique, 10 par étoile nouvelle en Aventure, 40 offertes au départ) et trois boosters — marteau 🔨 (une case, 15), bombe 💣 (3×3, 30, avec zone de visée), mélange 🔀 (nouvelles pièces, 20) ; « Continuer avec un booster » sur une grille bloquée.
- **Itération 5** (2026-09-25) — Star Forge : onglet Défis (après la 1re Supernova), 6 runs sous contrainte — Sans les mains, Pénurie, Ascète, Inflation, Étoile pâle, Contre la montre — chacune avec une récompense permanente ; bandeau de progression et abandon ; pas de Supernova pendant un défi.

## À surveiller

- `tools/smoke.mjs` a échoué une fois sans message lisible pendant l'itération 4, puis est passé deux fois de suite : possible instabilité d'un clic en headless.
