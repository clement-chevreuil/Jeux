/** Lame rouillée, tenue par le squelette (superposée via Sprite.superposer). */
Lutin.enregistrer('lame_rouillee', Lutin.sprite({
  nom: 'lame_rouillee',
  palette: {
    m: '#b0603a',
    M: '#8a6a2a',
    w: '#4a3626'
  },
  grille: [
    '.m.',
    '.m.',
    '.m.',
    '.m.',
    'mmm',
    '.M.',
    '.M.',
    '.w.'
  ]
}));

/** Position de la lame sur la grille du squelette (voir squelette.js). */
const SQUELETTE_ARME_OX = 15;
const SQUELETTE_ARME_OY = 2;
