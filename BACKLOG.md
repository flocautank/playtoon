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

*Évaluation n° 4 (un sous-agent joueur par jeu, web + appli Android, 2026-09-27).*

- **Block Quarry — reste à faire** (après E12) : coffres d'étoiles sur la carte ; objectifs de couleur ; défi du jour à un seul essai compté (choix de design, à trancher).
- **Nova Foundry — reste à faire** (après E14) : *(rien de signalé ; à revoir à l'évaluation n° 5)*
- **Synth Horde — reste à faire** (après E11) : révélation du contenu des coffres (carte animée) ; runs plus courtes / sauvegarde en cours de run pour le mobile (choix de design) ; réglage qualité manuel.

*Évaluation n° 3 (sous-agent joueur, 2026-09-25, desktop + iPhone 13) — un bloquant (joystick mobile), le reste en finitions ; corrections des évaluations 1 et 2 confirmées. Verdict : une fois le joystick corrigé, plus rien qui vaille une itération → fin de la boucle.*

*(vide)*

*Feuille de route (après les retours d'évaluation).*

*(vide)*

## Fait

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
