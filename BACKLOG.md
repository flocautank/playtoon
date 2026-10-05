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

*Évaluations n° 6 (Block Quarry, Nova Foundry) et n° 7 (Synth Horde), 2026-09-28 : verdict « non » pour les trois jeux —
plus rien qui vaille une itération d'après des sous-agents joueurs. **Boucle arrêtée.** Ce qui reste ne peut être tranché
que par de vrais joueurs sur de vrais appareils :*

- ressenti de la difficulté et de l'économie (Aventure de Block Quarry, défis et fin de partie de Nova Foundry, Chaleur de Synth Horde) ;
- performances de Synth Horde sur un Android d'entrée de gamme ;
- Synth Horde : gemmes laissées en hauteur en fin d'étape 2–3 par un bot — à confirmer par un humain (sinon, aimant périodique) ;
- Nova Foundry : puits de Novae après la Constellation pour les joueurs de plus de 10 h (optionnel).

## Synth Horde vs Megabonk

*Évaluation du 2026-10-04 : lecture de `js/bonk.js` (2203 lignes), une run jouée sous Playwright (stage 1, niveau 20, boss, écran de fin), et des sources publiques sur Megabonk (v1.0.x, Vedinad, sept. 2025, plus de 2 M d'exemplaires vendus).*

### Inventaire comparé

| | Megabonk | Synth Horde (`bonk.js`) |
|---|---|---|
| Personnages | 21, avec un passif qui progresse | 6 (`CHARS`), bonus fixe à la création |
| Armes | 31 | 9 (`WEAPONS`) + 9 évolutions (`EVOS`, arme niv. 8 + tome) |
| Tomes | 23–26 | 12 (`TOMES`), 4 emplacements |
| Objets | 85–86, 5 raretés, effets conditionnels | 14 (`ITEMS`), 4 raretés, que des stats plates |
| Cartes | 3 (Forêt, Désert, Cimetière), tiers 1–3 | 3 étapes (`STAGES`), même générateur, palette et gravité différentes |
| Ennemis / boss | Beaucoup de types par carte, mini-boss, boss final | 6 types (`ETYPES`) + variante élite, 3 boss (`spawnBoss`) |
| Interactables | Sanctuaires de charge (15/carte), d'avarice (8), dorés, de défi ; coffres (30 or puis plus cher) ; Shady Guy ; Micro-ondes ; pots | 16 coffres (12 or, ×1,45+4), 4 sanctuaires de charge, 2 de défi, 2 d'avarice, 40 jarres |
| Méta | Argent (silver) issu des quêtes, environ 200 quêtes qui débloquent persos, armes, tomes et objets | Crédits + boutique de 9 lignes (`SHOP`), 5 déblocages de personnages, Heat 1–5 |
| Fin de run | Final Swarm sans fin, avec succès « survivre 60 s / 2 min / 6 min » | Prolongation : `spawning()` ajoute +4/s, puis +4/s par minute ; victoire après le 3e boss |

Le cœur de la boucle est déjà présent : timer de 10 min, coffres payés en or, sanctuaires, rareté, portail, double saut, glissade sur pente et élan conservé en l'air.

### Écarts classés par impact sur le plaisir de jeu

**1. Le jeu manque de « jus » : pas de tremblement d'écran, pas de hit-stop, sons pauvres** — *S/M*
- Megabonk : selon la critique, c'est un jeu « bouncy » et « satisfying when things pop off ». Chaque mort, crit ou coffre a son retour sonore et visuel.
- Synth Horde : aucun tremblement de caméra ni gel d'image. On ne trouve ni `shake` ni `hitstop` dans le fichier, et `updateCamera` ne fait que suivre le joueur. Dans `sfx()`, chaque effet est un seul oscillateur ; les coups (`hit`) et les morts (`kill`) sont limités à un toutes les 40–45 ms. Un crit se voit seulement à un chiffre plus gros et jaune (`draw2D`). Une mort ordinaire produit 10 particules (`kill`).
- Proposition :
  - un « trauma » de caméra dans `updateCamera`, alimenté par `hurt`, `explode`, la mort d'un élite et le boss ;
  - un hit-stop de 40–90 ms dans `frame()` sur les crits lourds, les morts d'élite et l'évolution d'une arme ;
  - une mort en « pop » : l'ennemi grossit puis disparaît, avec des éclats instanciés ;
  - des sons à deux couches (oscillateur + bruit déjà disponible dans `synthwave.js`) avec un léger écart de hauteur aléatoire, et une hauteur qui monte quand on ramasse des gemmes à la suite ;
  - un petit coup de FOV à la montée de niveau.
- Lisibilité, vue en jeu : les gros ennemis placés entre la caméra et le joueur remplissent l'écran (capture du boss). Il faut les rendre semi-transparents quand ils sont proches de la caméra, comme le fait déjà le « rayon X » des plateformes.

**2. Les objets ne font pas de build** — *M/L*
- Megabonk : 85 objets, dont beaucoup sont conditionnels (à la mort d'un ennemi, au crit, selon la vitesse, PV bas…). Les légendaires deviennent le centre d'un build, et le Micro-ondes duplique un objet.
- Synth Horde : 14 objets, tous des stats plates sauf `bomb` (explosion à la mort) et `fang` (vol de vie). L'objet est tiré au hasard dans `interact()`, sans aucun choix.
- Proposition : environ 25 objets à déclencheurs, en réutilisant les points d'entrée existants (`kill()`, `damage()` pour les crits, `jump()`, `slide()`, `hurt()`). Exemples :
  - éclair à l'atterrissage ;
  - dégâts proportionnels à la vitesse ;
  - +X % de dégâts sous 30 % de PV ;
  - une étoile tous les N kills ;
  - une glissade qui enflamme le sol ;
  - le dernier coup sur un élite qui double l'or.
- Afficher les cumuls dans le HUD.

**3. Rien à faire de l'or : pas de marchand, pas de duplication** — *M*
- Megabonk : le Shady Guy vend un objet parmi plusieurs puis disparaît ; le Micro-ondes duplique un objet contre un autre de même rareté ; les coffres deviennent de plus en plus chers.
- Synth Horde : l'or ne sert qu'aux coffres. Pendant la run de test, il restait **609 or** à la mort, convertis en crédits à 1/40 (`renderEnd`).
- Proposition, à faire dans `buildLevel()` et `interact()` :
  - un **marchand** (3 objets avec prix et rareté, un seul achat) ;
  - un **micro-ondes** (2–3 utilisations) ;
  - un **sanctuaire de malédiction** (il fait apparaître un mini-boss qui lâche un coffre doré) ;
  - un **sanctuaire aimant** ;
  - un **coffre doré** gratuit au boss.

**4. Méta trop courte : pas de quêtes, pas de contenu à débloquer** — *M*
- Megabonk : environ 200 quêtes (« tuer 7 500 ennemis → Revolver ») rapportent de l'argent et ajoutent des armes, tomes et objets au pool. C'est le moteur du « encore une run ».
- Synth Horde : seuls 5 personnages se débloquent (`CHARS[].unlock`). La boutique (`SHOP`) se maxe et n'ajoute aucun contenu. La Heat se débloque après une victoire.
- Proposition : une table `QUESTS` déclarative (environ 40 entrées, du type `{test: m => …, unlock: 'item:xxx'}`), évaluée dans `endRun()`. Une partie des armes, objets et tomes reste verrouillée au départ ; un écran « Quêtes » s'ajoute au menu, avec une notification en run quand une quête est remplie.

**5. Foule clairsemée et ennemis peu variés** — *M/L*
- Megabonk : des hordes très denses, plusieurs familles par carte, des mini-boss.
- Synth Horde :
  - `MAX_ENEMIES` vaut 420, et le plafond réel dans `spawning()` est `min(300, 70+36·min)`. Dans la run de test, il n'y avait que **27–32 ennemis vivants** entre la 4e et la 6e minute ;
  - mêmes 6 types sur les 3 étapes, seulement 2 élites par étape (`eliteAt`) ;
  - le boss enchaîne 3 à 5 attaques en boucle (`updateBoss`).
- Proposition :
  - 2 types propres à chaque étape (porte-bouclier, téléporteur, kamikaze, soigneur, tourelle) ;
  - un mini-boss à 3 et 6 min ;
  - un plafond porté à environ 700 sur ordinateur (`InstancedMesh` est déjà en place), avec des vagues en « mur » ;
  - une deuxième phase de boss avec un pattern nouveau.

**6. Récap de run et feuille de stats** — *S*
- Megabonk : la demande pour des dégâts par arme et des stats détaillées est assez forte pour que des mods comme StatTracker et DetailedRunStats l'ajoutent.
- Synth Horde : `damage()` ne cumule que `S.dmgDealt`, sans savoir quelle arme frappe. `renderEnd` affiche le temps, les kills, les dégâts totaux et les coffres. `renderBuild` (pause) liste noms et niveaux, mais aucune stat.
- Proposition :
  - un paramètre `src` dans `damage()`, cumulé dans `S.dmgBy` ;
  - à la fin, des barres de dégâts et de DPS par arme, plus la liste des objets ;
  - en pause, une feuille de stats lue dans `S.stats` (dégâts, cadence, crit, chance, vitesse, armure).

**7. Le mouvement n'est pas assez récompensé** — *S/M*
- Megabonk : le bunny hop et la glissade suivie d'un bond accumulent de la vitesse, la stat de vitesse n'a quasiment pas de plafond, un compteur de vitesse existe, et c'est la signature du jeu.
- Synth Horde :
  - en l'air, `update()` garde l'élan (`lim = max(maxSp, hs)`) ;
  - au sol, la vitesse revient vers `maxSp` en quelques frames ;
  - la glissade a 0,9 s de recharge ;
  - un saut parfait n'apporte aucun gain.
- Proposition :
  - une fenêtre de 120 ms à l'atterrissage pendant laquelle un saut garde 100 % de l'élan, avec +4 % par saut enchaîné (plafond configurable) ;
  - des traits de vitesse et un FOV qui s'élargit selon la vitesse ;
  - des tremplins générés procéduralement ;
  - des objets qui convertissent la vitesse en dégâts (lien avec l'écart 2).

**8. Choix de niveau limités à la relance** — *S*
- Megabonk : relancer, passer et bannir.
- Synth Horde : `reroll()` seulement (2 + boutique).
- Proposition : ajouter **Bannir** (retire une option du pool pour la run) et **Passer** (gagne un peu d'or) dans `buildChoices` et `renderChoices`, en les débloquant via les quêtes.

**9. Personnages trop proches** — *M*
- Megabonk : 21 personnages, chacun avec un passif qui progresse et souvent une mécanique propre.
- Synth Horde : la fonction `bonus` de chaque personnage n'est appelée qu'une fois, dans `baseStats`.
- Proposition : un passif par niveau (`onLevel(s, lvl)`) et une mécanique unique par personnage, puis 4 nouveaux personnages (un fragile qui coûte moins cher en or, un qui frappe au saut, etc.).

**10. Peu d'armes** — *M/L*
- Megabonk : 31 armes.
- Synth Horde : 9 armes, dans le `switch` de `updateWeapons`.
- Proposition : 6 armes procédurales :
  - cône de flammes ;
  - aura de givre qui ralentit ;
  - rail perforant en ligne ;
  - tornade errante ;
  - flaques toxiques ;
  - essaim de drones à tête chercheuse.
- Chacune avec son évolution sur le modèle de `EVOS`.

**11. Les étapes se ressemblent** — *M/L*
- Megabonk : chaque carte a une identité (ruines, Crypte et ses 4 clés, Big Bob), et la critique reproche quand même le manque de décors.
- Synth Horde : un seul générateur (`buildLevel`) ; les étapes ne changent que la palette, `amp`, la gravité et les plateformes du Vide.
- Proposition :
  - un **danger propre** à chaque étape : lave de la Fournaise (zones du sol shader qui brûlent), dalles du Vide qui tournent ;
  - un **objectif caché** : 3 clés dispersées qui ouvrent un coffre légendaire ;
  - des **repères** procéduraux (tour, arche) qui aident à se repérer.

**12. Ouverture de coffre sans mise en scène, fin de run sans « score chase »** — *S*
- Megabonk : la rareté se révèle à l'ouverture d'un coffre ; le Final Swarm sert de défi de survie, avec des succès à 60 s, 2 min et 6 min.
- Synth Horde : `interact()` affiche simplement un `msg`. Après le 3e portail, la run est gagnée et s'arrête.
- Proposition :
  - une révélation de 0,6 s à l'ouverture (rayon de la couleur de rareté, montée de son, l'icône qui grossit) ;
  - un mode **Prolongation infinie** après la victoire, avec un record « survécu X s » enregistré dans `META` et relié aux quêtes.

### Hors de portée sans artistes, animateurs ou compositeurs

- **Personnages animés et charismatiques** (squelette, CL4NK, Roberto…) : le joueur de Synth Horde reste une capsule avec visière et halo. Une animation procédurale (squash/stretch, inclinaison, membres en IK simple) améliore les choses, mais ne remplace pas des modèles riggés et des animations faites à la main.
- **Modèles d'ennemis et de boss expressifs**, avec silhouettes, attaques animées et télégraphies lisibles : on reste sur des polyèdres néon.
- **Décors construits à la main** (ruines, crypte, landmarks narratifs) : on peut seulement s'en rapprocher par génération procédurale.
- **Bande-son composée** avec plusieurs morceaux par carte : `synthwave.js` génère une boucle par étape (intensité 0–3), honnête mais répétitive sur 30 minutes.
- **Humour « meme » et mise en scène** (voix, gags visuels) : ce n'est pas souhaitable pour l'esthétique synthwave, et ça n'a de toute façon de sens qu'avec des assets faits main.

### Sources

- https://en.wikipedia.org/wiki/Megabonk
- https://megabonkwiki.net/ (bloqué en lecture directe, résumé de recherche)
- https://bonkmaster.com/database (bloqué en lecture directe, résumé de recherche)
- https://megabonk.org/database/tomes/ · https://megabonk.org/database/items/ · https://megabonk.org/guides/progression/ · https://megabonk.org/guides/maps/
- https://megabonk.wiki.fextralife.com/Megabonk_Shrines_and_Interactables
- https://www.thegamer.com/megabonk-all-shrine-effects-what-they-do-guide/
- https://steamcommunity.com/sharedfiles/filedetails/?id=3571240516
- https://steamcommunity.com/sharedfiles/filedetails/?id=3575226808 (bunny hop)
- https://www.dtgre.com/2025/10/megabonk-advanced-movement-bunny-hop-sliding-guide.html
- https://steamcommunity.com/app/3405340/discussions/0/687493125920415796/ (Final Swarm)
- https://www.megabonk.ninja/guides/dexafire/surviving-the-final-swarm-boss-late-game-strategy-guide
- https://spot.monster/games/game-guides/megabonk-rarities-guide-item-rarities-explained-2/
- https://www.nexusmods.com/megabonk/mods/110 · https://thunderstore.io/c/megabonk/p/maanu113/DetailedRunStats/
- https://rogueliker.com/megabonk-review/ · https://www.gameshub.com/news/reviews/megabonk-review-2832477/ · https://game8.co/articles/reviews/megabonk-review
- https://gamerant.com/megabonk-features-added-spooky-update/ · https://outrungaming.com/megabonk-sells-1-million-copies-in-two-weeks-vedinad-roguelike/
- Non vérifié faute de source lue directement : l'existence de « Passer » et « Bannir » dans Megabonk, citée de mémoire. Le Steam Store est bloqué par le proxy.

### Avancement

| Écart | État |
|---|---|
| 1 | **fait** (1.4.0) — tremblement de caméra (trauma, réglage « Tremblement de l’écran » en pause), gel d'image (élite 70 ms, évolution 120 ms, boss 200 ms, coup reçu 40 ms), coup de focale (niveau, évolution, boss), mort en « pop » (l'ennemi gonfle et blanchit 0,1 s + éclat blanc), chiffres de crit qui naissent gros, sons à deux couches (bruit filtré + oscillateur, hauteur variée, compresseur), arpège montant des gemmes, ennemis et boss translucides entre caméra et joueur |
| 2 | **fait** (1.5.0) — 16 objets à déclencheur (30 au total) : onde de choc à l'atterrissage, feu des sauts en l'air, dégâts selon la vitesse, en l'air, sous 40 % de PV, nova tous les N kills, braises de glissade, crits en éclair chaîné, guillotine, givre, ralentissement quand on est touché, explosions renforcées, soin par gemme, or de Midas, coffres moins chers, surcadence après un niveau |
| 3 | **fait** (1.6.0) — marchand néon (1 objet parmi 3, prix selon rareté et étape), duplicateur (copie un objet possédé), sanctuaire maudit (champion ×3 PV → coffre doré), sanctuaire aimant, coffre doré (épique ou mieux) aussi lâché par chaque boss ; le passe-partout réduit aussi les prix |
| 4 | **fait** (1.7.0) — 21 quêtes permanentes (écran « Quêtes » au menu, progression, notification en run) : 14 débloquent un des nouveaux objets (absents des coffres avant), 2 un bonus de run (+1 relance, +1 bannir), 5 des crédits |
| 5 | **fait** (1.7.0) — 3 familles : kamikaze (Fournaise et Vide), clignoteur (Vide, se téléporte avec anneau d'avertissement), soigneur (rare, soigne ses voisins) ; Gardien mini-boss à 5:00 (anneaux de balles, coffre doré) ; meutes de 3 à 6 petits ; plafond porté à 380 sur ordinateur |
| 6 | **fait** (1.5.0) — dégâts par source (chaque arme, objets) en barres sur l'écran de fin, feuille de stats dans la pause, description des objets en infobulle |
| 7 | **fait** (1.6.0) — saut parfait dans les 150 ms après l'atterrissage : élan rendu +5 % par saut enchaîné (plafond 2,6× la marche), « REBOND ×N », tampon de saut, focale qui s'ouvre avec la vitesse, 8 tremplins par étape (sur le radar) |
| 8 | **fait** (1.6.0) — Bannir (2 par run, nouvelles armes / tomes / bénédictions, touche B, manette X) et Passer (+◆ 10 + 5×étape, touche N, manette Select) ; Partir chez le marchand (Échap, manette B) |
| 9 | **fait** (1.8.0) — chaque personnage a une mécanique propre (Ronin : la glissade tranche ; Volt : crits en chaîne ; Bastion : épines ; Nova : explosions ; Orbite : dégâts en l'air) et un passif qui grandit à chaque niveau ; 3 nouveaux personnages : Blitz (disque, vitesse = dégâts), Avare (mines, or, coffres moins chers), Hex (satellites, soin, givre) — 9 au total |
| 10 | **fait** (1.8.0) — 6 armes : lance-flammes (cône), aura de givre, canon rail, tornades errantes, flaques toxiques, essaim de drones, chacune avec son évolution (15 armes au total) ; dégâts calibrés dans la fourchette des armes existantes |
| 11 | **fait** (1.8.0) — 3 clés de données par étape (souvent perchées, phares visibles de loin, sur le radar) → coffre légendaire ; bouches de lave dans la Fournaise (éruption annoncée, blesse tout le monde) ; 3 failles dans le Vide (aspirent, broient les ennemis) |
| 12 | **fait** (1.7.0) — ouverture de coffre : colonne de lumière de la couleur de la rareté, son et annonce retardée (plus longue pour les raretés hautes) ; Prolongation ∞ après la victoire (nuée qui grossit sans fin, record en META, crédits seulement pour la prolongation) ; récap de dégâts sans l'excès sur un ennemi achevé |

### Réévaluation n° 2 (2026-10-04, build 1.8.0) — verdict : écarts atteignables restants

Évaluateur indépendant (recherche web + 9 sessions jouées, 3 étapes, 3 boss, Prolongation, ordinateur et téléphone, EN/FR).
À parité ou mieux : jus, mouvement, choix de niveau (relancer/bannir/passer), interactables, contenu (30 objets, 9 persos,
15 armes + évolutions), récap de run (mieux que Megabonk), traduction et téléphone.

| # | Écart | Effort | État |
|---|---|---|---|
| R1 | **Bug bloquant** : PV des boss 2–3 gonflés ~12× (le calcul comptait l'excès de dégâts et les ondes de nettoyage de la mort du boss, et le DPS de foule au lieu du DPS sur cible unique) | S | **fait** (1.8.1) — PV calibrés sur les dégâts réellement portés au boss pendant 6 s, combat visé 60/75/90 s ; dégâts utiles seulement ; test du PV de départ dans le smoke |
| R2 | Horde clairsemée en étape 1 et avec un bon build (0–11 ennemis les 2 premières minutes, 28–70 entre 5 et 8 min) : un « directeur » qui vise un nombre de vivants selon le temps, débit jusqu'à ~60/s, vagues toutes les 45 s | M | **fait** (1.9.0) — directeur de foule : vise ≈12 + 27×minute ennemis en vie (moitié pendant le boss), débit jusqu'à 60/s ; nuées toutes les 45 s (au lieu de 75) ; mesuré avec un bon build : 100–250 en vie dès la 3e minute (28–70 avant) |
| R3 | Pas de choix du moment du boss : autel d'invocation anticipée, bonus selon le temps restant | S/M | **fait** (1.9.0) — autel du boss (1 par étape) : invoque le boss tout de suite ; s'il reste ≥ 1:00, un 2e coffre doré ; crédits en fin de run selon le temps gagné |
| R4 | Méta qui s'épuise vite : ~60 quêtes à paliers, armes et tomes en partie verrouillés, plus d'objets conditionnels | M/L | **fait** (1.9.0) — 60 quêtes (21 + 30 paliers + une victoire par personnage) ; les 6 nouvelles armes sont désormais des récompenses de quête ; +1 bannir et +1 relance supplémentaires ; liste triée (à faire d'abord) |
| R5 | Or inutile en fin de run (2 300–3 300 restants) : marchand qui se réapprovisionne, 2e duplicateur, sanctuaire « or → bénédiction » | S | **fait** (1.9.0) — marchand et duplicateur restent ouverts (prix ×1,4 / ×1,6 à chaque achat) ; sanctuaire de la dîme : bénédiction contre de l'or, 3 fois, prix ×1,8 |
| R6 | Lisibilité en étape 3 : fondu étendu à tout ennemi proche de la caméra, silhouette du joueur à travers les obstacles | S | **fait** (1.9.0) — tout ennemi collé à l'objectif devient translucide (en plus de ceux entre caméra et joueur) ; la silhouette du joueur à travers les obstacles existait déjà |
| — | Mineurs : « Dégâts » de fin = excès (corrigé, 1.8.1) ; lave comptée comme objets (corrigé) ; « −0% » et icônes sans libellé sur tactile (corrigé : libellés courts) | S | **fait** (1.8.1) |

### Réévaluation n° 3 (2026-10-04, build 1.9.0) — verdict : écarts atteignables restants

Évaluateur indépendant, bot « joueur fort » (coffres, sanctuaires, marchand, dîme, autel ; 4 runs, ~100 min simulées).
Révèle ce que les bots naïfs ne voyaient pas : un build complet devient tout-puissant (niveau 136–191, 73–90 k kills).

| # | Écart | Effort | État |
|---|---|---|---|
| T1 | Boss 2 et 3 tués en 1–2 s (la calibration n'agissait qu'après 6 s, à la hausse) | S | **fait** (1.9.1) — entrée de 2 s invulnérable à 16 m, recalage continu des PV pendant 10 s, plancher de PV lié au temps dans `damage()` : un build énorme met au moins la moitié de la durée visée (mesuré ×200 dégâts : 51 / 48 / 80 s ; bot fort de l'évaluateur : 55 / 62 / 70 s) |
| T2 | Puissance sans plafond, horde vide après l'étape 1 | M | **fait** (1.9.1) — « pression » : PV ennemis ×1,12 toutes les 5 s tant que l'écran se vide au débit maximal (jusqu'à ×6) ; 30 % des apparitions à 45–55 m ; renforts du directeur à 35 % d'XP et seulement des drones et des pointes ; bénédictions de fin de build dégressives (−5 % chacune) ; courbe d'XP plus raide après 25, ennemis +3 % PV / +1,2 % dégâts par niveau au-delà de 25. Bot fort : niveau 191 → 105, horde 130–360 en étapes 2–3, dégâts subis ×2 (surtout aux boss) |
| T3 | Méta épuisée en une run (+6 000 à 15 000 crédits par victoire) | S | **fait** (1.9.1) — crédits sous-linéaires (4·√kills, niveau plafonné à 60) ; paliers de quêtes de kills recalés (3 k → 600 k) |
| T4 | Disque évolué qui couvre l'écran | S | **fait** (1.9.1) — taille visuelle plafonnée |
| T5 | Or qui s'accumule en étape 3 | S | **fait** (1.9.1) — dîme sans limite (prix ×1,8) |
| — | Mineurs : quêtes qui poussent les boutons de fin sous le pli (3 max + « et N autres »), « 1 fois » (texte dédié), autel à confirmer (2e appui) | S | **fait** (1.9.1) |

### Réévaluation n° 4 (2026-10-04, build 1.9.1) — verdict : 2 écarts + 2 bugs

5 runs complètes du bot fort (ordinateur et téléphone, FR, ~150 min simulées). Tiennent : horde dense, courbe de niveau
(34 à 5 min, ~100 en fin), un build moyen peut mourir, contenu, quêtes, récap, traduction, téléphone.

| # | Écart | Effort | État |
|---|---|---|---|
| U1 | La Prolongation ne menace jamais (15 min sans perdre un PV) | S/M | **fait** (1.9.2) — en Prolongation : PV ennemis ×1,25 et dégâts ×1,2 par minute sans plafond, pression sans plafond, nuée qui se referme (moitié des apparitions à 14–20 m), débit jusqu'à 70/s, une élite toutes les 30 s et un Gardien toutes les 2 min ; chrono « ∞ m:ss » de survie. Bot fort : mort après 8:35 de Prolongation |
| U2 | Calibrage des boss gonflé par la salve d'ouverture (boss 1 : 105–147 s au lieu de 60) | S | **fait** (1.9.2) — recalage chaque seconde sur une moyenne glissante, dans les deux sens, ±15 %/s ; test de l'évaluateur : 60 s avec ou sans salve (avant : 171 / 371 s) ; bot fort : 61 / 74 s |
| B1 | Un coffre pouvait s'ouvrir deux fois (double appui avant la frame suivante) | S | **fait** (1.9.2) — une action par cible |
| B2 | Exception en appuyant sur E juste après « Prolongation ∞ » (portail supprimé) | S | **fait** (1.9.2) |
| — | Mineurs : boss collé à l'objectif sur le côté (translucide aussi désormais), PV « 209/208 » (corrigé) ; toast du site sur le récap, boutique pleine après ~1,5 victoire : laissés | S | partiel |

### Réévaluation n° 5 (2026-10-04, build 1.9.2) — **VERDICT : plus d'écart de qualité atteignable**

3 runs complètes du bot fort (ordinateur EN Nova + Prolongation, téléphone FR Blitz, ordinateur FR Hex + Prolongation),
repro des bugs et du calibrage. Tiennent : Prolongation mortelle (6:35 et 7:07), boss 42–89 s (test isolé : 60,0 s avec ou
sans salve), coffres et Prolongation sans bug, horde dense, 437 clés de texte dans les 6 langues. À parité ou mieux :
jus, mouvement, horde, boss, contenu, économie, choix de niveau, méta ; mieux que Megabonk : récap par source, 6 langues,
tactile, manette. **Boucle terminée.** Restent hors de portée sans humains : modèles riggés et animés, cartes faites main,
bande-son composée, humour/voix ; et le volume brut de Megabonk (21 persos, 31 armes, 85 objets), extensible en code mais
écart de quantité, pas de qualité.

Mineurs traités dans 1.9.3 : un build faible ne voit plus la barre du boss fondre sans raison (PV jamais sous la base) ;
l'écran de fin après une mort en Prolongation titre « Victoire · fin de la Prolongation » ; salves d'élite un peu moins fortes (1re cause de mort du bot débutant). Mineurs laissés (équilibrage ou
préférence) : étape 3 sans danger pour un build très fort (comme Megabonk, la Prolongation sanctionne), Prolongation un peu
longue (6–7 min), répartition des dégâts objets/armes, grille d'objets sur téléphone, toast du site sur le récap.

## Synth Horde — visuels (demande du 2026-10-04 : effets, animation procédurale, puis personnages non génériques)

| Lot | Contenu | État |
|---|---|---|
| V1 — effets | Traînées en ruban (joueur rapide, missiles, disques, ruée des chargeurs), particules à cœur chaud, marques au sol (brûlures d'explosion, d'éruption et de mort de boss, flaques toxiques et braises lumineuses), ondes de choc en pool (élites, évolutions, boss, niveaux, tremplins, bouches de lave), halo lumineux (bloom) sur ordinateur seulement, réglable en pause. Un appel de dessin par système ; téléphone mesuré sans surcoût | **fait** (1.10.0) |
| V2 — animation procédurale | Joueur : ressort d'écrasement/étirement, inclinaison avec la vitesse et dans les virages, sursaut quand il est touché. Ennemis : apparition qui jaillit, démarche, écrasement à l'impact, ruée penchée. Boss : respiration et télégraphie avant chaque attaque | **fait** (1.11.0) |
| V3 — personnages | Direction « Living Sound » (aperçu validé le 2026-10-05) : **9 héros** sur un squelette commun, chacun avec sa tête (moniteur-oscilloscope, cassette, tube électronique, caisson, mégaphone, vinyle-planète, casque de DJ, micro doré, bouton de synthé) et ses couleurs ; 7 clips (attente, course calée sur la vitesse, saut, glissade, coup, mort, victoire), écharpe à ressort. **10 familles d'ennemis** en matériel audio (Static, Clipper, Subwoofer, Gramophone, Needle, Cassette, Tube, Métronome, Égaliseur, Ampli) qui regardent le joueur ; leurs pièces sont animées dans le shader (une InstancedMesh par type, comme avant ; états lisibles : visée et ruée du Needle, mèche du Tube, téléportation imminente du Métronome, soin de l'Égaliseur, salve de l'Ampli, tir du Gramophone). **3 boss** : boombox (Sentinelle), ampli en fusion à trois pavillons (Hydre), orgue-synthé (Archonte). Pas de VAT : pièces rigides + skinning du seul héros. Silhouette « rayons X » du héros derrière les obstacles. Modèles : `tools/cast/build.py` (Blender headless) → `js/bonk-cast-data.js` (270 Ko, sans fichier .glb) | **fait** (1.12.0) |
| V4 — le monde bat la mesure | Pulsation tirée des temps réellement joués par le séquenceur (horloge virtuelle à 108 bpm si la musique est coupée) : lignes du sol, barrière, membranes et diodes des ennemis, onde du visage de Glitch, anneau du joueur ; **les attaques des boss partent sur un temps** (0,6 s de retard au plus) | **fait** (1.12.0) |
| V5 — arènes | Piliers en colonnes d'enceintes (membranes dessinées par le shader, qui pulsent), blocs en caisses de scène (grille, bande de diodes), et sur ordinateur 52 tours d'enceintes derrière la barrière, aux couleurs de l'étape, qui cognent sur la musique (un appel de dessin ; retirées sur téléphone : leur surface coûtait ~20 ms en rendu logiciel) | **fait** (1.12.0) |
| V6 — objets | XP en notes de musique, or en disques d'or, cœurs, flight-cases à casser, coffres en flight-cases de tournée, mines en pédales d'effet, arme disque en vinyle | **fait** (1.12.0) |
| V7 — interface et sons | Portraits des 9 héros rendus depuis leurs modèles dans le menu (verrouillé = silhouette) ; un son de mort par famille (coup de basse, grésillement, zap, klaxon, scratch, bande rembobinée, tic, accord, ampli qui s'éteint) | **fait** (1.12.0) |
| V8 — boutique | Icône (tête de Glitch), visuel Play, écran de démarrage, capsules Steam et captures Play/iOS/Steam régénérés depuis les vrais modèles (`tools/cast/poster.mjs` → `apps/synth-horde/assets/cast/`) | **fait** (1.12.0) |

Coût mesuré (téléphone simulé, rendu logiciel, 200 ennemis de toutes familles) : ~49 → ~60 ms par image, soit +20 % dans ce
cas pessimiste où les sommets sont calculés par le processeur. Sur un vrai GPU de téléphone, ~50 000 triangles de plus
devraient peser bien moins — **non mesuré sur appareil** : à vérifier lors des tests fermés. La résolution dynamique reste active. Équilibrage inchangé (bot naïf : médiane 6:14).
Corrigé au passage : un sanctuaire voisin volait l'invite du portail (le boss mort près d'un marchand ouvrait la boutique
au lieu du portail) ; les captures PC de la boutique Steam montraient l'écran de pause (fenêtre headless sans focus).

## Block Quarry vs Block Blast! (analyse du 2026-10-05) → 1.4.0

Rival direct : **Block Blast!** (Hungry Studio) — même format (8×8, trois pièces, pas de rotation), n° 1 mondial des
téléchargements mobiles début 2026. Woodoku sert de référence pour le calendrier quotidien. Rapport complet de l'agent :
grille de scores, combo à 3 poses de grâce, génération pondérée par le remplissage, jus visuel, modes, monétisation
(quasi tout en pub), critiques (pub, « pièces truquées »). **Avance de Block Quarry à mettre en avant** : tirages
toujours jouables, reprise garantie, pubs plafonnées et facultatives, niveaux calibrés par solveur, vrai mode Chrono.

| # | Écart / bug | Impact | État |
|---|---|---|---|
| B1 | ↻ pendant le défi du jour lançait une partie classique et **effaçait la sauvegarde classique** | haut | ✅ 1.4.0 — ↻ relance le défi |
| B2/B3 | Badge de série invisible sur ordinateur (dessiné hors du canevas) ; « Combo » et « Série » pour le même compteur | moyen | ✅ jauge « COMBO ×n » dans un bandeau réservé, un seul terme |
| B4 | Boosters (dont le mélange) permis dans le défi « identique pour tous » | moyen | ✅ interdits dans le défi |
| B5 | La série du défi avançait à l'ouverture, pas au jeu | moyen | ✅ elle avance au premier coup du jour |
| B6 | MEILLEUR dépassait le SCORE qui défile | bas | ✅ |
| B7 | « Nouvelles pièces ! » superposé à l'éloge du même coup | bas | ✅ affiché après |
| B9 | « TABLE RASE ! +300 » à côté d'un total qui inclut déjà les 300 | bas | ✅ |
| B10 | Au doigt, marteau et bombe frappaient au premier toucher, sans visée | bas | ✅ premier toucher = visée, second = frappe |
| G1 | Combo remis à zéro dès une pose sans ligne (le genre laisse 3 poses) | haut | ✅ grâce de 3 poses, 3 crans qui se vident, astuce unique au premier combo |
| G2 | Effacements sans « moment » | haut | ✅ faisceau par ligne, arrêt sur image dès 2 lignes, lueur du cadre (2), onde (3), éclair (4+, combo 5+), « +N » qui rejoint le score (qui rebondit), éclats de roche |
| G3 | Aspect générique | haut | ✅ direction « Carrière » : minéraux taillés (biseau, veines), dalle d'ardoise à alvéoles gravées dans un cadre de grès boulonné, strates et poussière en fond, Bungee + Big Shoulders Display (OFL, embarquées), icônes dessinées (masse, dynamite, mélange, pièce) ; l'ancien thème reste « Classique » |
| G4 | Pas de chasse au record en cours de partie | haut | ✅ barre vers le record, « NOUVEAU RECORD ! » + fanfare + confettis une fois, couronne ensuite |
| G5 | Fin de partie sèche | haut | ✅ pièces qui tremblent et se barrent, grille qui s'éteint rangée par rangée, puis score qui défile, statistiques (lignes, meilleur combo, pièces) et « plus que N pour le record » |
| G6 | Bips d'un oscillateur | moyen-haut | ✅ banque procédurale : « toc » de pierre, éboulement filtré, accord pentatonique qui monte avec le combo, cloche des gemmes, fanfare |
| G10 | Prise en main sèche | moyen | ✅ agrandissement de 90 ms, ombre portée, aperçu pointillé, contour rouge si ça ne rentre pas, petit son à chaque case |
| G11 | Place perdue sur mobile, grille collée au bord | moyen | ✅ mise en page recalculée (bandeau + cadre + grille + plateau), marges de 12 px, pièces du plateau à 0,8 case |
| G7 | Aventure courte (40 niveaux), deux objectifs | moyen-haut | à faire — génération ouverte, couleurs à collecter, glace, caisses, chapitres de 10 |
| G8 | Défi du jour sans objectif ni calendrier ni partage ; et il ne finissait jamais (bienveillance des tirages permanente : un glouton atteignait 400 coups) | moyen | ✅ 1.5.0 — bienveillance qui s'estompe après 150 pièces comme en classique ; objectifs ★ 500 / ★★ 1 500 / ★★★ 3 000 (glouton sur 30 graines : médiane 1 360, p90 3 029), barre vers l'étoile suivante, calendrier du mois, trophée à 20 jours étoilés, partage (feuille du système ou presse-papiers) |
| G9 | Scores petits (≈ 700) | moyen | à faire — ×10 avec migration des records |
| G13–G16 | Événement hebdomadaire, thèmes en plus, Chrono plus lisible, monétisation | bas | à faire |

## Nova Foundry vs Cookie Clicker (analyse du 2026-10-05) → 1.4.0

Rival direct : **Cookie Clicker** (v2.052), dont Nova Foundry reprend la boucle (objet central, générateurs ×1,15,
paliers 1/5/25/50/100, comètes = cookies dorés, Novae = puces célestes). Références secondaires : Antimatter Dimensions
(couches de prestige), Egg, Inc. (recherche permanente comme puits).

**Bug signalé par le propriétaire — l'Automate** : ses clics ne passaient pas par le code du clic (`S.lifeClicks`,
objectif du jour, succès de clics, effets) et son revenu n'apparaissait ni dans le « /s » ni dans les gains hors ligne.
✅ 1.4.0 : un vrai `autoClick()` (compté partout, critiques possibles avec le Bras bionique), revenu inclus dans le « /s »
et hors ligne.

**Progression (retour du propriétaire : « tout acheté dès la 2e partie, tout à la 3e »)** — mesuré par bot
(3 clics/s, 70 % des comètes, achats au meilleur rendement, Supernova toutes les 30 min) :

| | Avant (1.3.0) | Après (1.4.0) |
|---|---|---|
| Courbe des Novae | √(total ÷ 2e5) | racine cubique du total cumulé jusqu'à 1e11, racine 5e au-delà |
| Bonus par Nova | +5 % (+8 %), plafond doux 500 | +5 % (+6/+7 %), plafond doux 100 |
| Constellation | 14 nœuds, 1 109 Novae, finie à la 2e Supernova | 34 nœuds (coûts 1 → 500 000), 2 forges débloquées par la méta, Maîtrise stellaire répétable |
| Améliorations achetées après 2 min, partie 2 / 3 / 4 | 66 / 76+ / tout | voir les mesures dans BACKLOG |

Écarts restants (classés) : arbre de 80–120 nœuds avec choix exclusifs, contenu de partie (forges 13–15, synergies,
paliers jusqu'à 500), 150+ succès qui nourrissent un multiplicateur, événements (Dark comet, Forge Surge, codex),
jus (cinématique de Supernova, chiffres qui roulent, ETA), couche quotidienne (Stardrops, mini-jeu), Big Bang qui
débloque des systèmes, saisons, défis à paliers.

## Synth Horde — retour de partie du propriétaire (2026-10-05) → 1.13.0

| Retour | Correction |
|---|---|
| Méta trop rapide (presque tout acheté en une run) | Améliorations ×2 et doublées à chaque niveau, crédits des runs −40 %, crédits des quêtes ÷2 : une run gagnante ≈ 2 300 crédits pour 16 100 au total (~14 %) |
| Perché sur un pilier, intouchable | Les ennemis escaladent le perchoir du joueur (≈ 3 s pour le plus haut, collés à la paroi), les volants montent à sa hauteur dans toutes les étapes |
| Seuls les sanctuaires verts marchaient | Régression de 1.12.0 (garde du portail vraie quand il n'y a pas de portail) ; test ajouté au smoke pour chaque sanctuaire |
| Rectangles noirs qui clignotent | Un pixel NaN étalé par le flou du halo : normales et reflets protégés dans tous les shaders, et passe de nettoyage avant le halo |
| Étapes 1–2 trop faciles, 3e trop dure | Dégâts ×1,35 / ×1,3 et foule ×1,25 / ×1,2 aux étapes 1–2, montée des dégâts plus rapide, étape 3 ×0,9 et volants plus proches (12 m) ; la régénération attend 2,5 s sans coup. Bot fort : en danger dès la 2e minute ; bot naïf : médiane 5:59 (6:14 avant) |
| Emplacements et synergies peu clairs | Rangées « ARMES n/4 » et « TOMES n/4 » avec cases vides numérotées, paires arme-tome surlignées ; sur les cartes : « ★ FAIT ÉVOLUER … », « RENFORCE n DE TES ARMES », « ÉVOLUE DANS n NIVEAUX », « EMPLACEMENT 3/4 », « DERNIER EMPLACEMENT ! » |
| Interface plus forte, pas générique | Direction « flyer » (référence Persona 5) choisie parmi trois pistes : dalles noires inclinées, ombres dures rose/cyan, cartes-affiches, titre en lettres découpées, plaque du héros avec portrait 3D ; Dela Gothic One + Barlow Condensed (+ Anton, Rubik Mono One), embarquées (OFL, `fonts/LICENSES.md`) |

## Fait

- **Itération E21** (2026-09-28, évaluation n° 7 : verdict « non ») — notifications retenues aussi pendant les choix de
  niveau de Synth Horde (elles couvraient les cartes).
- **Itération E20** (2026-09-28, évaluation n° 6 : verdict « oui » pour Synth Horde) — Synth Horde 1.3.0 : **fusion des gemmes
  près de l'action** — au-delà de 850 objets au sol, l'XP d'un ennemi s'ajoutait à une gemme quelconque (souvent à 90 m) :
  niveau bloqué ~8 min puis 36 choix d'affilée ; désormais gemme voisine (6 m), sinon la plus lointaine cède sa valeur à
  la nouvelle (XP conservée, plafond tenu) ; notifications du site retenues pendant une run (elles couvraient le chrono
  et l'alerte SAUTE !) puis affichées ; conversion or → crédits affichée sur l'écran de fin.
- **Itération E19** (2026-09-28, évaluation n° 6 : verdict « non » pour Nova Foundry, restes mineurs) — notifications du
  site en haut seulement dans Block Quarry (en haut, elles couvraient le compteur de Nova Foundry) ; succès du Moteur
  stellaire aux niveaux 3 et 6 (le niveau 10 était hors d'atteinte) ; indication « prochaine Nova » précise à 4 % près ;
  « Téméraire » au lieu de « Défieur ».
- **Itération E18** (2026-09-28, évaluation n° 6 : verdict « non » pour Block Quarry, restes mineurs) — minuterie de
  l'écran de résultat d'Aventure annulée au changement de mode ; reprise payante du défi du jour une fois **par jour** ;
  prix de reprise et compteur de pièces sauvegardés avec la partie classique ; roue des réglages hors du grisage des
  boosters ; notifications en haut de l'écran (elles couvraient les boosters) ; libellé français raccourci.
- **Itération E17** (2026-09-28, évaluation n° 5) — Block Quarry 1.3.0 : **courbe d'Aventure lissée** — pierres dures
  présentées une à une (1, 2, 3 aux niveaux 9–11, +4 coups, 2 tirages de secours dès le niveau 9 : le mur des niveaux
  9–11 disparaît) et niveaux « lignes » resserrés de 20 % dès le niveau 16 (bot : 37/40, plus de ★3 faciles) ; **records
  qui ne s'achètent plus** — « Continuer » coûte au moins la bombe (30 → 60 → 120 🪙 dans la même partie) et une seule
  fois par défi du jour ; en classique, le tirage bienveillant s'estompe après 150 pièces ; vidéo « dégager et continuer »
  aussi quand on est bloqué en Aventure avec des coups restants ; minuterie de fin de partie annulée au changement de
  mode (elle pouvait terminer un niveau tout juste lancé) ; pierres dures intactes « rivetées », fissurées seulement
  après le premier effacement ; boosters grisés à la limite de l'Aventure ; allemand « Fortsetzen » / « Erneut
  versuchen » ; bonus du jour en toast au premier lancement (plus par-dessus le tutoriel). Test de fumée : remplissage
  de la grille déterministe pour le test de la bombe.
- **Itération E16** (2026-09-28, évaluation n° 5) — Synth Horde 1.2.0 : **accalmie après chaque boss** (l'onde de la victoire
  dégage 22 m autour du joueur, balles effacées, apparitions ÷8 et plus de vagues jusqu'au portail — le bot mourait dans la
  foule entre le boss et le portail) ; **build complet** : trois bonus de caractéristiques distincts au lieu de
  « Soin | Bourse | Soin » (un soin seulement sous 40 % de PV) ; or : portail 1 or pour 10 XP (au lieu de 4), et l'or
  restant rapporte des crédits en fin de run (1 ◈ pour 40 or) ; cause de la mort = plus grosse source de dégâts des
  8 dernières secondes ; noms longs de la boutique sur deux lignes, annonces bornées en largeur en paysage.
  Bot 20 runs : médiane 7:51.
- **Itération E15** (2026-09-28, évaluation n° 5) — Nova Foundry 1.3.0 : **les défis deviennent une vraie couche** — Novae,
  Singularités et Moteur stellaire ne comptent plus en défi (comme l'annonçait déjà la confirmation), départ avec le Pack
  de démarrage (fin du départ mort de « Mains libres », 18 min sans production), objectifs de « Pénombre » (2e6) et
  « Contre la montre » (5e6 en 15 min) recalés : 6 à 46 min par défi au lieu de 0,6 à 10 ; chrono des défis aussi au
  retour sur l'onglet ; indication « prochaine Nova à X produits (n %) » ; objectif du jour +2 % des Novae (au moins 1) ;
  succès de fin de partie (Big Bang ×5/×20, Moteur stellaire 5/10, les 6 défis) ; nœuds de Constellation achetés
  cochés ; repères sur les tuiles achetées, doigts numérotés 1–5 comme leur nom ; notation scientifique et suffixes
  dans la langue, espace insécable avant l'unité ; « sur cet appareil » dans l'application.
- **Itération E11** (2026-09-28, évaluation n° 4, sous-agent) — Synth Horde 1.1.0 : annonces en haut (sous le chrono / la barre
  du boss), plus jamais sous l'invite du coffre ; pause en deux colonnes en paysage, Reprendre/Abandonner toujours
  visibles, écran de fin qui tient en 740×360 ; joueur toujours lisible (silhouette par-dessus tout, anneau au sol),
  onde de choc en anneau discret, œil du boss adouci ; balles ennemies distinctes (cœur blanc, halo orange, traînée),
  8 balles de tireurs ordinaires au plus, tireurs introduits progressivement de 4 à 6 min 30 ; bouton Boutique ◈ en haut
  du menu, personnages en 3 colonnes au-dessus du bouton Lancer ; chiffres de dégâts hors de la bande du HUD et sans
  chevauchement ; portail limité à 2 montées de niveau (le reste en or) ; « vitesse des projectiles / d'orbite » ;
  « ⭐ fait évoluer X » seulement si X est possédée ; verrou de 0,4 s sur les cartes, level-up différé de 1,5 s après une
  résurrection ; invite de charge du sanctuaire ; cause de la mort et « nouveau record » en fin de run ; radar 100 px en
  paysage ; perf mobile (antialias coupé, résolution dynamique 0,75–1, 800 particules, 250 ennemis, matériau d'anneau
  partagé, radar à 15 Hz) ; **Chaleur 1–5** après la première victoire (+25 % PV, +15 % dégâts, +12 % apparitions,
  +25 % crédits par cran ; record par personnage). Équilibrage 40 runs : médiane 7:10 → 7:13, balles des tireurs
  50 % → 42 % des dégâts subis. Test de fumée : contrôles paysage 844×390.
- **Itération E14** (2026-09-28) — Nova Foundry 1.2.0 : carte « Bon retour » après plus de 5 min d'absence (durée, gains,
  bouton vidéo pour les doubler, rappel du nœud Veille nocturne tant qu'il manque) au lieu d'un toast vite évincé ;
  tuiles d'amélioration numérotées (I–VIII), deux tuiles de la même forge ne se confondent plus ; les éclipses ne
  dépendent plus de la chance (les télescopes les rendaient plus fréquentes). Suffixes M/G/T gardés (communs aux jeux idle).
- **Itération E13** (2026-09-28, évaluation n° 4) — Nova Foundry 1.1.0 : **panneau du bas qui ne défilait pas sur téléphone**
  (bloquant : forges hautes, défis 4–6, bas de la Constellation et tout le Big Bang hors d'atteinte ; colonne sans
  `min-height:0`) — test de non-régression dans `tools/smoke.mjs` ; **fin de partie qui s'emballait** (Novae ↔ Singularités
  s'entretenant, débordement vers 1e197 en 3 h 30) : plafonds doux (effet des Novae au-delà de 500, des Singularités au-delà
  de 10, gain de Novae au-delà de 200 par Supernova, Singularités au-delà de 4 par Big Bang) et **Moteur stellaire**, puits
  de Singularités sans fin (×1,25 par niveau, coût doublé) — `tools/sf-long.mjs` : 1re Supernova 11 min, 1er Big Bang
  2 h 13 comme avant, puis 8 Big Bangs en 12 h qui s'espacent, sans débordement ; aperçu « après ce Big Bang » et conseil de
  finir la Constellation ; succès Big Bang nommé ; décimales dans la langue (1,74 M) ; « ×2 à 25 » au lieu de « palier 25 » ;
  allemand cohérent avec les onglets (Proben, Upgrades) ; retour sur l'onglet : gains hors-ligne annoncés et doublables ;
  captures du test de fumée qui réessaient sous forte charge.
- **Itération E12** (2026-09-27) — Block Quarry 1.2.0 : **pierres dures** en Aventure dès le niveau 9 (sombres, fissurées ;
  la première ligne effacée les fissure, la seconde les brise ; les boosters les fissurent seulement ; 15 → 45 % des
  pierres selon le niveau, coups ajustés ; présentées au niveau 9 ; bot : 37/40) ; **bonus de connexion** quotidien
  10 → 40 🪙 selon la série de jours ; **série de combos** visible au-dessus de la grille (badge qui grossit, étincelles en plus).
- **Itération E10** (2026-09-27, évaluation n° 4) — Block Quarry 1.1.0 : **reprises payantes garanties** — « +3 coups »
  (pièces ou vidéo) redonne des pièces qui rentrent quand la grille est bloquée (la partie restait figée) ; « Continuer »
  (15 🪙 ou vidéo) dégage la zone 3×3 la plus pleine et donne trois pièces qui rentrent, au lieu d'un marteau à viser qui
  aidait rarement ; **tirage équitable** : les trois pièces doivent pouvoir être posées dans un ordre au moins, grosses
  pièces écartées quand la grille est chargée, et une pièce qui complète une ligne au-delà de 40 % de remplissage
  (bot glouton, 80 parties : médiane 17 → 41 coups, parties de ≤ 20 coups 52 → 18) ; Aventure qui se resserre après le
  niveau 16 (coups −1,2 %/niveau, bandes de pierres en plus aux niveaux 25 et 35 ; bot : 36/40 réussis, moins de ★3),
  2 boosters max par tentative ; coups réellement joués et « +10 🪙 » affichés en fin de niveau ; solde de pièces dans
  la boutique de thèmes ; marteau désarmé en ouvrant la carte, plus de viseur fantôme au doigt ; pièces du plateau
  plus grandes sur téléphone ; « Modes de jeu » comme titre de la carte ; allemand « Linien » au lieu de « Reihen ».
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
- **Itération E3** (2026-09-25, retours d'évaluation) — Neon Bonk : caméra qui se rapproche devant un obstacle (8,5 → 2,2 au pied d'un bloc, recul doux) ; chiffres de dégâts regroupés par ennemi, option « regroupés / critiques / aucun » dans la pause ; mobile : bouton pause ❚❚, bouton GLISSE séparé de E, level-up compact (3 cartes + Relancer visibles sur iPhone, sans raccourcis clavier), message déplacé, boutique non masquée par « Lancer » ; écran de fin avec « Rejouer » ; noms des armes et tomes au survol du HUD, indice d'évolution en clair dans la pause.
- **Itération E4** (2026-09-25, retours d'évaluation) — Transverse : accueil (1er passage, puis « PLAYTOON » dans la nav — la barre garde ses trois onglets) qui présente les trois jeux ; objectifs du jour, un par jeu, tirés de la date, avec récompense dans le jeu (+30 pièces, +1 Nova, +40 crédits), suivis par `ptEvent` et visibles dans l'accueil et le profil ; menu son unique à deux réglages (effets, musique) respecté par les trois jeux ; zoom réautorisé ; textes secondaires plus contrastés. Test : le script de fumée n'attendait pas `addInitScript` (course à l'ouverture des pages), corrigé.
- **Itération 18** (2026-09-25) — Star Forge : événements — météore violet rare (8 % des passages × Chance) qui donne ×77 pendant 7 s ; éclipse toutes les 8 à 16 min (plus souvent avec la Chance) : production ×2 mais clics nuls pendant 45 s, étoile assombrie ; bandeau des effets en cours avec leur durée ; au plus 3 notifications à la fois.
- **Itération 19** (2026-09-25) — Neon Bonk : 3e étape « Le Vide » après la Fournaise — gravité divisée par deux, relief doux, palette nuit violette, 11 grappes de plateformes flottantes en escalier (on tient dessus, on passe dessous, coffre au sommet), drones qui montent chercher le joueur ; boss final « Archonte du Vide » (×4 PV, 5 attaques dont un puits de gravité qui attire le joueur) ; musique en sol mineur à 100 BPM ; personnage Orbite (laser, +1 saut) débloqué par l'Hydre ; correctif : les personnages débloqués par un boss en cours de run s'affichent à l'écran de fin.
- **Itération E5** (2026-09-25, évaluation n° 2) — Neon Bonk : fin des rafales de montées de niveau — XP des ennemis plafonnée en fin de run, courbe plus raide après le niveau 25, XP du boss (~3 niveaux) semée en anneau (1 fenêtre au lieu de 8 après la Sentinelle ; 4–5 fenêtres par minute dans le Vide au niveau 33 au lieu de ~17) ; option « choix automatique » dans la pause ; foule plafonnée (300, apparitions ≤ 22/s) ; plateformes flottantes entre la caméra et le joueur réduites à leurs arêtes ; anneaux de l'Archonte adoucis ; mobile : barre du boss sous les icônes, aide tactile au menu ; desktop : ❚❚ sous le radar ; « NIV · ÉTAPE » lisible.
- **Itération E6** (2026-09-25, évaluation n° 2) — Star Forge : prix sous chaque amélioration (doré si abordable), bouton « Tout acheter (n) » (les moins chères d'abord) ; notifications en bas de l'écran sur mobile et sous le bandeau d'effets sur desktop ; étoile plus grande et orbites resserrées quand le cadre est bas, description de la Supernova masquée sur mobile ; Novae formatées.
- **Itération E7** (2026-09-25, évaluation n° 2) — Bloc Party : bouton « 🗺️ Modes » sur l'écran de fin (fermer la carte y ramène, « Partie classique » relance) ; « +3 coups · 🪙 25 » une fois par tentative quand l'Aventure échoue faute de coups ; « RECORD » masqué tant qu'il n'y en a pas ; 🎯 au lieu de 📅 (qui affichait une date anglaise) ; messages du plateau jamais plus larges que la grille.
- **Itération E8** (2026-09-25, évaluation n° 2) — Transverse : 🏠 dans la nav mobile (accueil et objectifs du jour toujours accessibles, la barre garde ses trois onglets et tient à 360 px) ; bouton « Jouer » de l'accueil collé en bas de la carte, visible sans défiler.
- **Itération E9** (2026-09-25, évaluation n° 3) — Neon Bonk : **joystick mobile** qui ne répondait pas quand le pouce se posait sur son cercle (le navigateur annulait le geste : `touch-action` sur toute la zone de jeu, cercle transparent aux touchers ; 0,8 → 15 unités parcourues, test de non-régression par vrais événements tactiles) ; piste de fond sous la barre du boss, annonces décalées sous elle ; listes de la pause au même style. Bloc Party : « presque » seulement s'il manquait peu, pas de record Chrono à 0 point, thèmes en deux colonnes sur mobile. Star Forge : bandeau Supernova réduit à une ligne quand il n'y a rien à gagner, « Nova / Novae » accordé, onglets qui tiennent sur mobile.
- **Mobile M1** (2026-09-25) — Bloc Party devient **Block Quarry** (nom libre ; « Block Party » est pris sur Google Play) : anglais par défaut + fr/es/de/it/pt, langue détectée ; application Android Capacitor 8 (`apps/block-quarry`, targetSdk 36) avec monétisation équitable (vidéos facultatives, pub plein écran plafonnée entre les parties, achat unique « Supprimer les pubs », consentement UMP) ; CI qui construit APK + AAB signé et lance l'APK dans un émulateur (démarrage, AdMob, consentement vérifiés) ; kit Google Play (fiche EN/FR, captures, politique de confidentialité, sécurité des données, guide `apps/block-quarry/store/PUBLISHING.md`). **Reste côté propriétaire** : compte Play Console (25 $), AdMob, secrets de signature, test fermé 12 testeurs × 14 jours.

## À surveiller

- *(résolu à l'itération 11)* gel intermittent : c'était la taille non bornée des particules. Le chien de garde reste dans `tools/smoke.mjs` et `tools/nb-balance.mjs`.
