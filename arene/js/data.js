/* ---------------------------------------------------------------
   Dernière Escouade — données : sprites, héros, monstres, niveaux
   Tout est en dur, aucune ressource externe.
   --------------------------------------------------------------- */

/* Les sprites sont des grilles 16x16 de caractères.
   Chaque caractère est une couleur définie dans la palette de l'unité.
   '.' = transparent.
   Une unité "humanoïde" = une tête (7 lignes) + un corps (9 lignes) + une arme. */

const CORPS = {
  humain: [
    '.....oooooo.....',
    '...osoaaaaoso...',
    '...osoaaaaoso...',
    '...osoaaaaoso...',
    '....obbbbbbo....',
    '....obbbbbbo....',
    '.....ll..ll.....',
    '.....ll..ll.....',
    '....LLL..LLL....'
  ],
  spectre: [
    '.....oooooo.....',
    '...oaoaaaaoao...',
    '...oaoaaaaoao...',
    '....oaaaaaao....',
    '....aaaaaaaa....',
    '....aaaaaaaa....',
    '.....aaaaaa.....',
    '.....a.aa.a.....',
    '................'
  ],
  masse: [   /* corps trapu : golem, ogre, slime-like */
    '...oooooooooo...',
    '..osoaaaaaaoso..',
    '..osoaaaaaaoso..',
    '..osoaaaaaaoso..',
    '...obbbbbbbbo...',
    '...obbbbbbbbo...',
    '....LL....LL....',
    '....LL....LL....',
    '...LLL....LLL...'
  ]
};

const TETES = {
  garde: [
    '................',
    '.....HHHHHH.....',
    '....HhhhhhhH....',
    '....HeeeeeeH....',
    '....HhhhhhhH....',
    '.....HhhhhH.....',
    '......ssss......'
  ],
  capuche: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hHsssssh....',
    '....hHsesesh....',
    '.....hssssh.....',
    '......ssss......'
  ],
  chapeau: [
    '.........hh.....',
    '.......hhhh.....',
    '.....hhhhh......',
    '...HHHHHHHHH....',
    '....ssessess....',
    '....sWWWWWWs....',
    '.....WWWWWW.....'
  ],
  halo: [
    '.....gggggg.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....hsessesh....',
    '....hssssssh....',
    '.....hssssh.....',
    '......ssss......'
  ],
  masque: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....ssessess....',
    '.....HHHHHH.....',
    '......ssss......'
  ],
  crete: [
    '....h..h..h.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....ssessess....',
    '....sHHHHHHs....',
    '.....sWWWWs.....',
    '......ssss......'
  ],
  pierre: [
    '................',
    '....HHHHHHHH....',
    '...HhhhhhhhhH...',
    '...HhghhhhghH...',
    '...HhhhhhhhhH...',
    '...HHhhhhhhHH...',
    '....HHHHHHHH....'
  ],
  sorciere: [
    '........hh......',
    '.......hhh......',
    '..HHHHHHHHHHH...',
    '....hssssssh....',
    '....hsessesh....',
    '....hssssssh....',
    '.....hssssh.....'
  ],
  gobelin: [
    '................',
    '...a........a...',
    '...aaaaaaaaaa...',
    '....aaaaaaaa....',
    '....aaeaaeaa....',
    '....aaaaaaaa....',
    '.....aWWWWa.....'
  ],
  crane: [
    '................',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '....WeeWWeeW....',
    '....WWWWWWWW....',
    '.....WeWeWe.....',
    '......WWWW......'
  ],
  fantome: [
    '................',
    '.....aaaaaa.....',
    '....aaaaaaaa....',
    '....aeeaaeea....',
    '....aaaaaaaa....',
    '.....aaaaaa.....',
    '......aaaa......'
  ],
  ogre: [
    '................',
    '....aaaaaaaa....',
    '...aaaaaaaaaa...',
    '...aaeaaaaeaa...',
    '...aaaaaaaaaa...',
    '...aWaaaaaaWa...',
    '....aaaaaaaa....'
  ]
};

/* Armes : petites grilles posées sur la grille 16x16 à un décalage donné. */
const ARMES = {
  epee:   { ox: 12, oy: 1, px: ['.m.','.m.','.m.','.m.','.m.','.m.','.m.','MMM','.w.','.w.','.M.'] },
  arc:    { ox: 11, oy: 3, px: ['.ww.','gw.w','g..w','g..w','g..w','g..w','g..w','gw.w','.ww.'] },
  baton:  { ox: 12, oy: 1, px: ['.g.','gWg','.g.','.w.','.w.','.w.','.w.','.w.','.w.','.w.','.w.'] },
  sceptre:{ ox: 12, oy: 2, px: ['.g.','ggg','.g.','.w.','.w.','.w.','.w.','.w.','.w.'] },
  dague:  { ox: 12, oy: 6, px: ['.m.','.m.','.m.','MMM','.w.'] },
  hache:  { ox: 11, oy: 2, px: ['.wmm','.wmm','.wm.','.w..','.w..','.w..','.w..','.w..','.w..'] },
  gourdin:{ ox: 12, oy: 3, px: ['www','www','.w.','.w.','.w.','.w.','.w.','.w.'] }
};

/* Monstres entièrement dessinés (non humanoïdes). */
const SPRITES = {
  slime: [
    '................','................','................','................',
    '................','................',
    '......aaaa......',
    '.....aaaaaa.....',
    '....aaaaaaaa....',
    '...aaWaaaaWaa...',
    '...aaeaaaaeaa...',
    '..aaaaaaaaaaaa..',
    '..aaaaaaaaaaaa..',
    '..aaaaaaaaaaaa..',
    '.bbbbbbbbbbbbbb.',
    '.bbbbbbbbbbbbbb.'
  ],
  chauvesouris: [
    '................','................',
    '.....a....a.....',
    '.....aa..aa.....',
    '....aaaaaaaa....',
    'b...aaeaaeaa...b',
    'bb..aaaaaaaa..bb',
    'bbbaaaaaaaaaabbb',
    '.bbaaaaaaaaaabb.',
    '..bbaaaaaaaabb..',
    '....aaaaaaaa....',
    '.....aaaaaa.....',
    '......aaaa......',
    '................','................','................'
  ],
  araignee: [
    '................','................','................','................',
    '................',
    'aa............aa',
    '.aa..........aa.',
    '..aa.aaaaaa.aa..',
    '...aaeaaaaeaa...',
    '..aa.aaaaaa.aa..',
    '.aa...aaaa...aa.',
    'aa...bbbbbb...aa',
    '....bbbbbbbb....',
    '....bbbbbbbb....',
    '.....bbbbbb.....',
    '................'
  ],
  dragon: [
    '................',
    '.............a..',
    '............aaa.',
    '...........aeaa.',
    '..........aaaaWW',
    '..b......aaaaa..',
    '.bbb....aaaa....',
    'bbbbb..aaaa.....',
    'bbbbbbaaaaa.....',
    '.bbbbaaaaaaa....',
    '..bbaaaaaaaaa...',
    '...aaaaaaaaaa...',
    'aa.aaaaaaaaaa...',
    '.aaaaaaaaaaa....',
    '...aa...aa......',
    '...aa...aa......'
  ]
};

/* ----------------------------- HÉROS ----------------------------- */
/* cap = capacité, résolue dans battle.js */

const HEROS = [
  { id:'garde', nom:'Garde', rar:'commun', pv:30, atq:6, vit:4, cap:'protege',
    desc:'Chaque allié subit 1 dégât de moins tant qu’il tient debout.',
    art:{ tete:'garde', corps:'humain', arme:'epee',
      pal:{ o:'#1a1320', s:'#e8b887', a:'#6b7fa8', b:'#4a5a7d', l:'#8a7a5e', L:'#5c4f3a',
            h:'#cfd6e0', H:'#8b93a3', e:'#120e18', m:'#e2e8f0', M:'#9aa3b2', w:'#6b4a2f', g:'#f0c860' } } },

  { id:'archer', nom:'Archer', rar:'commun', pv:18, atq:7, vit:8, cap:'vise_faible',
    desc:'Vise toujours l’ennemi le plus mal en point.',
    art:{ tete:'capuche', corps:'humain', arme:'arc',
      pal:{ o:'#14180f', s:'#e8b887', a:'#4e7a4a', b:'#3a5c38', l:'#6b5a3e', L:'#463a28',
            h:'#5f8f56', H:'#3f6b3a', e:'#120e18', m:'#e2e8f0', M:'#9aa3b2', w:'#8a5e34', g:'#e8e0c8' } } },

  { id:'mage', nom:'Mage', rar:'rare', pv:16, atq:5, vit:6, cap:'eclat',
    desc:'Son éclat touche tous les ennemis à la fois.',
    art:{ tete:'chapeau', corps:'humain', arme:'baton',
      pal:{ o:'#161226', s:'#e8b887', a:'#4a3f8f', b:'#332b66', l:'#4a3f8f', L:'#2a2350',
            h:'#5b4bb0', H:'#3b2f80', e:'#120e18', W:'#e6e6f2', w:'#6b4a2f', g:'#7fd8f0' } } },

  { id:'clerc', nom:'Clerc', rar:'rare', pv:22, atq:4, vit:5, cap:'soigne',
    desc:'Soigne l’allié le plus blessé au lieu de frapper.',
    art:{ tete:'halo', corps:'humain', arme:'sceptre',
      pal:{ o:'#231c12', s:'#e8b887', a:'#e2dcc8', b:'#c0b79c', l:'#c0b79c', L:'#8a8068',
            h:'#f2eeda', H:'#c8bfa2', e:'#120e18', w:'#8a5e34', g:'#f0c860' } } },

  { id:'voleur', nom:'Voleur', rar:'commun', pv:17, atq:4, vit:10, cap:'double',
    desc:'Frappe deux fois d’affilée.',
    art:{ tete:'masque', corps:'humain', arme:'dague',
      pal:{ o:'#12121a', s:'#e8b887', a:'#3c3c50', b:'#2a2a3a', l:'#2a2a3a', L:'#1c1c28',
            h:'#5a4632', H:'#8f2f3a', e:'#120e18', m:'#d8dee8', M:'#8f96a4', w:'#4a3626' } } },

  { id:'berserk', nom:'Berserk', rar:'rare', pv:24, atq:7, vit:6, cap:'rage',
    desc:'+3 ATQ dès qu’il passe sous la moitié de ses PV.',
    art:{ tete:'crete', corps:'humain', arme:'hache',
      pal:{ o:'#1c1210', s:'#e0a878', a:'#8f3a2a', b:'#6b2a1e', l:'#6b5a3e', L:'#463a28',
            h:'#d24a2a', H:'#7a3020', e:'#120e18', W:'#f0e8d8', m:'#d8dee8', w:'#6b4a2f' } } },

  { id:'golem', nom:'Golem', rar:'epique', pv:42, atq:7, vit:2, cap:'riposte',
    desc:'Renvoie 2 dégâts à qui le frappe. Très lent.',
    art:{ tete:'pierre', corps:'masse', arme:null,
      pal:{ o:'#1a1a1e', s:'#7a8288', a:'#8a9299', b:'#6a7278', l:'#6a7278', L:'#4a5258',
            h:'#9aa2a9', H:'#6a7278', e:'#120e18', g:'#7fd8f0' } } },

  { id:'sorciere', nom:'Sorcière', rar:'epique', pv:17, atq:5, vit:7, cap:'poison',
    desc:'Empoisonne : 2 dégâts par tour pendant 3 tours.',
    art:{ tete:'sorciere', corps:'humain', arme:'baton',
      pal:{ o:'#16101c', s:'#e0c0a0', a:'#3a2a50', b:'#281c3a', l:'#281c3a', L:'#1a1228',
            h:'#2a1f3c', H:'#1e1630', e:'#120e18', W:'#c8f0a0', w:'#4a3626', g:'#8ce05a' } } }
];

/* --------------------------- MONSTRES --------------------------- */

const MONSTRES = {
  slime:    { nom:'Gluant', pv:14, atq:3, vit:3, cap:null, echelle:3,
    art:{ sprite:'slime', pal:{ a:'#5ec27a', b:'#3d8a54', W:'#f2f7f0', e:'#12200f' } } },

  rat:      { nom:'Chauve-souris', pv:10, atq:4, vit:9, cap:null, echelle:3,
    art:{ sprite:'chauvesouris', pal:{ a:'#8a6a4a', b:'#4a3628', e:'#f0d060' } } },

  araignee: { nom:'Araignée', pv:16, atq:4, vit:7, cap:'poison', echelle:3,
    art:{ sprite:'araignee', pal:{ a:'#6a4a7a', b:'#2a1c34', e:'#f05a4a' } } },

  gobelin:  { nom:'Gobelin', pv:18, atq:5, vit:6, cap:null, echelle:3,
    art:{ tete:'gobelin', corps:'humain', arme:'dague',
      pal:{ o:'#14200f', s:'#6aa84f', a:'#6aa84f', b:'#5a4632', l:'#5a4632', L:'#3a2c20',
            e:'#f05a4a', W:'#f0eede', m:'#c8ced8', M:'#8a919c', w:'#4a3626' } } },

  squelette:{ nom:'Squelette', pv:20, atq:6, vit:5, cap:null, echelle:3,
    art:{ tete:'crane', corps:'humain', arme:'epee',
      pal:{ o:'#1a1a18', s:'#e8e4d2', a:'#6a6a60', b:'#4a4a42', l:'#4a4a42', L:'#32322c',
            W:'#e8e4d2', e:'#12100e', m:'#c8ced8', M:'#8a919c', w:'#4a3626' } } },

  spectre:  { nom:'Spectre', pv:22, atq:6, vit:8, cap:'vise_faible', echelle:3,
    art:{ tete:'fantome', corps:'spectre', arme:null,
      pal:{ o:'#243040', s:'#a8d0e8', a:'#8ab8d8', b:'#5f8fae', e:'#0e1a28' } } },

  brute:    { nom:'Brute', pv:30, atq:7, vit:4, cap:'riposte', echelle:3,
    art:{ tete:'ogre', corps:'masse', arme:'gourdin',
      pal:{ o:'#1e1810', s:'#b08a5a', a:'#b08a5a', b:'#6b4a2f', l:'#6b4a2f', L:'#463020',
            e:'#f0d060', W:'#f0eede', w:'#7a5636' } } },

  ogre:     { nom:'Ogre Roi', pv:52, atq:9, vit:4, cap:'riposte', echelle:4, boss:true,
    art:{ tete:'ogre', corps:'masse', arme:'hache',
      pal:{ o:'#1a2018', s:'#7a9a5a', a:'#7a9a5a', b:'#4a6038', l:'#4a6038', L:'#2e3c24',
            e:'#f05a4a', W:'#f0eede', m:'#d8dee8', M:'#8a919c', w:'#5a4028' } } },

  dragon:   { nom:'Dragon Cendré', pv:100, atq:10, vit:5, cap:'eclat', echelle:4, boss:true,
    art:{ sprite:'dragon', pal:{ a:'#b03a2a', b:'#5e1e18', e:'#f5d020', W:'#f5f0e0' } } }
};

/* ---------------------------- NIVEAUX ---------------------------- */

const NIVEAUX = [
  { nom:'Le Sentier',        biome:'foret',  ennemis:['slime','slime'] },
  { nom:'Sous les Fougères', biome:'foret',  ennemis:['slime','rat','rat'] },
  { nom:'La Clairière',      biome:'foret',  ennemis:['gobelin','slime','rat'] },
  { nom:'Le Vieux Pont',     biome:'foret',  ennemis:['gobelin','gobelin','araignee'] },
  { nom:'La Fosse',          biome:'crypte', ennemis:['brute','gobelin','slime'] },
  { nom:'L’Ossuaire',        biome:'crypte', ennemis:['squelette','squelette','rat'] },
  { nom:'La Salle Basse',    biome:'crypte', ennemis:['squelette','spectre','squelette'] },
  { nom:'Le Trône Brisé',    biome:'crypte', ennemis:['ogre','slime'] },
  { nom:'Les Braises',       biome:'cendre', ennemis:['brute','spectre','rat'] },
  { nom:'Le Couloir Ardent', biome:'cendre', ennemis:['spectre','araignee','araignee'] },
  { nom:'L’Antichambre',     biome:'cendre', ennemis:['brute','brute','spectre'] },
  { nom:'Le Nid de Cendres', biome:'cendre', ennemis:['dragon'] }
];

/* ---------------------------- RELIQUES --------------------------- */

const RELIQUES = [
  { id:'banniere', nom:'Bannière Usée',   txt:'+1 ATQ pour toute l’escouade.' },
  { id:'talisman', nom:'Talisman de Fer', txt:'+4 PV max pour toute l’escouade.' },
  { id:'camp',     nom:'Feu de Camp',     txt:'Soigne 5 PV à tout le monde après chaque combat.' },
  { id:'etendard', nom:'Étendard',        txt:'Un emplacement de déploiement en plus.' },
  { id:'bottes',   nom:'Bottes Légères',  txt:'+2 VIT pour toute l’escouade.' }
];
