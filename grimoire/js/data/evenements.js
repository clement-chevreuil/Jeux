/**
 * Événements narratifs : un texte, 2 ou 3 choix, chaque choix a des conséquences.
 * `consequence` est appliquée directement sur l'état de la run (voir moteur/rencontre.js).
 * Les conséquences possibles : soin, pv_perdus, carte(id), relique(id), or (non utilisé pour l'instant).
 */

const EVENEMENTS = [
  {
    id: 'lutrin',
    titre: 'Le Lutrin Oublié',
    texte: 'Un lutrin de pierre porte une page arrachée. Une odeur de cendre s’en dégage.',
    choix: [
      { texte: 'Lire la page à voix haute', consequences: [{ type: 'carte_choix' }] },
      { texte: 'La brûler par prudence', consequences: [{ type: 'soin', valeur: 6 }] }
    ]
  },
  {
    id: 'fontaine',
    titre: 'La Fontaine Trouble',
    texte: 'Une fontaine tarie garde encore un fond d’eau noire, presque huileuse.',
    choix: [
      { texte: 'En boire', consequences: [{ type: 'soin', valeur: 10 }, { type: 'pv_perdus', valeur: 3 }] },
      { texte: 'Y jeter une pièce et repartir', consequences: [{ type: 'relique', id: 'fiole_de_vigueur' }] }
    ]
  },
  {
    id: 'squelette_assis',
    titre: 'Le Copiste Immobile',
    texte: 'Un squelette encore assis tient une plume. Ses os ne bougent plus, mais son grimoire semble vivant.',
    choix: [
      { texte: 'Prendre le grimoire', consequences: [{ type: 'relique', id: 'encre_infinie' }] },
      { texte: 'Le laisser reposer', consequences: [{ type: 'soin', valeur: 8 }] }
    ]
  },
  {
    id: 'miroir',
    titre: 'Le Miroir Fendu',
    texte: 'Un miroir montre un reflet légèrement en retard sur tes gestes.',
    choix: [
      { texte: 'Le briser', consequences: [{ type: 'pv_perdus', valeur: 5 }, { type: 'carte_choix' }] },
      { texte: 'Partir sans le toucher', consequences: [] }
    ]
  }
];
