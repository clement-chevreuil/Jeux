# Jeux — goûts & idées

Notes sur le genre de jeux que j'aime, pour les prochains petits logiciels.

## Ce que j'aime

- **Pixel art** — sprites dessinés en dur, rendu net (pas de lissage), petites animations.
- **Rogue-like** — une run, des niveaux qui s'enchaînent, on recommence quand ça tombe.
- **TCG / cartes** — collectionner, drafter, choisir entre plusieurs cartes après chaque victoire.
- **Escouade droppable** — on choisit ses personnages et on les place (drag & drop) sur le terrain
  avant de les envoyer contre les monstres.
- **Résultat binaire par niveau** — soit on réussit le niveau, soit on le perd.
- **Mort définitive (permadeath)** — un personnage qui tombe au combat est perdu pour de bon,
  il disparaît de la collection. Ça donne du poids à chaque déploiement.
- **Progression de personnage / changement de classe** — un héros qui monte de niveau et peut
  évoluer vers une classe différente plutôt que de rester figé (à la Pokémon : un rôle de départ
  qui se transforme en quelque chose de plus fort ou de différent).
- **Quête fantasy à choix multiples** — une histoire qui avance par embranchements narratifs,
  pas juste par combats : des choix qui changent la suite (rencontres, dialogues, morale).

## Jeux qui inspirent ce style

- **Slay the Spire** — deckbuilder rogue-like : combats au tour par tour, 3 cartes au choix
  après chaque victoire, carte du donjon à embranchements.
- **Darkest Dungeon** — escouade envoyée en donjon, permadeath, gestion du stress/moral,
  ambiance sombre en illustration/pixel.
- **Battle Brothers** — compagnie de mercenaires qu'on positionne sur le terrain, permadeath,
  tactique au tour par tour, blessures permanentes.
- **Monster Train** / **Griftlands** — deckbuilders rogue-like avec personnages recrutables,
  synergies d'équipe, combats parfois automatisés.
- **Hollow Knight** — pixel art / metroidvania, ambiance et animation soignées malgré un style
  simple.
- **Yu-Gi-Oh** — TCG classique : deck personnel, invocations, stratégie de cartes.
- **Pokémon** — collection de créatures droppables au combat, montée en niveau, évolution
  (changement de forme/classe), permadeath assoupli (KO récupérable, mais l'esprit de
  "choisir qui envoyer se battre" est là).

## Boucle de jeu type

1. **Camp** : on regarde sa collection (PV conservés d'un combat à l'autre), on drag & drop
   ses personnages dans les emplacements de déploiement.
2. **Combat** : résolution automatique, on regarde ce qu'on a préparé se dérouler.
3. **Victoire** → on pioche 1 carte parmi 3 (nouveau personnage, amélioration, relique, soin).
   **Défaite** → niveau perdu, on peut retenter avec ce qu'il reste.
4. Les morts vont au **cimetière**. Plus personne = fin de la run.

## Réalisations

- `arene/` — **Dernière Escouade** : le jeu ci-dessus, un seul dossier, aucune dépendance.
- `grimoire/` — **Le Grimoire** : deckbuilder rogue-like (à la Slay the Spire), thème sorcier /
  grimoire maudit. Un seul héros, un deck qui grossit à chaque victoire (1 carte parmi 3), une
  carte du donjon à embranchements (combat / élite / repos / événement / boss). Combats au tour
  par tour où c'est le joueur qui joue les cartes (contrairement à Dernière Escouade qui était
  automatique). Sprites en 24×24 (plus fins que les 16×16 de Dernière Escouade). Premier jeu
  construit avec les règles de code du `CLAUDE.md` (section « Comment le code est écrit ») :
  fichiers séparés par responsabilité (data/moteur/rendu/ui/écrans), composants d'interface
  isolés, CSS structurée en 3 fichiers.

## Idées pour plus tard

- Synergies entre personnages (deux archers = tir groupé).
- Objets équipables qui se transmettent d'un mort à un vivant.
- Un mode « héritage » : les morts laissent un bonus aux suivants.
- Génération de la carte du donjon avec des embranchements (à la Slay the Spire).
- Montée de niveau + changement de classe à un palier donné (à la Pokémon : un héros qui
  évolue vers une version plus forte ou différente plutôt que de juste gagner des stats).
- Une couche de quête narrative en fantasy à choix multiples entre les niveaux de combat
  (petits événements textuels avec 2-3 options, conséquences sur l'escouade ou les ressources).
- Un vrai deck de cartes qu'on construit (à la Yu-Gi-Oh/Slay the Spire) plutôt que des
  récompenses ponctuelles — piocher, drafter, construire un deck de sorts/objets réutilisable.
