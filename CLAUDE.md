# Playtoon

Trois jeux autonomes (Block Quarry, Nova Foundry, Synth Horde) pour Google Play, Steam et App Store. Le site GitHub Pages n'est qu'un banc de test navigateur : rien de ce qui le concerne ne doit entrer dans une appli. Consigne de la routine nocturne et règles des jeux : `ROUTINE.md`.

## Contexte du propriétaire (second-brain)

- **Statut du produit** : `.vibeship/project.yml` à la racine (étape, version, prochaine action humaine). C'est la source de vérité de l'état ; ne pas le recopier ailleurs.
- **Contexte et décisions** : dépôt `flocautank/second-brain`, `personal/playtoon/PROJECT.md` puis `SUMMARY.md`. À lire seulement si la tâche touche au contexte du projet ou à une décision, jamais le dépôt entier. Si le second-brain n'est pas disponible dans la session, continuer sans le signaler.
- **Branches** : ce dépôt va directement dans `main` (exemption écrite, ADR-009 complément du 2026-11-01) : produit en ligne qui évolue seul. Le propriétaire peut aussi y pousser directement.
- **Décision structurante** (architecture, dépendance majeure, règle de produit) : à consigner en ADR dans le second-brain, au prochain numéro libre, ou en complément d'un ADR du même thème.
