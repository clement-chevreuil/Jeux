/** Un bouton représentant un lieu possible sur la carte du donjon. */

const ICONE_NOEUD = {
  combat: '⚔️', elite: '💀', repos: '🔥', evenement: '❓', boss: '📖'
};
const LABEL_NOEUD = {
  combat: 'Combat', elite: 'Combat d’élite', repos: 'Feu de camp', evenement: 'Lieu étrange', boss: 'Le Bibliothécaire'
};

function creerNoeudDOM(type, onClick) {
  const bouton = document.createElement('button');
  bouton.className = 'noeud noeud-' + type;
  const icone = document.createElement('div');
  icone.className = 'noeud-icone';
  icone.textContent = ICONE_NOEUD[type] || '?';
  bouton.appendChild(icone);
  const label = document.createElement('div');
  label.className = 'noeud-label';
  label.textContent = LABEL_NOEUD[type] || type;
  bouton.appendChild(label);
  bouton.addEventListener('click', onClick);
  return bouton;
}
