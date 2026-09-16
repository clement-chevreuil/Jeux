/**
 * Registre des formes (sprites) du jeu. Chaque personnage ajoute sa grille
 * ici depuis son propre fichier dans data/sprites/ (une ligne par entrée,
 * même longueur pour toutes les lignes). Un point '.' est transparent,
 * les autres lettres sont peintes selon la palette de chaque personnage
 * (voir heros.js / ennemis.js).
 */
const FORMES = {};

/**
 * Armes/objets superposés sur la grille de base, à une position donnée (ox, oy).
 * `px` est une petite grille dessinée par-dessus le personnage.
 */
const OBJETS = {
  baton: {
    ox: 17, oy: 3,
    px: ['.g.', 'ggg', '.g.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.',
         '.L.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.', '.L.']
  },
  lame_rouillee: {
    ox: 15, oy: 2,
    px: ['.m.', '.m.', '.m.', '.m.', 'mmm', '.M.', '.M.', '.w.']
  }
};
