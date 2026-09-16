/** Petite barre de progression (PV, bloc, énergie...) réutilisée un peu partout. */

/**
 * Crée une barre. `valeur`/`max` donnent le remplissage, `classe` choisit la couleur via CSS.
 */
function creerBarre(valeur, max, classe) {
  const barre = document.createElement('div');
  barre.className = 'barre ' + classe;
  const remplissage = document.createElement('div');
  remplissage.className = 'barre-remplissage';
  remplissage.style.width = Math.max(0, Math.min(100, 100 * valeur / max)) + '%';
  barre.appendChild(remplissage);
  return barre;
}
