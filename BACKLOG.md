# Backlog Playtoon

Développement itératif des trois jeux. Une itération = un chantier : implémenté, testé en Chromium
headless (`node tools/smoke.mjs`, zéro erreur console, captures relues), poussé sur `main`
(`gh-pages` suit via le workflow), déploiement Pages vérifié.

## À faire (ordre de priorité)

{n}. **[Bloc Party] Mode Aventure** — niveaux à objectifs (gemmes à récupérer sur la grille, score cible en N coups), 3 étoiles par niveau, carte de progression.
{n}. **[Bloc Party] Boosters** — bombe (efface 3×3), marteau (une case), mélange du plateau de pièces ; gagnés en jouant.
{n}. **[Star Forge] Défis** — runs contraintes (sans clic, forges plus chères…) débloquées après la 1re Supernova, récompense permanente chacune.
{n}. **[Neon Bonk] Bestiaire et sanctuaires** — chargeur (fonce en ligne droite), diviseur (se scinde à la mort) ; sanctuaire de défi (fait venir une élite contre un coffre gratuit), sanctuaire d'avarice (+or, +ennemis) ; jarres destructibles.
{n}. **[Neon Bonk] Musique** — boucle synthwave procédurale (basse arpégée, batterie), intensité selon le danger.
{n}. **[Star Forge] Équilibrage** — simulation d'un joueur optimal : 1re Supernova visée à ~15–20 min ; option de notation scientifique.
{n}. **[Bloc Party] Défi du jour** — graine quotidienne identique pour tout le monde, meilleur score du jour.
{n}. **[Transverse] PWA** — manifest + icône pour installer Playtoon sur l'écran d'accueil mobile.

## Fait

- **v1** (2026-09-25) — les trois jeux jouables, nav fine à 3 onglets, publication GitHub Pages.
- **Itération 1** (2026-09-25) — bouton son global dans la nav ; Neon Bonk : crédits gagnés à chaque run et boutique permanente (9 améliorations, dont relances et résurrection).
- **Itération 2** (2026-09-25) — Neon Bonk : deuxième étape « La Fournaise » (palette braise, relief plus accidenté, difficulté qui démarre à la 8e minute, 8 min), boss 2 « Hydre de magma » (×2,6 PV, plus rapide, engendre des ennemis) ; la victoire vient après le 2e portail ; crédits d'étape.
