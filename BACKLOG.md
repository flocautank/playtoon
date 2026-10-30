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
- ~~Nova Foundry : puits de Novae après la Constellation pour les joueurs de plus de 10 h~~ → fait en 1.8.0 (Astérismes).

## Routine nocturne — journal

Consigne : `ROUTINE.md`. Ordre Block Quarry → Nova Foundry → Synth Horde ; axe suivant dans la rotation
bugs → contenu → durée de vie → identité graphique → enrichissement. Première nuit : axe « bugs » pour les trois jeux.

- 2026-10-18 · tous · — · — · routine mise en place ; textes de Block Quarry sortis du socle commun (`fa52203`), applis vérifiées indépendantes.
- 2026-10-18 · Block Quarry · bugs · 1.7.1 · 38 parties automatisées (classique, aventure niv. 1–40, chrono, défi), geste tactile réel, persistance, six langues : un seul défaut, « Nur noch 0 bis zum Rekord » affiché sans record ; corrigé.
- 2026-10-18 · Nova Foundry · bugs · 1.7.1 · économie jusqu'à 1e300 sans NaN, gain hors-ligne et retour d'arrière-plan corrects ; libellé de l'onglet actif tronqué sur mobile étroit (fr/es/it) corrigé.
- 2026-10-18 · Block Quarry · contenu · 1.8.0 · Aventure 40 → 60 niveaux : chapitres 5–6 « Galerie gelée » et « Veine glaciaire » avec un nouvel objectif, le **givre** (plaques de glace sous les pièces, brisées par une ligne effacée qui les traverse ou par marteau/bombe), carte en 6 chapitres avec étoiles par chapitre ; solveur `bp-levels` : 19–20/20 sur les niveaux 41–60 ; au passage, les ★ de la carte et des résultats n'étaient plus affichées (filtre des emoji) — corrigé.
- 2026-10-18 · Nova Foundry · contenu · 1.8.0 · Astérismes, le puits de Novae d'après la Constellation (point ouvert du backlog) : 8 figures de 10 étoiles (Creuset, Lyre, Sextant, Balance, Marteau, Clepsydre, Phare, Couronne), chacune renforce un mécanisme précis (production, chance des comètes, évènements du ciel, gain de Novae, clics, durée des effets, hors-ligne, succès), coût ×1,8 par étoile (de 200 k à ~160 M Novae), survivent aux Supernovae et au Big Bang, inactives en défi ; 4 succès (98 au total) ; six langues ; `tools/sf-pace.mjs` trace aussi les Astérismes (option FULL) : 6 h depuis une Constellation complète et 1 M de Novae → 4,9 M de Novae avec, 4,1 M sans (10 étoiles), rythme d'avant la Constellation inchangé.
- 2026-10-18 · Synth Horde · bugs · 1.15.2 · 9 runs aléatoires + une run complète jusqu'à la victoire sans erreur ni NaN, six langues sans débordement ; l'annonce (« Survive… », boss) restait lisible par-dessus l'écran de niveau/pause (minuteur gelé) : masquée. Le test du joystick du smoke a échoué une fois sur trois (11,5 / 0), non reproduit ensuite : à surveiller.
- 2026-10-18 · Synth Horde · contenu · 1.16.0 · écart Megabonk « peu d'armes » (15 contre 31) : 3 armes à mécanique nouvelle, chacune avec son évolution et une quête de déblocage — Drop de basse (frappe annoncée sur le plus gros paquet → Séisme sub, réplique qui ralentit ; quête : 5 coffres dorés), Caisse claire (gerbe de plombs à courte portée → Roulement, double salve ; quête : niveau 20), Sillon (notes laissées au sol en courant → Sillon infini ; quête : 2 Gardiens) ; 6 icônes dessinées, textes en 6 langues, armes ajoutées au smoke. Corrigé au passage : sanctuaires posés à cheval sur une falaise (invite absente d'un côté) → sol plat exigé ; tremplins jamais dans un sanctuaire. Bot naïf : médiane 5:39, niveau 16,3 à 3:00 (référence du jour sans le lot : 4:28 et 5:18 ; première version des armes trop faible, 3:47/3:56 → Caisse claire et Drop renforcés).
- 2026-10-18 · Block Quarry · durée de vie · 1.9.0 · **Carnet du carrier** (bouton 🏅, pastille quand quelque chose est à récupérer) : grade de carrière sur 16 paliers nourri par tous les modes, 3 missions de la semaine (graine = lundi) + coffre, médailles de maîtrise par chapitre, statistiques ; 3 thèmes qui ne s'achètent pas, gagnés au grade ; ligne de grade et XP gagnée sur les écrans de fin ; joueurs existants : grade de départ calculé sur leurs étoiles, médailles déjà méritées versées ; la vidéo ne peut que doubler les pièces d'une mission remplie (rien sur Steam) ; au passage, « Récupère 5 » sans 💎 sur le canevas → « Récupère 5 gemmes » (6 langues).
- 2026-10-18 · Synth Horde · durée de vie · 1.17.0 · défi du jour : chaque jour la même carte (graine tirée de la date : relief, obstacles, coffres, sanctuaires, clés), un héros imposé (prêté s'il est verrouillé) et 2 modificateurs parmi 8 (Canon de verre, Marée, Ruée vers l'or, Tempo double, Fil du rasoir, Larsen, Colosses, Apesanteur) ; score (boss, survie, niveau, éliminations), record du jour, essais, série de jours consécutifs, 7 derniers jours, compte à rebours ; journée validée après 1:30 → prime de 120 à 300 crédits selon la série ; 7 quêtes (défis validés 1/7/30, série 3/7 → +1 bannir, score 5 000/25 000) ; carte dédiée au menu, score et record sur l'écran de fin, « DÉFI » au HUD ; 6 icônes dessinées, textes en 6 langues ; test au smoke (carte identique d'un essai à l'autre). Le générateur de carte a son propre tirage (three.js consomme Math.random pour ses uuid). Équilibrage des runs normales inchangé.
- 2026-10-18 · Block Quarry · identité graphique · 1.10.0 · captures de tous les écrans de l'appli jugées en directeur artistique (section « identité graphique, regard de directeur artistique ») ; **bloquant trouvé en chemin : depuis 1.6.0 le jeu ne démarrait plus dans l'appli** (Android, iOS, Steam — exception au chargement, grille vide), corrigé ; kit de boutique refait à l'identité Carrière (icône, démarrage, bannière Play, 11 visuels Steam, 36 captures Play/iPhone/Steam, titre en Bungee doré via les polices du jeu, barre d'état brune) ; Carnet : grade en écu de métal gravé, médailles de chapitre frappées (un motif par chapitre), repris sur la carte, les thèmes et les fins ; réglages et notifications de l'appli en pierre, roue dentée et globe dessinés ; effacement : la pierre se fend puis éclate en éclats qui tombent ; visée à la craie, paillettes d'or, croix à la craie, sons de ciseau et de raclement ; tutoriel centré. Reste : textes des fiches (40 niveaux, 5 thèmes).
- 2026-10-18 · tous · bugs (outillage) · — · **`tools/apps-smoke.mjs`** : le site seul était testé, si bien que Block Quarry 1.6.0 → 1.9.x ne démarrait plus dans l'appli sans que personne ne le voie. Le test construit les trois `www/` mobiles et les trois dossiers chargés par Electron, les ouvre en 420×860 tactile et en 1280×720 : zéro erreur console, jeu jouable (pièce posée / poussière au clic / run démarrée et joueur qui bouge), réglages et langue, pont natif absent toléré (pause pub, vidéos, boutique masquée), indépendance des `app.js`. Vérifié : il échoue bien sur `c364828` (Block Quarry 1.9.x, MutationObserver). Sur `main` : aucun défaut dans Nova Foundry ni Synth Horde. Branché en CI (job `apps-smoke` du workflow Android), obligatoire dans `ROUTINE.md`. Fiches Play et Steam de Block Quarry mises à jour (60 niveaux en 6 chapitres, givre, Carnet du carrier, 9 thèmes dont 3 gagnés au grade).
- 2026-10-18 · Synth Horde · identité graphique · 1.18.0 · revue de direction artistique sur captures de tous les écrans (mobile 420×860, PC 1280×720) : titre « lettres découpées » qui ne coupe plus ses mots sur téléphone ; HUD portrait sans chevauchement (minuteur en étiquette en haut à gauche, armes/tomes/or décalés, annonces et barre du boss en dessous — mesuré 360/390/420 px en en/fr/de) ; pause refaite en « fiche de tournée » (armes en dalles avec niveau en gros chiffres et piste vers l'évolution, tomes en tuiles, objets en jetons) ; écran de fin en affiche (verdict sur dalle inclinée avec portrait du héros, quatre gros chiffres) ; héros verrouillés en silhouette lisible ; sons propres aux armes de 1.16.0 (Drop de basse : sifflet descendant puis coup de sub ; Sillon : notes pentatoniques). Procédural, mécaniques et équilibrage inchangés, aucun surcoût GPU (CSS et WebAudio).
- 2026-10-18 · Block Quarry · enrichissement · 1.11.0 · partie en nouveau joueur sur l'appli construite (420×860 et 360×740 tactiles, 1280×720 souris) ; frictions : présentations du givre, des pierres dures, du combo et des outils affichées 1,2 s seulement (illisibles) et superposées quand deux tombaient ensemble ; pièce grisée sans explication ; cibles tactiles de 32 à 43 px ; vibrations et secousses/flashs impossibles à couper (pas de respect de « réduire les animations ») ; aucune touche sur PC ; « 1 pieces » en fin de partie ; libellés du HUD tronqués à 360 px (it, défi). **Fait** : les conseils passent sur une étiquette de pierre en haut de la grille, 3,5 à 4,5 s, à la file (givre puis pierres dures), qui s'efface sous la pièce en main ; conseil unique « grisée = pas de place » et rappel (son sourd) quand on prend une pièce qui ne rentre nulle part ; réglages **Confort** (roue dentée de l'appli, sous les thèmes sur le site) : vibrations (tactile seulement), animations réduites (par défaut le réglage du système : ni secousse, ni flash, ni onde, confettis réduits, pièces qui ne tremblent plus), « revoir les conseils » (tutoriel compris) ; toutes les cibles à 44 px, HUD resserré sous 390 px (aucun libellé tronqué, 6 langues × 4 modes × 360/390/420) ; Échap pose l'outil ou ferme la fenêtre ouverte (« Échap » annoncé sur PC) ; pluriels de la ligne de statistiques ; bandeau du bonus sur une ligne à 360 px. Score, tirages et monétisation inchangés.
- 2026-10-18 · Block Quarry · bugs · 1.11.1 · fuzz tactile/souris sur 24 parties (4 modes, niveaux 3–60, outils, redimensionnement 360/420), stockage corrompu (8 formes), rechargement, paysage : **en défi du jour, toucher un booster plantait** (`t` masqué dans le gestionnaire, aucun message) — corrigé ; le tutoriel recouvrait la ligne d'objectif en défi/aventure/chrono — texte limité au classique ; `blocparty.tips` à `null` ne plante plus. Ouvert : une partie d'Aventure, de défi ou de chrono n'est pas reprise après un rechargement (le classique l'est) — le hasard y est semé (`rnd`), reprendre exige d'enregistrer son état.
- 2026-10-18 · Nova Foundry · durée de vie · 1.9.0 · **Veille du jour** (onglet Succès, pastille quand il y a quelque chose à récupérer) : 3 objectifs tirés de la date parmi 7 (clics, forges, comètes, évènements du ciel, succès, Supernova, minutes de jeu), récompense en poussière (10 min de production, 150 minimum), coffre au troisième (30 min, 500 minimum), série de jours (+10 % par jour, jusqu'à +100 %) ; conservée par Supernova/Big Bang, récupération impossible en défi ; six langues ; rien d'autre n'est modifié (pas de Novae, pas de pub). Mesure : `sf-long` inchangé.
- 2026-10-18 · Synth Horde · enrichissement · 1.19.0 · réglages de confort dans la pause : **effets calmes** (ni gel d'image, ni coup de focale, ni éclat de dégâts, bord rouge sans pulsation ; par défaut le réglage système « réduire les animations »), **vibration** (téléphone seulement), **regard vertical inversé** (souris, doigt, manette) ; six langues ; mesuré en run : dégâts → gel 0,04 s sans le mode calme, 0 avec.
- 2026-10-18 · Nova Foundry · durée de vie · 1.10.0 · **`tools/sf-long.mjs` refait** (l'ancien ouvrait la page de Block Quarry, se bloquait sur les forges de la Constellation et simulait un Big Bang faux : 303 Novae en 24 h ; le nouveau joue 40 h avec les vraies fonctions — Supernova, Big Bang, défis, succès, Maîtrise, Astérismes, Galaxie — et mesure le temps entre deux nouveautés ; `sf-pace` sans ACH=1 sous-estime fortement le rythme). Mesure avant (1.8.0, graine 1) : tout est fini vers 17 h (8 astérismes tracés d'un coup à 15 h 30, les Novae passant de ~1 M à plusieurs G après les Big Bangs), **23 h sans aucune nouveauté de 17 h à 40 h**, creux de 90 min entre 3 et 10 h. Ajouts : **Commandes de la forge** (onglet après la 1re Supernova + bandeau sous les ressources) — trois objectifs taillés sur la partie (forge jusqu'au palier suivant, poussière à produire, battre le rythme de la partie d'avant, comètes, évènements du ciel, étoiles filantes, améliorations, clics, Supernova 2× plus grosse), chacune +2 % de la dernière Supernova en Novae et un sceau, changement gratuit toutes les 10 min (jamais contre une vidéo) ; **rang de compagnonnage** (Apprenti → Grand maître, puis numéroté, +3 % de production par rang, survit à tout) ; **Carnet de bord** (Supernovae marquantes, stades, défis, forges inédites, rangs, Big Bangs, astérismes, avec le temps de jeu) ; 4 succès (102) ; Astérismes ×4 par étoile au lieu de ×1,8 ; onglets en icônes entre 761 et 1100 px ; six langues. Après : ~9,5 commandes/h, 1er Big Bang 10 h (11 h 30 avant), astérismes étalés de 10 à 25 h (68/80 étoiles à 40 h), 20–40 h : 8 nouveautés (rangs toutes les ~3 h) au lieu de 0, fin sans rien 52 min au lieu de 1 380.
- 2026-10-18 · Block Quarry · bugs · 1.11.2 · chasse aux défauts des lots 1.8.0 → 1.11.1 (code relu, appli construite et site joués en 420×860 et 360×740 tactiles et 1280×720 souris, migration 1.7 → 1.11, six langues sur les nouveaux écrans à 360 px : rien ne déborde) ; **corrigés**, un test au smoke chacun : masse et dynamite sur un bloc posé sur le givre brisaient le bloc mais laissaient la plaque dessous ; horloge qui recule un lundi (voyage vers l'ouest, heure corrigée) : les missions de la semaine étaient retirées, progression effacée, puis encore au retour du lundi (missions déjà payées de nouveau ouvertes) → la semaine en cours est gardée si l'horloge recule de moins de deux semaines ; Chrono qui continuait de s'écouler sous les réglages de l'appli (roue dentée) ; fin de Chrono ou de niveau puis Modes → Classique dans la seconde : l'écran de fin revenait par-dessus la partie classique ; double toucher sur une vidéo récompensée : deux vidéos demandées, récompense versée deux fois (pièces) → une vidéo à la fois ; « animations réduites » ignoré par le CSS (minuteur du Chrono qui clignote, pastille du Carnet qui pulse, rebond du score, médailles) ; un second `show()` sans `hide()` lançait une deuxième boucle de dessin (Chrono ×2). Vérifiés sans défaut : migration (médailles versées une fois, pas de pièces en double, grade de départ), mission récupérée deux fois, pub absente ou refusée, givre sur la dernière case, fin de partie pendant l'éclatement. Trois points de conception notés dans « À surveiller ».
- 2026-10-18 · Synth Horde · enrichissement · 1.20.0 · confort et accessibilité, en complément des réglages de 1.19.0, joué sur téléphone (portrait, paysage) et PC (clavier, manette simulée) : **menus à la manette** (croix ou stick pour se déplacer dans l'accueil, les héros, le défi, la Chaleur, la boutique, les quêtes, la pause et ses réglages, la fin ; A valide, B revient ; gauche/droite règlent la sensibilité ; focus cyan ; il n'y avait que « A = lancer / reprendre ») ; **direction des coups** (chevron rouge autour du héros tourné vers la source, 0,9 s) ; « Effets calmes » de 1.19.0 étendus aux **flashs** (pops blancs des morts, éclats d'impact et du héros, halo et étincelles plafonnés), et deux réglages en pause : **Texte plus grand** (annonces, invites, chiffres de dégâts, cartes), **Sous-titres des dangers** (attaque de boss, éruption, kamikaze, ruée, avec une flèche vers la menace) ; cibles tactiles à 44 px (pause 48, segments, interrupteurs, Quêtes/Boutique/Défi/Relancer/Bannir/Passer) et bouton « Réglages » en haut de la pause sur téléphone ; corrigé au passage : en paysage, le doigt qui ouvrait la pause pouvait la refermer (le « click » relâché tombait sur Reprendre/Abandonner). 8 min en Graphismes bas : cadence stable. Équilibrage et mécaniques inchangés ; 6 langues ; test au smoke.
- 2026-10-19 · Block Quarry · contenu · 1.12.0 · Aventure 60 → 80 niveaux : chapitres 7–8 « Filons colorés » et « Cœur de la montagne » avec un quatrième objectif, le **filon de couleur** (dégager N blocs de la couleur désignée, lignes ou boosters ; la moitié des pièces tirées porte cette couleur ; pastille de couleur au HUD et sur la carte), mélangé au givre, aux gemmes et aux lignes ; deux médailles de chapitre (cuivre) ; six langues ; solveur `bp-levels` étendu à 80 niveaux (73 à 79/80 réussis par le glouton, échecs restants sur givre/lignes, pas sur les filons) ; test au smoke. Reste : caisses, génération ouverte.
- 2026-10-19 · Nova Foundry · identité graphique · 1.10.1 · revue des écrans en 420×860 et 1280×720 : la **Veille du jour** (ajoutée en 1.9.0) restait un panneau arrondi en texte sans empattement, hors de l'atlas → cadre double filet doré, titres en petites capitales, objectifs en serif, barres graduées gravées, ✦ pour les objectifs faits ; zone d'export et case « notation scientifique » des réglages remises au style. CI : `emulator-smoke (nova-foundry)` du commit `d5b6700` rouge pour une erreur d'infrastructure (« Error on ZipFile unknown archive », émulateur non démarré) ; build et `apps-smoke` verts.
- 2026-10-19 · Synth Horde · bugs · 1.20.1 · sous-agent joueur (9 héros, 3 étapes, six langues, 360/390/420 px, sauvegardes corrompues) : aucun plantage ni NaN ; **corrigés** — prime du défi du jour versée une 2ᵉ fois quand l'horloge recule (l'historique fait foi), musique coupée après un changement d'onglet pendant l'écran de niveau, « Reprendre/Abandonner » hors écran en pause (mobile portrait et PC 1280×720 → barre collée en bas), tuile « Dégâts » tronquée dès 7 chiffres (taille fluide + forme abrégée au-delà de 10 M), « Tagespunkte11.724 » collé en allemand, « 0 h 46 » sans unité, double « Doubler » (2 vidéos, 1 récompense) et seconde chance après nouvelle run, sauvegarde éditée à la main (`shop`/`quests`/`dHist` non objets, crédits négatifs, `Infinity`). Ouverts : noms de tomes tronqués dans la pause à 360 px, pas de pause automatique en arrière-plan sur mobile (non reproduit).
- 2026-10-19 · Block Quarry · contenu · 1.12.1 · lot de contenu préparé en parallèle (chapitre 7 « Filon d'or » : blocs de minerai soumis à la pesanteur, à faire descendre au wagonnet ; solveur 26/30 sur 61–70) **abandonné** : il doublonnait 1.12.0 (filons de couleur, chapitres 7–8) — un second élément de grille concurrent, des chapitres en double ; l'idée reste disponible pour un chapitre 9. **Livré** : les trois défauts de conception notés en 1.11.2 — un conseil d'outil, la visée au doigt ou le rappel « pièce grisée » passent en tête de file sans effacer la présentation en cours (givre, pierres dures, filon), qui est rejouée ensuite ; Échap sur les écrans de fin (partie, niveau) ouvre la carte des modes (jamais « Rejouer » ni « Suivant », qui peuvent lancer une pub) ; une reprise suivie d'une seconde fin ne recompte plus la partie au Carnet ; compléments de 1.12.0 : médailles du Carnet sur 4 × 2 (la 7e et la 8e passaient seules à la ligne), « 80 niveaux » dans l'indication de la carte (6 langues, elle disait 60), filons de couleur ajoutés à l'aide de l'Aventure (6 langues), fiche Steam à 80 niveaux en huit chapitres (courtes 286/294 ≤ 300), profil du site 0/80. Un test au smoke par défaut ; `bp-levels` 75/80 (inchangé, génération non touchée).
- 2026-10-19 · Nova Foundry · identité graphique · 1.11.0 · complément de 1.10.1 : captures de tous les écrans de l'appli (420×860, 1280×720) jugées en directeur artistique (section « Nova Foundry — identité graphique ») ; **kit de boutique refait** : l'icône, le démarrage, la bannière Play et les 11 visuels Steam montraient une étoile de dessin animé souriante sur fond violet en police système → soleil d'atlas gravé dans son astrolabe, titre en IM Fell English SC doré (polices du jeu), toutes les tailles Android et iOS ; 36 captures d'une fin de partie (étoile évoluée, Constellation, Astérismes, Commandes et rang, Veille, Supernova) ; fiches Play et Steam réécrites (12 forges, 138 améliorations, 66 nœuds, astérismes, Commandes, rang, Veille, Carnet, 102 succès ; plus d'« étoile souriante » ni de tags « Cute, Colorful ») ; réglages de l'appli sur papier vergé, globe et roue dentée gravés, **« close » non traduit corrigé** (Nova Foundry et Synth Horde) ; « Tout effacer » en sceau de cire ; orbites des forges en repères d'atlas au lieu de pastilles multicolores ; nombres de l'Automate qui recouvraient l'étoile en fin de partie limités et cernés d'encre ; emoji restants (🏅, 💡, ✨, 📺) en gravures ; sons de métal frappé (cloche, enclume, carillon). Mécaniques et équilibrage inchangés.
- 2026-10-20 · Block Quarry · classements · 1.13.0 · classements natifs (demande du propriétaire) : Google Play Jeux, Game Center, Steam — défi du jour (quotidien), record Classique, record Chrono ; boutons « Classement » (fin de partie, carte des modes, accès général) en podium de blocs taillés, masqués sans service (site, identifiants absents) ; défi du jour passé à la **date UTC** avec migration de la série sans perte ni double prime, « nouveau défi dans HH:MM » ; bornes anti-triche ; plugin local `apps/shared/pt-scores`, `apps/shared/scores.js`, `electron/steam.cjs` ; reste au propriétaire : `apps/RELEASE-GUIDE.md` → *Classements*.
- 2026-10-20 · Synth Horde · classements · 1.21.0 · mêmes classements natifs : défi du jour (score du défi, quotidien) et meilleure survie (secondes) ; boutons sur la carte du défi, l'écran de fin et le menu (égaliseur-podium « Living Sound », navigables à la manette, panneau Steam compris) ; défi du jour en **date UTC** (migration de la série, prochain défi à minuit UTC). Nova Foundry : aucun classement.
- 2026-10-21 · Block Quarry · durée de vie · 1.15.0 · (en plus des étoiles de légende de 1.14.0, poussées en parallèle par une autre session) **Jalons de carrière** dans le Carnet : 7 familles (lignes, pièces, parties, combo, tables rases, jours de défi, record classique) × 4 paliers lointains (jusqu'à 25 000 lignes, 1 000 parties), payés automatiquement en pièces + XP (30/60/100/200), sans vidéo ni bouton — de quoi viser au-delà du grade maximal ; six langues, vérifié 420×860 et 1280×720, smoke et apps-smoke verts.
- 2026-10-20 · Block Quarry · durée de vie · 1.14.0 · **étoiles de légende** après le dernier grade du Carnet (une par 1 000 XP, +100 pièces, barre vers la suivante, six langues ; les joueurs déjà au sommet ne touchent rien rétroactivement) ; une autre session a ajouté en parallèle les jalons de carrière (1.14.0/1.15.0), fusionnés sans conflit de code.
- 2026-10-20 · Nova Foundry · enrichissement · 1.11.1 · réglage **effets calmes** dans l'onglet Options (suit « réduire les animations » du système par défaut) : plus d'éclairs plein écran (Supernova, défis, Big Bang…) ; six langues. L'écart relevé : aucun réglage d'accessibilité dans ce jeu.
- 2026-10-20 · Synth Horde · contenu · 1.22.0 · 3 objets à déclencheur (30 → 33) : **Carillon de gemmes** (onde de choc toutes les 30 gemmes, moins avec les exemplaires), **Rancune** (un coup reçu fait exploser tout autour), **Prime de chasse** (les élites lâchent une gerbe de gemmes) ; 3 icônes dessinées, six langues, test ajouté au smoke.
- 2026-10-21 · Nova Foundry · enrichissement · 1.12.0 · **toucher long** dans Options : maintenir sur l'étoile répète les clics (~6/s, comme un joueur qui tapote ; aucun gain automatique, désactivable) — mesuré : 13 clics en 2,35 s maintenu, 1 pour un clic simple, 420×860 et 1280×720 ; la pulsation de l'étoile s'adoucit en mode « effets calmes » (réglage poussé en parallèle par une autre session, 1.11.1) ; six langues.
- 2026-10-21 · Block Quarry · identité graphique · 1.15.1 · revue sur captures 420×860 et 1280×720 : l'étiquette « Bonus du jour » (notifications) recouvrait le score et l'objectif du HUD → placée sous le HUD (96 px, 124 px sur PC) ; les trois pièces flottaient sur le fond → trois berceaux creusés dans la roche (thèmes Carrière). Reste : « LEVEL 45 · MOV… » tronqué dans le HUD PC.
- 2026-10-21 · Nova Foundry · bugs · 1.12.1 · 28 sauvegardes altérées (types faux, null, tableaux, NaN/Infinity, horloge future, défi inconnu) chargées puis jouées : **9 plantaient** (`upg`/`gens`/`st`/`meta` à `null` ou du mauvais type, défi inconnu → écran mort, et le même défaut à l'import du champ Options) ; nouvelle `sane()` appliquée au chargement et à l'import (champ du mauvais type ou non fini → valeur neuve, défi inconnu retiré, `gens` complété) ; test au smoke (10 formes). Économie, hors-ligne et six langues revus les nuits précédentes : rien d'autre trouvé.
- 2026-10-21 · Synth Horde · durée de vie · 1.23.0 · **Rang de héros** (l'écart Megabonk « passif qui progresse », jamais abordé : seul le niveau *en run* progressait) : chaque héros gagne de l'XP à chaque run (temps/6 + 2√éliminations + 30 par étape + 50 si victoire ; la prolongation ne compte que ce qui s'y passe), 10 rangs (60·r·(r+1) XP, rang 10 = 6 600 XP ≈ 50 runs par héros), chaque rang rejoue une fois le bonus de montée de niveau du héros au départ (rang 10 ≈ 10 niveaux de bonus : +10 % dégâts pour Glitch, +60 PV pour Bastion…) ; **jamais en défi du jour** (équité du classement) ; ★rang sur la carte du héros, ligne « +N XP de héros — rang suivant dans M » (ou montée de rang) à l'écran de fin ; six langues ; sauvegarde assainie ; test au smoke (XP versée, bonus +0,10 au rang 10, aucun en défi). Équilibrage des runs inchangé pour un joueur sans rang.
- 2026-10-22 · Block Quarry · enrichissement · 1.15.2 · reste noté de 1.15.1 (« LEVEL 45 · MOV… » tronqué dans le HUD PC) : mesure des libellés du HUD en 6 langues × 4 modes × 1280×720 / 420×860 / 360×740 → 6 troncatures avant (en, it, pt sur PC ; italien du défi sur mobile), 0 après (padding et espacement des lettres resserrés). Rien d'autre touché. Ouvert : reprise d'une partie d'Aventure/défi/chrono après rechargement (le hasard est semé, il faudrait enregistrer l'état).
- 2026-10-22 · Nova Foundry · contenu · 1.13.0 · **Périhélie**, 6ᵉ évènement du ciel (avec éclipse, pluie, conjonction, éruption, aurore) : l'étoile se rapproche, toutes les forges coûtent 30 % de moins pendant 40 s (allongé par la Constellation, comme les autres) ; seul évènement qui joue sur les dépenses, pas sur la production ; anneau d'orbite et comète dessinés, icône, six langues ; « Astronome » demande désormais les 6 ; fiche Play/Steam à six évènements. Mesuré : coût d'une forge 4 017 → 2 812 (×0,70), bandeau sans débord en 6 langues × 420/1280 ; test au smoke. Pas de nœud ni d'amélioration dédiés (idée disponible).
- 2026-10-22 · Synth Horde · identité graphique · 1.23.1 · revue de la pause : noms de tomes coupés par « … » dans 16 cas sur 6 langues à 360/420 px (« Tome de Puissance », « Tomo della Molteplicità »…) → sur deux lignes, 0 troncature après ; reste de l'axe (HUD, écran de fin, héros) déjà traité en 1.18.0, rien de nouveau trouvé. Mécaniques et équilibrage inchangés.

- 2026-10-23 · Block Quarry · bugs · 1.15.3 · point ouvert de 1.11.1/1.15.2 réglé : une partie d'**Aventure, de défi du jour ou de Chrono** est désormais **reprise après un rechargement** (sauvegarde séparée `blocparty.save2` : grille, pièces, objectifs, givre/gemmes, coups restants, horloge du Chrono et **état du tirage semé**, pour que les pièces suivantes soient celles qu'on aurait eues sans rechargement) ; rien n'est repris si la partie est finie, le niveau gagné, le défi d'un autre jour ou le Chrono à zéro ; la partie classique n'est jamais touchée ; sauvegarde aussi à la mise en arrière-plan (horloge du Chrono). Vérifié : 4 parties (niveaux 45 et 65, défi, chrono) rechargées → état identique et tirage suivant identique ; smoke (test ajouté) et apps-smoke verts.
- 2026-10-23 · Nova Foundry · durée de vie · — · sauté : la machine de la routine était très lente cette nuit (smoke complet 22 min au lieu de <15, `sf-long` > 20 min sans résultat) ; aucune vérification fiable possible dans le temps. Passe en premier la nuit suivante (axe durée de vie).
- 2026-10-23 · Synth Horde · enrichissement · — · sauté : même raison. Passe en premier après Nova Foundry (axe enrichissement).
- 2026-10-24 · Block Quarry · contenu · 1.16.0 · Aventure 80 → 100 niveaux : chapitres 9–10 « Cavité des géodes » et « Cœur de cristal » avec un cinquième type de niveau, la **géode** (gemmes enfouies dans la pierre **et** givre à briser dans le même niveau, victoire = les deux ; tuile d'objectif 💎/❄ sur une ligne à 360/420/1280 px), mélangée au givre, aux filons et aux lignes ; deux médailles (motifs géode et étoile à facettes, or) ; six langues ; solveur `bp-levels` étendu à 100 niveaux : 20/20 réussis sur 81–100 (90/100 au total) ; test au smoke. Reste : minerai à la pesanteur (idée de 1.12.1, chapitre 11 possible). CI Android, Desktop, iOS vertes.
- 2026-10-24 · Nova Foundry · durée de vie · 1.14.0 · `sf-long` 40 h (graine 1, 20 min) : 85 nouveautés entre 0 et 1 h, mais **4 à 7 seulement entre 20 et 40 h** (écart médian 3 h 10, plus long creux 4 h 12, fin à 53 min sans rien) → 6 succès de long cours : Supernovae ×50 et ×100, Big Bang ×10, 500 commandes, rangs 12 et 16 (textes existants réutilisés, aucune nouvelle chaîne) ; chaque succès valant +1 % de production, c'est ~+6 % tout au bout de la partie (noté pour le propriétaire) ; test au smoke ; fiches Play/Steam : 108 succès.
- 2026-10-24 · Synth Horde · enrichissement · 1.24.0 · **pause automatique** quand l'appli passe en arrière-plan (appel, notification, changement d'appli : `visibilitychange`, `pagehide`) ou quand la fenêtre perd le focus sur PC (Alt-Tab, overlay Steam) ; interrupteur « Pause automatique » dans les réglages de la pause (activé par défaut) ; six langues ; test au smoke (blur, onglet masqué, réglage coupé). Ferme le point ouvert de 1.20.1.
- 2026-10-29 · Block Quarry · durée de vie · 1.17.0 · deux missions de la semaine de plus, liées au contenu récent : **filons** (dégager 25 blocs de la couleur désignée) et **géodes** (gagner 2 niveaux de géode), tirées seulement si le joueur a atteint le chapitre (sinon mission impossible) ; six langues, test au smoke.
- 2026-10-29 · Nova Foundry · identité graphique · — · no-op : captures 420×860 et 1280×720 (introduction, Forges, Améliorations, Constellation/Galaxie, Défis, éclipse) relues, direction « atlas céleste » tenue partout, emoji déjà remplacés à la volée ; rien qui justifie un changement.
- 2026-10-29 · Synth Horde · bugs · 1.24.1 · 26 sauvegardes `META` altérées (types faux, tableaux, null, valeurs négatives ou énormes) chargées puis jouées : une seule faute, la **boutique permanente** — un niveau négatif ou supérieur au maximum faisait lever `repeat` (« Invalid count value: -3 ») à l'affichage ; `shopLvl` borné à 0..max, test au smoke.
- 2026-10-29 · tous · bugs (outillage) · — · `tools/smoke.mjs` : durée maximale réglable (`SMOKE_MAX_S`, 900 s par défaut) car le smoke complet dépasse 15 min sur une machine chargée (chien de garde déclenché deux fois à tort) ; test Périhélie de Nova Foundry qui lisait le prix avant le rendu (attentes fixes) : il attend maintenant le changement du prix affiché.
- 2026-10-30 · Block Quarry · identité graphique · 1.18.0 · captures carte des chapitres 9–10, niveau de géode, Carnet (420×860, 1280×720) relues : les médailles et la carte tiennent la direction « Carrière » ; reste du thème générique : la **gemme** (losange cyan plat, la même du chapitre 1 au 10) → pierre taillée à facettes (table, couronne, pavillon, éclat), et **améthyste violette** dans les niveaux de géode (éclats à la couleur de la gemme) ; smoke et apps-smoke verts.
- 2026-10-30 · Nova Foundry · enrichissement · 1.15.0 · **jouable au clavier** (le jeu n'avait aucune touche, alors que Steam est une cible) : Espace / Entrée touchent l'étoile (maintenir répète ~6/s, comme le toucher long, réglable), 1–n changent d'onglet (onglets visibles seulement), B achète toutes les améliorations abordables ; la touche reste au bouton focalisé et aux fenêtres ouvertes, sans effet dans un autre jeu du site ; rappel dans Options (six langues) ; test au smoke ; captures 420×860 et 1280×720 relues.


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

### Durée de vie (2026-10-18, build 1.16.0) — inventaire et écart retenu

Existant : 9 héros (8 à débloquer), 18 armes (9 par quête), 30 objets (14 par quête), ~75 quêtes à paliers, Chaleur 0–5
mémorisée par héros, 4 pédales, boutique permanente (~15–20 runs pour tout acheter), Prolongation ∞ avec record, records
globaux (temps, niveau, éliminations). Tout cela s'**épuise** : une fois les quêtes faites et la boutique pleine, rien ne
renouvelle l'objectif d'une session à l'autre. Écart retenu : un **défi du jour** à graine fixe (même carte, héros imposé,
deux modificateurs, score, record du jour, série de jours, prime), le moteur « une run par jour » des roguelites.
Candidats suivants : records et maîtrise par héros (meilleur temps, Chaleur, niveau de maîtrise), défis de run nommés.

### Enrichissement (2026-10-18, builds 1.18.0–1.19.0) — frictions relevées et lot retenu

Joué en nouveau joueur : téléphone 420×860 et paysage 844×390 (tactile), PC 1280×720 (clavier/souris, manette simulée par
l'API Gamepad), 8 min en Graphismes bas. Frictions :

- **Manette dans les menus** : rien n'est navigable. Au menu, A lance la run (impossible de choisir un héros, le défi du
  jour, la Chaleur ou un achat) ; en pause, A/B/Start reprennent seulement (aucun réglage modifiable) ; quêtes et fin idem.
  Bloquant pour un joueur Steam Deck / canapé.
- **Coups reçus** : seule une vignette rouge diffuse ; rien ne dit d'où vient le coup quand l'écran est chargé.
- **Accessibilité** : pas de réduction des flashs (pops blancs des morts, éclats d'impact, halo, vignette qui pulse sous
  30 % de PV) ; pas de réglage de taille de texte ; aucun équivalent visuel des menaces annoncées par le son et l'image
  (attaque du boss, éruption, kamikaze, ruée) ; daltonisme : familles et ramassables se distinguent par la forme (notes,
  disques, cœurs, matériel audio), seul le radar repose sur la couleur — acceptable.
- **Cibles tactiles < 44 px** : pause en jeu 40×40, segments de la pause 30 px de haut, interrupteurs 38×18, boutons
  Quêtes / Boutique / Défi / Relancer / Bannir / Passer 35 px ; réglages de la pause tout en bas d'une longue fiche sur téléphone.
- **Performances** : 8 min en Graphismes bas (250 ennemis, téléphone simulé, rendu logiciel) : même cadence qu'à 0:00 —
  pas de dérive.

Retenu (1.20.0, après les « effets calmes » de 1.19.0) : navigation complète des menus à la manette, direction des coups,
flashs ajoutés aux effets calmes, texte plus grand, sous-titres des dangers, cibles
tactiles à 44 px et raccourci « Réglages » en pause.

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
| V9 — identité (revue de direction artistique du 2026-10-18, 1.18.0) | Captures de tous les écrans (menu, héros, défi, boutique, quêtes, partie 0:30/3:00, boss, niveau, coffre, marchand, pause, fin) en 420×860 et 1280×720. Défauts retenus : titre coupé « SYNTH HOR / DE » sur téléphone ; HUD de téléphone qui se chevauche (minuteur sur la 4e arme, « ÉTAPE » sur les tomes, annonces et barre du boss sur la ligne d'or) ; pause en pile de cadres de largeurs inégales (gabarit) ; fin de run en tableau de stats générique ; héros verrouillés noirs sur noir ; Drop de basse sans son propre (bruit d'explosion générique), Sillon muet. Corrigé : mots du titre insécables ; minuteur en étiquette en haut à gauche et colonnes décalées (0 chevauchement mesuré en 360/390/420, en/fr/de) ; pause en « fiche de tournée » (armes en dalles, niveau en gros chiffres, piste vers l'évolution, tomes en tuiles, objets en jetons) ; fin en affiche (verdict sur dalle inclinée avec portrait, 4 gros chiffres) ; silhouettes grises en pointillé ; Drop : sifflet qui tombe pendant l'annonce + coup de sub type 808 ; Sillon : une note pentatonique sur deux, qui monte et redescend | **fait** (1.18.0) |

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
| G7 | Aventure courte (40 niveaux), deux objectifs | moyen-haut | ✅ en partie, 1.8.0 — 60 niveaux en 6 chapitres de 10 (en-têtes et étoiles par chapitre sur la carte), troisième objectif « givre » (plaques de glace au sol, brisées par une ligne effacée ou un booster) aux niveaux 41–60 ; reste : couleurs à collecter, caisses, génération ouverte |
| G8 | Défi du jour sans objectif ni calendrier ni partage ; et il ne finissait jamais (bienveillance des tirages permanente : un glouton atteignait 400 coups) | moyen | ✅ 1.5.0 — bienveillance qui s'estompe après 150 pièces comme en classique ; objectifs ★ 500 / ★★ 1 500 / ★★★ 3 000 (glouton sur 30 graines : médiane 1 360, p90 3 029), barre vers l'étoile suivante, calendrier du mois, trophée à 20 jours étoilés, partage (feuille du système ou presse-papiers) |
| G9 | Scores petits (≈ 700) | moyen | à faire — ×10 avec migration des records |
| G13–G16 | Événement hebdomadaire, thèmes en plus, Chrono plus lisible, monétisation | bas | en partie, 1.9.0 — missions de la semaine et 3 thèmes de grade (voir G17) ; reste : Chrono, monétisation |
| G17 | Durée de vie : rien à viser au-delà d'une partie (pas de grade, pas de missions, pas de collection) ; les étoiles d'un chapitre complet ne rapportaient rien | moyen-haut | ✅ 1.9.0 — **Carnet du carrier** : 16 grades (XP : 1/ligne, 3/étoile d'un niveau gagné, 10/étoile du défi, 30/mission ; pièces à chaque grade, thèmes Marbre/Basalte/Jade aux grades 5, 9, 13), 3 missions par semaine (2 générales + 1 Aventure ou défi, mêmes pour tous) avec coffre à 100 🪙, médaille par chapitre à 30/30 (+60 🪙), statistiques de carrière ; vidéo facultative = pièces ×2 d'une mission remplie, rien de plus |

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

**1.5.0** : élan de forge (+10 % par forge possédée d'un type tiré au sort, 30 s — le « bâtiment spécial » de Cookie
Clicker) ; comète sombre après la 1re Supernova (12 %, ignorée par le filet automatique) : écho ×15, perte de 5 % de la
poussière ou trou noir (clics ×100) ; multiplicateur cumulé affiché quand plusieurs effets se superposent ; cinématique
de Supernova (effondrement, éclair, onde de choc, renaissance).

Écarts restants (classés) : arbre de 80–120 nœuds avec choix exclusifs, contenu de partie (forges 13–15, synergies,
paliers jusqu'à 500), 150+ succès qui nourrissent un multiplicateur, codex des événements,
jus (chiffres qui roulent, ETA), couche quotidienne (Stardrops, mini-jeu), Big Bang qui
débloque des systèmes, saisons, défis à paliers.

## Retour de partie n° 3 (2026-10-05) → Synth Horde 1.15.0, Block Quarry 1.7.0

| Retour | Correction |
|---|---|
| SH : ne pas pouvoir grimper les murs verticaux (les ennemis, si) | Étages de 4,8 à 6 m (le double saut fait ~4 m) ; sur une paroi de plus de ~52° le joueur glisse sans regagner ses sauts. Garde-fous : dans un creux en V on tient debout, et une glissade qui n'avance pas redevient un sol (sinon le joueur restait figé — trouvé par le bot) |
| SH : carte trop petite, plus de verticalité, pentes, plateaux, falaises, décor | Arène 300 × 300 m (×2,25) ; 4 à 7 étages ; mesas à une seule rampe et fosses (bords de rampe fondus) ; vinyles géants à demi enterrés ; contenu à l'échelle (34 coffres, 24 tremplins, 32 piliers, sanctuaires ×1,6, 68 tours) |
| SH : cartes procédurales, jamais pareilles | Chaque run tire un style (terrasses, mesas, canyons, hauts plateaux), des tailles, une hauteur d'étage, une densité de rampes et ses reliefs |
| SH : écran pause bogué (textes superposés), listes déroulantes laides | Étiquettes imbriquées corrigées (l'indice d'évolution n'est plus une boîte dans la boîte) ; boutons segmentés, interrupteurs et curseur au style « flyer » |
| SH : icônes en emoji « très cheap » | 168 icônes dessinées (js/bonk-icons.js) : armes, évolutions, tomes, objets, sanctuaires, personnages, statistiques, HUD, quêtes ; remplacement automatique dans les textes traduits |
| SH : zoomer / dézoomer, téléphone et ordinateur | Molette, touches +/−, pincement à deux doigts ; mémorisé |
| SH : des nœuds à activer comme les crânes de Megabonk | Pédales d'effet FUZZ (+20 % d'ennemis, +15 % XP), BOOST (+25 % PV ennemis, +30 % or), ECHO (une élite de plus ~toutes les 40 s, +1 chance), DRIVE (ennemis plus vifs et plus forts ; +20 % or et XP) — cumulables, compteur GAIN au HUD |
| BQ : icônes qui font emoji | Glyphes d'une seule couleur frappés dans la pierre (relief en CSS), main du tutoriel dessinée |
| BQ : marteau, bombe, mélange peu compréhensibles | Boutons en schéma (1 case brisée / zone 3×3 / nouvelles pièces) avec libellé et prix ; à la sélection, un bandeau explique l'outil et comment l'annuler |

Équilibrage (bot naïf, qui contourne désormais une falaise quand il bute) : médiane 5:33, niveau 14,9 à 3:00 (avant : 5:22 / 14,3).
Portée de ramassage de base +25 % et dégâts des étapes 1–2 un peu baissés : la horde suit partout sur un terrain plus haché.

## Block Quarry et Nova Foundry — « ça fait encore IA par endroits » (2026-10-05) → 1.6.0

Diagnostic : emoji en guise d'icônes, boutons « pilule » en dégradé, police système dans les textes et boutons, cadres
parfaitement réguliers, fenêtre de confirmation générique (sombre et rose) commune aux jeux.

| Jeu | Correction |
|---|---|
| Block Quarry | Dalles de pierre aux arêtes irrégulières (trois découpes alternées) avec grain, plaques de cuivre rivetées pour les actions, titre sur planche de bois, défi du jour en panneau cloué, Chrono en plaque émaillée, niveaux en pierres taillées, Big Shoulders partout ; tous les emoji remplacés à la volée par des icônes dessinées (cadenas, gemme, calendrier, chrono, carte, dynamite, trophée…), dans les 6 langues ; confirmation en tablette de pierre |
| Nova Foundry | Gravures au trait à la place des emoji (12 forges, familles d'améliorations, onglets), petite constellation propre à chaque nœud, succès, défi et automatisation ; grain de papier, filets tracés à la main légèrement tremblés, souligné calligraphié des onglets ; Supernova en sceau de cire de travers ; plaque dorée mate ; confirmation sur papier vergé à l'encre ; disque de l'étoile gravé (hachures croisées et pointillé sur l'ombre) et rayons gravés droits et ondulés |

## Block Quarry — identité graphique, regard de directeur artistique (2026-10-18) → 1.10.0

Captures de tous les écrans de l'appli construite (mobile 420×860 et PC 1280×720). Le jeu lui-même tient sa direction
« Carrière » depuis 1.4/1.6 ; ce qui faisait générique, c'est tout ce qui l'entoure :

| # | Constat | Correction |
|---|---|---|
| I1 | **Bloquant** : dans l'appli (Android, iOS, Steam), le jeu ne démarrait plus depuis 1.6.0 — le module observait la fenêtre de confirmation avant que la coquille ne la crée (exception au chargement, grille vide, aucun bouton ne répondait) ; le site n'était pas touché, d'où le silence des tests | ✅ surveillance posée dès que la fenêtre existe |
| I2 | Icône, écran de démarrage, bannière Play, visuels et captures Steam, captures Play et iPhone : **tout le kit de boutique montrait encore l'ancien jeu** (blocs bonbon sur fond violet, emoji, police système) — le premier contact avec le jeu contredisait le jeu | ✅ emblème redessiné (la dalle de grès boulonnée, minéraux taillés, gemme au centre, un bloc qui sort de la carrière), strates en fond, titre en Bungee doré ; toutes les tailles Android/iOS, 11 visuels Steam, 36 captures (Play, iPhone, Steam ; le Carnet remplace le thème Néon) ; barre d'état et fond de fenêtre bruns au lieu du violet |
| I3 | Réglages de l'appli : carte bleu marine d'application générique (police système, case bleue, lien bleu, 🌐 en couleur) ; bouton ⚙ vide (l'emoji était filtré sans glyphe) | ✅ tablette de pierre, titre sur planche, cases ambrées, glyphes dessinés (roue dentée, globe) |
| I4 | Carnet : grade dans un hexagone doré « badge de jeu mobile », six médailles identiques ; notifications en bulles vertes d'appli par-dessus | ✅ grade = écu de métal frappé (bronze → fer → argent → or), outil du métier gravé (ciseau, pic, masse, pic et masse croisés, gemme, couronne), chevrons I/II ; médailles = pièces crénelées, un motif par chapitre (pic, bloc riveté, strates, chevalement, flocon, cristaux), empreinte dans la pierre tant qu'elles ne sont pas gagnées ; insigne repris sur la carte, les thèmes de grade et les écrans de fin ; notifications en étiquettes de pierre |
| I5 | Effacement : la case rétrécit en tournant (animation de n'importe quel jeu de blocs) | ✅ la pierre se fend depuis un point d'impact puis éclate en quatre éclats qui tombent ; moins de copeaux en plus |
| I6 | Restes du thème bonbon en Carrière : visée rose du marteau/de la dynamite, confettis multicolores du record, croix rouges de fin ; sons « bip » à la prise et au retour | ✅ visée en tirets de craie ambrée, paillettes d'or et de grès, croix tracées à la craie ; « tink » de ciseau, raclement de pierre |
| I7 | Tutoriel : « Glisse une pièce sur la grille » partait du centre vers la droite et débordait | ✅ centré |

Reste : textes des fiches (Play : « 40 niveaux », « 5 thèmes » ; Steam EN : « 40 niveaux ») à mettre à jour avec les
60 niveaux, le givre, le Carnet et les thèmes de grade.

## Nova Foundry — identité graphique, regard de directeur artistique (2026-10-19) → 1.11.0

Captures de tous les écrans de l'appli construite (mobile 420×860 et PC 1280×720 : début, mi-partie, fin de partie au
quasar, chaque onglet, évènements du ciel, Supernova, Big Bang, défis, réglages). Le cœur du jeu tient sa direction
« atlas céleste » depuis 1.6, et 1.10.1 a remis la Veille du jour et l'onglet Options dans l'atlas ; restaient le premier
contact (kit de boutique) et la coquille de l'appli :

| # | Constat | Correction |
|---|---|---|
| N1 | **Kit de boutique d'un autre jeu** : icône, démarrage, bannière Play et 11 visuels Steam montraient une étoile de dessin animé **souriante**, orbites de pastilles multicolores, fond violet, titre en police système ; les captures (Play, iPhone, Steam) dataient de 1.4 (partie de 2 h, ni Astérismes, ni Commandes, ni Veille, ni étoile évoluée) ; fiche Steam « Tap a smiling star », tags « Cute, Colorful », 10 forges, 14 nœuds | ✅ soleil d'atlas gravé dans son astrolabe (anneaux gradués, douze petites constellations, rayons droits et ondulés, disque hachuré sur l'ombre, double liseré doré), nuit d'encre et grain, titre en IM Fell English SC doré (polices du jeu chargées par `fonts-preload.mjs`), sous-titre entre filets ; toutes les tailles Android **et iOS**, 11 visuels Steam ; 36 captures d'une fin de partie (hypergéante, Constellation, Astérismes, Commandes et rang, Veille du jour, Supernova) ; barre d'état et fond de fenêtre `#0b1028` ; fiches Play et Steam réécrites (12 forges, 138 améliorations, 66 nœuds, 8 astérismes, Commandes, rang, Veille, Carnet, 102 succès), tags « Atmospheric, Stylized » |
| N2 | Réglages de l'appli : carte bleu marine d'application, police système, case bleue, lien bleu, 🌐 en couleur, bouton « close » **non traduit** (la clé n'existait plus que dans les textes de Block Quarry : Nova Foundry et Synth Horde l'affichaient telle quelle) ; bouton ☰ | ✅ note à l'encre sur papier vergé (comme les confirmations), cases et lien lie-de-vin, globe gravé, « Fermer » traduit dans les six langues (coquille commune), roue dentée gravée à la place du ☰, notifications de l'appli en étiquettes d'encre |
| N3 | Onglet Options : bouton « Tout effacer » rose bonbon ; son icône (la « roue » gravée) ressemblait à un soleil, à côté du ☰ | ✅ sceau de cire ; livre ouvert pour l'onglet, vraie roue dentée pour les réglages |
| N4 | Orbites des forges : pastilles pastel de douze couleurs (confettis) autour d'une étoile gravée | ✅ repères d'atlas à l'encre dorée et papier, une forme par forge (point, anneau, étoile à quatre branches, croix pointée), pleins devant, au trait derrière ; points seuls dans le petit cadre du téléphone |
| N5 | Fin de partie : les nombres de l'Automate (bleu clair, un tous les trois clics) recouvraient l'étoile d'une bouillie de chiffres, illisibles sur les stades bleus | ✅ un toutes les 0,65 s au plus, hors du disque, couleur papier ; tous les nombres flottants cernés d'encre |
| N6 | Emoji restants : 🏅 des récompenses de défi, 💡 du conseil du Big Bang, ✨ du titre de l'introduction, 📺 des vidéos… | ✅ remplacés à la volée par des gravures (médaille, comète, lune, bobine…) dans tout l'onglet et les fiches |
| N7 | Sons : bips sinus et triangle | ✅ métal frappé : clic = cloche pentatonique (partiels inharmoniques), forge achetée = coup de marteau sur l'enclume, améliorations = carillon |
| N8 | Téléphone : les chiffres de la Supernova tenaient sur trois lignes et réduisaient l'étoile | ✅ chiffres plus petits sous 760 px |

## Synth Horde — retour de partie n° 2 (2026-10-05) → 1.14.0

| Retour | Correction |
|---|---|
| Tout devient trop lumineux, un boss reste blanc en permanence | L'éclat de coup ne se relance qu'une fois retombé (il palpite au lieu de rester blanc) et ne blanchit plus qu'à 55 % ; boss plafonné à 0,35. Budget lumineux : selon la charge (particules, rayons, foule), le halo, les étincelles et le cœur lumineux des modèles baissent d'eux-mêmes (jusqu'à 40 %) |
| Les lasers ne visent pas devant soi (mais touchent) | Le rayon était tracé à plat : sur le relief il filait dans la colline, invisible, et touchait quand même ; au-delà de 4 rayons, les suivants n'étaient pas dessinés. Désormais : cible prioritaire devant soi (±70°), visée en hauteur, rayon coupé par le relief (dégâts aussi), autant de rayons dessinés que tirés, plus discrets quand ils s'empilent |
| Les ennemis doivent aller partout, jusqu'en haut des piliers | Grille de navigation de 2 m (relief + blocs + piliers) et champ de flux (Dijkstra depuis le joueur, 4 fois/s, ~6 ms) : les ennemis prennent les rampes, escaladent une paroi quand c'est plus court (≈ 1 s par étage). Mesuré : point le plus haut (12 m) atteint en ~6 s depuis 35 m, pilier de 13 m en 3,7 s |
| Plus de verticalité, des étages, ne pas voir toute la carte, chercher les bonus | Relief en terrasses (3 à 5 étages de 3,6 m, jusqu'à ~17 m) : falaises franchissables au double saut, rampes douces ailleurs ; tremplins au pied des falaises ; coffres plutôt sur les étages hauts ; brouillard rapproché (26–88 m) ; le radar ne montre plus que les coffres et sanctuaires déjà découverts (à moins de 32 m) ; strates sur les parois ; la caméra se rapproche quand le relief la masque |

Bot naïf (6 runs) : médiane 5:22 (5:59 avant) — un peu plus dur, la horde suit désormais partout ; un humain peut prendre une falaise au double saut pour la forcer au détour.

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

- Block Quarry (bugs 1.11.2, conception à trancher) : bonus de connexion et missions se farment en avançant l'horloge du téléphone (ou en la reculant de plus de deux semaines) — pas de parade sans serveur, à accepter ou à plafonner. *(Les trois autres points — conseils remplacés, Échap sur les écrans de fin, partie recomptée après une reprise — sont réglés en 1.12.1.)*
- *(résolu à l'itération 11)* gel intermittent : c'était la taille non bornée des particules. Le chien de garde reste dans `tools/smoke.mjs` et `tools/nb-balance.mjs`.
