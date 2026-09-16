/**
 * Reliques : bonus passifs trouvés en élite ou en événement, valables toute la run.
 * `applique` est lue par le moteur de combat au bon moment (voir moteur/combat.js).
 */

const RELIQUES = {
  coeur_de_braise: {
    nom: 'Cœur de Braise', icone: '🔥',
    description: '+2 énergie au premier tour de chaque combat.'
  },
  encre_infinie: {
    nom: 'Encre Infinie', icone: '🖋️',
    description: '+1 carte piochée à chaque tour.'
  },
  amulette_de_survie: {
    nom: 'Amulette de Survie', icone: '🛡️',
    description: '+15 PV maximum.'
  },
  grimoire_leger: {
    nom: 'Grimoire Léger', icone: '📖',
    description: 'La première carte jouée chaque tour ne coûte rien.'
  },
  fiole_de_vigueur: {
    nom: 'Fiole de Vigueur', icone: '🧪',
    description: 'Soigne 8 PV après chaque combat gagné.'
  }
};
