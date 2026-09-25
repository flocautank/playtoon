# Backlog Playtoon

Développement itératif des trois jeux. Une itération = un chantier : implémenté, testé en Chromium
headless (`node tools/smoke.mjs`, zéro erreur console, captures relues), poussé sur `main`
(`gh-pages` suit via le workflow), déploiement Pages vérifié.

## À faire (ordre de priorité)

1. **[Neon Bonk] Étape 2** — le portail mène à un second niveau plus dur (autre palette, ennemis renforcés, boss 2) au lieu de terminer la run ; la victoire finale vient après le boss 2.
2. **[Bloc Party] Mode Aventure** — niveaux à objectifs (gemmes à récupérer sur la grille, score cible en N coups), 3 étoiles par niveau, carte de progression.
3. **[Bloc Party] Boosters** — bombe (efface 3×3), marteau (une case), mélange du plateau de pièces ; gagnés en jouant.
4. **[Star Forge] Défis** — runs contraintes (sans clic, forges plus chères…) débloquées après la 1re Supernova, récompense permanente chacune.
5. **[Neon Bonk] Bestiaire et sanctuaires** — chargeur (fonce en ligne droite), diviseur (se scinde à la mort) ; sanctuaire de défi (fait venir une élite contre un coffre gratuit), sanctuaire d'avarice (+or, +ennemis) ; jarres destructibles.
6. **[Neon Bonk] Musique** — boucle synthwave procédurale (basse arpégée, batterie), intensité selon le danger.
7. **[Star Forge] Équilibrage** — simulation d'un joueur optimal : 1re Supernova visée à ~15–20 min ; option de notation scientifique.
8. **[Bloc Party] Défi du jour** — graine quotidienne identique pour tout le monde, meilleur score du jour.
9. **[Transverse] PWA** — manifest + icône pour installer Playtoon sur l'écran d'accueil mobile.

## Fait

- **v1** (2026-09-25) — les trois jeux jouables, nav fine à 3 onglets, publication GitHub Pages.
- **Itération 1** (2026-09-25) — bouton son global dans la nav ; Neon Bonk : crédits gagnés à chaque run et boutique permanente (9 améliorations, dont relances et résurrection).
