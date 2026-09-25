# Backlog Playtoon

Développement itératif des trois jeux. Une itération = un chantier : implémenté, testé en Chromium
headless (`node tools/smoke.mjs`, zéro erreur console, captures relues), poussé sur `main`
(`gh-pages` suit via le workflow), déploiement Pages vérifié.

## Processus de la boucle

1. Prendre le prochain chantier ci-dessous (feuille de route + retours d'évaluation).
2. Implémenter, tester (`node tools/smoke.mjs` + outils de mesure), relire les captures, pousser sur `main`, vérifier Pages.
3. Quand la liste est vide : un **sous-agent évaluateur** joue aux trois jeux (desktop + mobile) du point de vue d'un joueur et liste les défauts ; ils sont versés ici, par gravité.
4. La boucle s'arrête quand une évaluation ne trouve plus rien d'améliorable qui vaille la peine.

## À faire (ordre de priorité)

*Évaluation n° 1 (sous-agent joueur, 2026-09-25, desktop + iPhone 13) — versée en tête.*

1. **[Neon Bonk]** Caméra obstruée (murs, gros objets cachent l'avatar) → caméra qui se rapproche devant un obstacle. Chiffres de dégâts illisibles dès le niveau 8 → regroupés / critiques seulement / option. Mobile : bouton pause visible, bouton E sans glissade (bouton de glissade séparé), level-up compact (3 cartes visibles, « Relancer » accessible, pas de [1][2] au doigt), message d'accueil sans chevauchement, bouton « Lancer » qui ne recouvre pas la boutique. Écran de fin : « Rejouer » direct. Noms des armes au HUD / en pause, indice d'évolution lisible.
2. **[Transverse]** Page d'accueil qui présente les trois jeux (et le profil). Un seul réglage audio (musique intégrée au réglage global). Objectifs du jour transverses qui relient les jeux. Zoom autorisé (retirer `user-scalable=no`), contraste et taille des textes secondaires.

*Feuille de route (après les retours d'évaluation).*

3. **[Star Forge] Événements** — météores rares (bonus ×77 de 7 s), éclipse (production doublée mais clics nuls) ; fréquence réglée par la Chance.
4. **[Neon Bonk] Troisième étape** — « Le Vide » (gravité réduite, plateformes flottantes, boss final) après la Fournaise.

## Fait

- **v1** (2026-09-25) — les trois jeux jouables, nav fine à 3 onglets, publication GitHub Pages.
- **Itération 1** (2026-09-25) — bouton son global dans la nav ; Neon Bonk : crédits gagnés à chaque run et boutique permanente (9 améliorations, dont relances et résurrection).
- **Itération 2** (2026-09-25) — Neon Bonk : deuxième étape « La Fournaise » (palette braise, relief plus accidenté, difficulté qui démarre à la 8e minute, 8 min), boss 2 « Hydre de magma » (×2,6 PV, plus rapide, engendre des ennemis) ; la victoire vient après le 2e portail ; crédits d'étape.
- **Itération 3** (2026-09-25) — Bloc Party : mode Aventure de 40 niveaux déterministes (💎 à libérer dans des lignes de pierres à trous, ou N lignes à effacer), coups limités, 1 à 3 étoiles, carte de progression, nouveau tirage offert une fois par niveau ; calibré par solveur glouton (`tools/bp-levels.mjs` : 38/40 réussis).
- **Itération 4** (2026-09-25) — Bloc Party : pièces 🪙 (1 par ligne en classique, 10 par étoile nouvelle en Aventure, 40 offertes au départ) et trois boosters — marteau 🔨 (une case, 15), bombe 💣 (3×3, 30, avec zone de visée), mélange 🔀 (nouvelles pièces, 20) ; « Continuer avec un booster » sur une grille bloquée.
- **Itération 5** (2026-09-25) — Star Forge : onglet Défis (après la 1re Supernova), 6 runs sous contrainte — Sans les mains, Pénurie, Ascète, Inflation, Étoile pâle, Contre la montre — chacune avec une récompense permanente ; bandeau de progression et abandon ; pas de Supernova pendant un défi.
- **Itération 6** (2026-09-25) — Neon Bonk : chargeur (vise, clignote, fonce en ligne droite) et diviseur (se scinde en 3) ; sanctuaires typés — charge (bénédiction), défi (2 élites → coffre gratuit), avarice (+50 % d'or, +25 % d'ennemis, cumulable) — couleurs propres sur le radar ; 40 jarres qui se brisent au contact (or, XP ou soin).
- **Itération 7** (2026-09-25) — Neon Bonk : musique synthwave procédurale (`js/synthwave.js`, WebAudio) — nappe, basse, arpège avec écho, batterie ; intensité 0–3 selon la minute, la foule proche et le boss ; transposée et accélérée dans la Fournaise ; coupée par le bouton son, réglable dans la pause.
- **Itération 8** (2026-09-25) — Star Forge : équilibrage mesuré par `tools/sf-balance.mjs` (joueur appliqué, 3 clics/s, meilleur rendement) — 1re Supernova rentable vers 12–15 min au lieu de 25, 20 Novae en 45 min, run 2 deux fois plus rapide (Novae : √(produit/2e5), +5 % chacune, 8 % avec le nœud ; palier ×2 dès 10 forges) ; option de notation scientifique ; correctif d'un plantage au chargement introduit en cours d'itération et attrapé par le test.
- **Itération 9** (2026-09-25) — Bloc Party : défi du jour (grille et suite de pièces tirées de la date, identiques pour tous et à chaque essai), meilleur du jour, série de jours consécutifs, pièces gagnées ; bornage défensif de deux boucles (placement des coffres de Neon Bonk, rattrapage de la musique) ; test de fumée avec délais par action, étapes horodatées et chien de garde qui imprime la pile en cas de gel.
- **Itération 10** (2026-09-25) — PWA : manifeste, icônes PNG (générées par `tools/make-icons.mjs`), service worker « réseau d'abord » (jamais de version périmée en ligne, jeu complet hors-ligne), raccourcis vers chaque jeu ; testé hors-ligne dans le test de fumée.
- **Itération 11** (2026-09-25) — Neon Bonk : équilibrage mesuré sur 30 runs par `tools/nb-balance.mjs` (bot humain naïf) — médiane de survie 4:59 → 6:33, Q3 8:41, 5/30 atteignent le boss (0/20 avant) ; balles des tireurs identifiées comme 1re cause de dégâts (53 %) puis adoucies, XP plus facile, apparitions un peu plus douces en minutes 2–5, épines moins rapides, ramassage plus large. **Gel intermittent résolu** : taille des particules non bornée près de la caméra (sprites géants) ; 60 runs consécutives sans gel après correctif.
- **Itération 12** (2026-09-25) — Neon Bonk : 7 évolutions d'armes (arme Nv 8 + tome associé → le prochain coffre la fait évoluer) : Canon à rafales, Anneau de Saturne, Cœur pulsar (soigne), Tempête, Scie stellaire, Lame d'Oméga, Barrage ; indices sur les cartes et dans la pause, annonce quand une évolution est prête, icône dorée au HUD.
- **Itération 13** (2026-09-25) — Neon Bonk : deux armes de plus — Laser (rayon continu qui suit l'ennemi le plus proche, rendu en faisceau lumineux additif) et Mines (posées sous les pas, armement puis explosion au contact) — avec leurs évolutions (Rayon de la mort avec le Tome de Savoir, Champ de mines avec le Tome d'Armure) ; 9 armes au total.
- **Itération 14** (2026-09-25) — Bloc Party : 5 thèmes achetables avec les pièces (Classique, Néon, Pastel, Pixel, Or & Obsidienne) — palette, rendu des cases et fond propres, aperçu dans le sélecteur 🎨, couleurs remappées à l'affichage (changement de thème sans risque en cours de partie) ; un seul message d'éloge à la fois.
- **Itération 15** (2026-09-25) — Star Forge : Big Bang, 2e couche de prestige (dès 200 Novae gagnées) — réinitialise Novae et Constellation contre des Singularités (√(Novae/50) ; +50 % de Novae et +10 % de production chacune) ; Galaxie de 5 automatisations (achat auto des forges et des améliorations, filet à comètes, départ à 10 Novae, Expansion) ; succès « Big Bang ».
- **Itération 16** (2026-09-25) — Profil commun (icône 👤 dans la nav, sans ajouter d'onglet) : records et progression des trois jeux, temps joué par jeu, export / import de toutes les sauvegardes en un seul code (les jeux ne réécrivent plus leur état par-dessus un import).
- **Itération 17a** (2026-09-25) — Bloc Party : mode Chrono (2 min, +1,5 s par ligne, points qui valent de plus en plus, grille bloquée → nouvelles pièces contre 5 s, top 10 local daté) depuis la carte.
- **Itération 17b** (2026-09-25) — Neon Bonk : re-mesure après laser, mines et évolutions — médiane 6:33 → 8:42, 11/30 runs atteignent le boss, aucune ne le bat (bot naïf, sans coffres ni évolutions). Laser adouci (4,5 dégâts / 0,18 s). Jugé acceptable : atteindre le boss est la norme, le battre demande un vrai build.
- **Itération E1** (2026-09-25, retours d'évaluation) — Star Forge : zone de l'étoile recalculée par `ResizeObserver` (15 touchers au centre = 15 poussières sur mobile, 0 avant) ; fiches au toucher (1er toucher = fiche, 2e = achat) pour améliorations, Constellation, Galaxie et succès, valeurs vivantes ; notifications déplacées au-dessus de l'étoile ; confirmations dans le style du jeu (`ptConfirm`, aussi pour Bloc Party et le profil) ; avertissement de Supernova quand le gain est faible ; carte « comment jouer » au premier lancement ; onglets moins serrés.
- **Itération E2** (2026-09-25, retours d'évaluation) — Bloc Party : main animée « Glisse une pièce sur la grille » jusqu'à la première pose ; bouton « 🗺️ Modes » ; Chrono en pause sous toute fenêtre (vérifié : 0 s perdue en 1,5 s de thèmes ouverts), gros compteur qui clignote en rouge sous 10 s, score à côté ; barre du haut qui tient sur iPhone ; pièce lâchée hors grille qui revient en glissant avec un son ; ↻ confirmé en Aventure / Chrono ; carte plus contrastée, indication de défilement sur mobile.

## À surveiller

- *(résolu à l'itération 11)* gel intermittent : c'était la taille non bornée des particules. Le chien de garde reste dans `tools/smoke.mjs` et `tools/nb-balance.mjs`.
