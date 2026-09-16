/**
 * Catalogue des ennemis. `intentions` est le cycle d'actions que l'ennemi répète
 * (il recommence au début une fois arrivé au bout). Chaque action a un type :
 *   attaque(valeur)        inflige des dégâts au joueur
 *   attaque_multi(valeur, fois)  plusieurs petits coups
 *   defense(valeur)        l'ennemi gagne du bloc
 *   buff(effet)            l'ennemi s'applique un effet à lui-même (ex. Force)
 *   debuff(effet)          l'ennemi applique un effet au joueur (ex. Faible)
 */

const ENNEMIS = {

  gobelin: {
    nom: 'Gobelin Griffu', pv: 12, palier: 'normal',
    aspect: { forme: 'gobelin',
      pal: { a: '#5c8f4a', e: '#e05a4a', W: '#f0eede', L: '#5a4632', w: '#6b4a2f' } },
    intentions: [
      { type: 'attaque', valeur: 5 },
      { type: 'attaque', valeur: 5 },
      { type: 'attaque_multi', valeur: 3, fois: 2 }
    ]
  },

  chauve_rat: {
    nom: 'Rat Nécrophage', pv: 10, palier: 'normal',
    aspect: { forme: 'chauve_rat',
      pal: { a: '#6a4a3a', e: '#f0d060', b: '#2a1c14' } },
    intentions: [
      { type: 'attaque', valeur: 4 },
      { type: 'attaque', valeur: 4 },
      { type: 'debuff', effet: { type: 'faible', valeur: 1 } }
    ]
  },

  araignee: {
    nom: 'Araignée Tisseuse', pv: 15, palier: 'normal',
    aspect: { forme: 'araignee',
      pal: { a: '#5a3a6e', e: '#e05a4a', b: '#8a7a9a', W: '#e8e4d2' } },
    intentions: [
      { type: 'attaque', valeur: 6 },
      { type: 'debuff', effet: { type: 'poison', valeur: 3 } },
      { type: 'defense', valeur: 6 }
    ]
  },

  squelette: {
    nom: 'Squelette Rouillé', pv: 17, palier: 'normal',
    aspect: { forme: 'squelette', objet: 'lame_rouillee',
      pal: { W: '#e8e4d2', l: '#6a6a60', L: '#4a4a42', e: '#12100e',
             m: '#b0603a', M: '#8a6a2a', w: '#4a3626' } },
    intentions: [
      { type: 'defense', valeur: 8 },
      { type: 'attaque', valeur: 10 }
    ]
  },

  golem: {
    nom: 'Golem de Grimoire', pv: 45, palier: 'elite',
    aspect: { forme: 'golem',
      pal: { H: '#8a92a0', h: '#6a7280', g: '#7fe0ff' } },
    intentions: [
      { type: 'attaque', valeur: 12 },
      { type: 'buff', effet: { type: 'force', valeur: 3 } },
      { type: 'attaque', valeur: 12 }
    ]
  },

  spectre: {
    nom: 'Spectre Enchaîné', pv: 38, palier: 'elite',
    aspect: { forme: 'spectre',
      pal: { a: '#6ab8c0', e: '#eafcff', s: '#3a7078', l: '#8a8a90' } },
    intentions: [
      { type: 'debuff', effet: { type: 'vulnerable', valeur: 2 } },
      { type: 'attaque', valeur: 10 },
      { type: 'attaque', valeur: 10 }
    ]
  },

  bibliothecaire: {
    nom: 'Le Bibliothécaire Damné', pv: 80, palier: 'boss',
    aspect: { forme: 'bibliothecaire',
      pal: { h: '#1c1428', g: '#f0c860', e: '#ff5a4a', b: '#3a1c2a',
             W: '#f0ecda', a: '#2a1420', L: '#4a2c3a' } },
    intentions: [
      { type: 'attaque', valeur: 14 },
      { type: 'debuff', effet: { type: 'faible', valeur: 2 } },
      { type: 'debuff', effet: { type: 'vulnerable', valeur: 2 } },
      { type: 'attaque', valeur: 14 },
      { type: 'defense', valeur: 15 }
    ]
  }
};

/** Grandit doucement les PV d'un ennemi selon l'étage du donjon (les combats se corsent). */
function pvAjustes(id, etage) {
  const base = ENNEMIS[id].pv;
  return Math.round(base * (1 + Math.max(0, etage - 1) * 0.05));
}
