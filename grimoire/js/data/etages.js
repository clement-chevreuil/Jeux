/**
 * Plan des étages du donjon. Chaque étage propose un petit nombre de types de
 * lieux au choix (souvent 2 ou 3) ; le joueur avance étage par étage.
 * Un seul type dans la liste = pas vraiment de choix, mais on garde la même forme.
 */

const PLAN_ETAGES = [
  { options: ['combat'] },
  { options: ['combat', 'evenement'] },
  { options: ['combat', 'evenement', 'repos'] },
  { options: ['combat', 'elite'] },
  { options: ['combat', 'evenement', 'repos'] },
  { options: ['combat', 'elite', 'evenement'] },
  { options: ['combat', 'repos'] },
  { options: ['combat', 'evenement', 'elite'] },
  { options: ['repos'] },
  { options: ['boss'] }
];

/** Ennemis normaux possibles, groupés par 1 ou 2 pour varier les combats de base. */
const GROUPES_COMBAT = [
  ['gobelin'], ['chauve_rat'], ['araignee'], ['squelette'],
  ['gobelin', 'chauve_rat'], ['araignee', 'chauve_rat'], ['gobelin', 'squelette']
];

const GROUPES_ELITE = [['golem'], ['spectre']];
const GROUPE_BOSS = ['bibliothecaire'];
