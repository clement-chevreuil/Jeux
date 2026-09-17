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
    aspect: Lutin.obtenir('gobelin'),
    intentions: [
      { type: 'attaque', valeur: 5 },
      { type: 'attaque', valeur: 5 },
      { type: 'attaque_multi', valeur: 3, fois: 2 }
    ]
  },

  chauve_rat: {
    nom: 'Rat Nécrophage', pv: 10, palier: 'normal',
    aspect: Lutin.obtenir('chauve_rat'),
    intentions: [
      { type: 'attaque', valeur: 4 },
      { type: 'attaque', valeur: 4 },
      { type: 'debuff', effet: { type: 'faible', valeur: 1 } }
    ]
  },

  araignee: {
    nom: 'Araignée Tisseuse', pv: 15, palier: 'normal',
    aspect: Lutin.obtenir('araignee'),
    intentions: [
      { type: 'attaque', valeur: 6 },
      { type: 'debuff', effet: { type: 'poison', valeur: 3 } },
      { type: 'defense', valeur: 6 }
    ]
  },

  squelette: {
    nom: 'Squelette Rouillé', pv: 17, palier: 'normal',
    aspect: Lutin.obtenir('squelette').superposer(Lutin.obtenir('lame_rouillee'), SQUELETTE_ARME_OX, SQUELETTE_ARME_OY),
    intentions: [
      { type: 'defense', valeur: 8 },
      { type: 'attaque', valeur: 10 }
    ]
  },

  golem: {
    nom: 'Golem de Grimoire', pv: 45, palier: 'elite',
    aspect: Lutin.obtenir('golem'),
    intentions: [
      { type: 'attaque', valeur: 12 },
      { type: 'buff', effet: { type: 'force', valeur: 3 } },
      { type: 'attaque', valeur: 12 }
    ]
  },

  spectre: {
    nom: 'Spectre Enchaîné', pv: 38, palier: 'elite',
    aspect: Lutin.obtenir('spectre'),
    intentions: [
      { type: 'debuff', effet: { type: 'vulnerable', valeur: 2 } },
      { type: 'attaque', valeur: 10 },
      { type: 'attaque', valeur: 10 }
    ]
  },

  bibliothecaire: {
    nom: 'Le Bibliothécaire Damné', pv: 80, palier: 'boss',
    aspect: Lutin.obtenir('bibliothecaire'),
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
