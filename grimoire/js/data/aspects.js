/**
 * Grilles de pixels (24 colonnes) et palettes de couleurs du jeu.
 * Chaque forme est une liste de lignes de 24 caractères. Un point '.' est transparent,
 * les autres lettres sont peintes selon la palette de chaque personnage (voir cartes/ennemis).
 */

const TETES = {
  sorcier: [
    '...........hh...........',
    '..........hhhh..........',
    '.........hhhhhh.........',
    '........hhhhhhhh........',
    '.......hhsssssshh.......',
    '.......hseesseesh.......',
    '.......hssssssssh.......',
    '.......hssssssssh.......',
    '........hssssssh........',
    '.........hhhhhh.........'
  ],
  gobelin: [
    '........................',
    'aa......aaaaaaaa......aa',
    'aaaa....aaaaaaaa....aaaa',
    '.aaaaaaaaaaaaaaaaaaaaaa.',
    '.aaaaeeeaaaaaaaaeeeaaaa.',
    '.aaaaaaaaaaaaaaaaaaaaaa.',
    '..aaWWaaWWaaaaWWaaWWaa..',
    '..aaaaaaaaaaaaaaaaaaaa..'
  ],
  squelette: [
    '........................',
    '........WWWWWWWW........',
    '.......WWWWWWWWWW.......',
    '.......WWeeWWeeWW.......',
    '.......WWWWWWWWWW.......',
    '........WWeWWeWW........',
    '.........WWWWWW.........',
    '..........WWWW..........'
  ],
  golem: [
    '........................',
    '.....HHHHHHHHHHHHHH.....',
    '....HhhhhhhhhhhhhhhH....',
    '....HhhhhgHHHHghhhhH....',
    '....HhhhhhhhhhhhhhhH....',
    '.....HHhhhhhhhhhhHH.....',
    '......HHHHHHHHHHHH......'
  ],
  bibliothecaire: [
    '...........hh...........',
    '..........hhhh..........',
    '.........hhhhhh.........',
    '........hhhhhhhh........',
    '.......hhhhhhhhhh.......',
    '.......hggeeeeggh.......',
    '.......hggeeeeggh.......',
    '.......hggggggggh.......',
    '........hggggggh........',
    '.........hhhhhh.........'
  ],
};

const CORPS = {
  robe: [
    '........bbaaaabb........',
    '.......bbaaaaaabb.......',
    '......bbaaaaaaaabb......',
    '.....bbaaaaaaaaaabb.....',
    '.....baaaaaaaaaaaab.....',
    '.....baaaLLLLLLaaab.....',
    '.....baaaLLggLLaaab.....',
    '.....baaaLLLLLLaaab.....',
    '.....baaaaaaaaaaaab.....',
    '.....baaaaaaaaaaaab.....',
    '....bbaaaaaaaaaaaabb....',
    '...bbaaaaaaaaaaaaaabb...',
    '..bbbaaaaaaaaaaaaaabbb..',
    '.bbbbaaaaaaaaaaaaaabbbb.',
    'bbbbbbbbbbbbbbbbbbbbbbbb',
    '......bbbb....bbbb......',
    '......bbbb....bbbb......',
    '......LLLL....LLLL......'
  ],
  gobelin: [
    '...aaaaaa......aaaaaa...',
    '..aaaaaaaaaaaaaaaaaaaa..',
    '..aaLLaaaaaaaaaaaaLLaa..',
    '..aaLLaaaaaaaaaaaaLLaa..',
    '..aaaaaaaaaaaaaaaaaaaa..',
    '..wwaaaaaaaaaaaaaaaaww..',
    '...aaa............aaa...',
    '...LLL............LLL...'
  ],
  squelette: [
    '.......WWWWWWWWWW.......',
    '......WWllWWWWllWW......',
    '.......WWWWWWWWWW.......',
    '........lWWWWWWl........',
    '........WWWWWWWW........',
    '........lWWWWWWl........',
    '........WWWWWWWW........',
    '.......WWW....WWW.......',
    '.......WWW....WWW.......',
    '......LLL......LLL......'
  ],
  golem: [
    '.....HHHHHHHHHHHHHH.....',
    '....hhhhhhhhhhhhhhhh....',
    '....hhggHHHHHHHHgghh....',
    '....hhHHHHHHHHHHHHhh....',
    '....hhhhhhhhhhhhhhhh....',
    '.....HHHHHHHHHHHHHH.....',
    '......hh........hh......',
    '......hh........hh......',
    '......HH........HH......'
  ],
  bibliothecaire: [
    '......bbhhhhhhhhbb......',
    '.....bbhhhhhhhhhhbb.....',
    '....bbbWWW....WWWbbb....',
    '....bbWWgg....ggWWbb....',
    '....bbWWggggggggWWbb....',
    '....bbWWgg....ggWWbb....',
    '....bbbWWW....WWWbbb....',
    '.....bbbbbbbbbbbbbb.....',
    '.....bbaaaaaaaaaabb.....',
    '.....bbaaaaaaaaaabb.....',
    '....bbaaaaaaaaaaaabb....',
    '...bbbaaaaaaaaaaaabbb...',
    '..bbbaaaaaaaaaaaaaaaabbb',
    '......bbbb....bbbb......',
    '......LLLL....LLLL......'
  ],
};

/** Formes complètes non-humanoïdes (dessinées d'une seule pièce). */
const SILHOUETTES = {
  chauve_rat: [
    '........................',
    '...........aa...........',
    '..........aaaa..........',
    'bbb......aaaaaa......bbb',
    'bb......aaaaaaaa......bb',
    'bbbb...aaeeaaeeaa...bbbb',
    'bbbb...aaaaaaaaaa...bbbb',
    'bbb...aaaaaaaaaaaa...bbb',
    'bb...aaaaaaaaaaaaaa...bb',
    '.........aaaaaa.........',
    '..........aaaa..........',
    '...........aa...........',
    '........................'
  ],
  araignee: [
    '........................',
    '..b..................b..',
    '...bb..............bb...',
    '....bb..aaaaaaaa..bb....',
    '....b..aaeeaaeeaa..b....',
    'bb..aaaaaaaaaaaaaaaa..bb',
    'b...aaaaaaaaaaaaaaaa...b',
    '..b..aaaaaaaaaaaaaa..b..',
    '.....aaaaaaaaaaaaaa.....',
    '......WWW......WWW......',
    '.......bb......bb.......',
    '........................'
  ],
  spectre: [
    '........................',
    '........aaaaaaaa........',
    '......aaaaaaaaaaaa......',
    '......aaesaaaaseaa......',
    '......aaaaaaaaaaaa......',
    '.......aaaaaaaaaa.......',
    '.........aaaaaa.........',
    '......l....aa....l......',
    '........................',
    '........................'
  ],
};

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
