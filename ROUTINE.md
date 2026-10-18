# Routine nocturne d'amélioration des jeux

Cette consigne est lue chaque nuit par la routine planifiée « Playtoon — amélioration nocturne ».
Elle fait autorité sur la routine : pour changer son comportement, modifier ce fichier.

## Le but des trois jeux (ne jamais s'en écarter)

Chaque jeu est un **produit autonome destiné aux boutiques**. Toute amélioration doit rester compatible avec :

1. **Monétisable**, selon le support (détail : `apps/PRICING.md`) :

   | Jeu | Mobile (Play, App Store) | PC (Steam) | Web |
   |---|---|---|---|
   | Block Quarry | gratuit, pubs récompensées + interstitiel plafonné, « Remove ads » | payant, sans pub | banc de test |
   | Nova Foundry | gratuit, pubs récompensées seulement, « Eternal Engine » | payant, sans pub | banc de test |
   | Synth Horde | payant, sans pub ni achat | payant, sans pub | banc de test |

   Jamais de pub sur Steam ni dans Synth Horde. Jamais de pay-to-win : une pub récompensée accélère ou console, elle
   ne débloque pas ce que le jeu refuse au joueur qui ne regarde pas. Ne pas changer les prix ni le modèle : c'est une
   décision du propriétaire, à proposer dans le résumé.
2. **Portable sur mobile sans effort** : écran portrait 360–430 px de large, tactile seul, appareil d'entrée de gamme,
   pas de dépendance réseau en jeu.
3. **Jouable sur PC** : clavier/souris (et manette pour Synth Horde), fenêtre 1280×720 et plein écran.
4. **Indépendant** : chaque jeu se construit seul (`apps/<jeu>/`), sans code, texte, lien ni progression d'un autre jeu.
   La page Playtoon (site GitHub Pages) n'est qu'un **banc de test navigateur** : rien de ce qui la concerne
   (accueil, profil commun, objectifs croisés, navigation entre jeux) ne doit fuir dans une appli.

## Ordre de passage : du moins ambitieux au plus gros

Chaque nuit, traiter les jeux **dans cet ordre**, un lot par jeu :

1. **Block Quarry** (puzzle) ;
2. **Nova Foundry** (idle) ;
3. **Synth Horde** (survivors 3D).

Un jeu n'est commencé que si le précédent est terminé (poussé, ou abandonné proprement et consigné). Si le temps manque,
mieux vaut deux jeux bien faits que trois bâclés : le jeu sauté est noté dans le journal et passe en premier la nuit suivante.

## Les axes, en rotation

Pour chaque jeu, l'axe de la nuit est le suivant dans cette liste après celui de la dernière nuit (voir le journal) :

1. **Bugs** — jouer réellement (Playwright, mobile 420×860 tactile **et** PC 1280×720), chercher plantages, blocages,
   textes qui débordent (six langues), états incohérents, sauvegarde/chargement, reprise après mise en arrière-plan.
2. **Contenu** — ce qui manque au cœur du jeu (niveaux, pièces, améliorations, ennemis, armes, évènements…).
3. **Durée de vie** — progression à moyen et long terme, objectifs, défis quotidiens, rejouabilité, courbe de difficulté.
   Mesurer avec les outils (`tools/bp-levels.mjs`, `tools/sf-pace.mjs`, `tools/sf-long.mjs`, `tools/nb-balance.mjs`).
4. **Identité graphique** — affirmer le style propre du jeu (palette, typographie, formes, icônes, animation, sons),
   chasser ce qui fait générique ou « fait par IA ». Garder la cohérence avec les kits de boutique (`apps/<jeu>/store/`).
5. **Enrichissement** — confort et finition : retours visuels et sonores, tutoriel, accessibilité, réglages, performances.

Un bug **bloquant** trouvé en chemin passe avant l'axe de la nuit, quel qu'il soit.

## Choisir le lot

1. Lire `BACKLOG.md` (sections du jeu et « À surveiller »). S'il y a un élément ouvert pour l'axe, le prendre.
2. Sinon, jouer au jeu (sous-agent possible) et comparer à la référence du genre (Block Blast!, Cookie Clicker, Megabonk)
   pour trouver l'écart le plus utile sur cet axe. Le noter dans `BACKLOG.md` avant de l'implémenter.
3. Un lot = un changement visible et cohérent, assez petit pour être vérifié dans la nuit. Pas de refonte d'architecture,
   pas de nouveau jeu, pas de nouvelle dépendance lourde.

## Vérifier avant de pousser (obligatoire)

- `python3 -m http.server 8765` à la racine, puis `node tools/smoke.mjs` : doit finir par **« OK — aucune erreur console »**.
- Captures mobile **et** PC du changement, relues.
- Outil de mesure du jeu si l'axe touche l'équilibrage ou la durée de vie.
- **Indépendance** : construire les trois applis (`cd apps/<jeu> && node build.mjs`) et vérifier que le `www/app.js` de chaque
  appli ne contient le nom d'aucun autre jeu (`grep -c "Block Quarry\|Nova Foundry\|Synth Horde"`) ni « Playtoon ».
- Version du jeu augmentée dans `js/version.js` (correctif : 1.x.**y** ; contenu : 1.**x**.0). Nouveau fichier JS →
  l'ajouter à `CORE` dans `sw.js` et monter `CACHE`.

Si la vérification échoue et que la correction n'aboutit pas : `git checkout -- .` sur ce lot, le consigner, passer au jeu suivant.
Ne jamais pousser un jeu cassé pour tenir le compte.

## Livrer

Ce dépôt pousse sur `main` (le site de test suit par `publier.yml`, les applis sont construites par la CI) :

```sh
git add -A && git commit -m "<Jeu> x.y.z : <ce qui change>" && git push origin HEAD:main
git fetch origin && git log --oneline -1 origin/main
```

Un commit par jeu. Puis suivre la CI (`gh api repos/flocautank/playtoon/actions/runs?head_sha=<sha>`) : Android, Desktop,
iOS doivent être verts ; si un job échoue à cause du lot, corriger et repousser dans la même nuit.

Ne jamais toucher : secrets, clés de signature, identifiants AdMob, comptes de boutique, prix, `apps/RELEASE-GUIDE.md`
(sauf pour le corriger s'il est faux).

## Consigner

1. `BACKLOG.md`, section « Routine nocturne — journal » : une ligne par jeu et par nuit —
   `AAAA-MM-JJ · Jeu · axe · version · ce qui a changé (ou « no-op : raison » / « sauté : raison »)`.
2. Second-brain (`flocautank/second-brain`, si accessible) : mettre à jour `personal/playtoon/SUMMARY.md` (une ligne
   datée) et les versions dans la ligne Playtoon de `system/INDEX.md`, pousser **directement sur `main`** et vérifier
   avec `git log --oneline -1 origin/main`. Si rien n'a changé dans les jeux, ne rien commiter.

## Résumé final (c'est ce que le propriétaire reçoit)

En français, dix lignes au plus : pour chaque jeu, l'axe, ce qui a changé et la nouvelle version (ou pourquoi rien) ;
l'état de la CI ; les **décisions qui reviennent au propriétaire** (prix, modèle, contenu sensible) s'il y en a.
Si le push ou la CI a échoué, le dire en premier avec l'erreur exacte.
