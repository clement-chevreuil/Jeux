/** Affiche une carte : dans la main, en récompense, ou dans la liste du deck. */

const ICONE_TYPE = { attaque: '⚔️', competence: '🛡️', pouvoir: '✨' };

/**
 * Construit l'élément DOM d'une carte. `options.jouable` grise la carte si on n'a pas
 * assez d'énergie. `options.onClick` est appelé au clic.
 */
function creerCarteDOM(idCarte, options) {
  options = options || {};
  const carte = CARTES[idCarte];
  const el = document.createElement('div');
  el.className = 'carte carte-' + carte.type + ' rarete-' + carte.rarete;
  if (options.jouable === false) el.classList.add('carte-grisee');

  const cout = document.createElement('div');
  cout.className = 'carte-cout';
  cout.textContent = options.coutAffiche != null ? options.coutAffiche : carte.cout;
  el.appendChild(cout);

  const icone = document.createElement('div');
  icone.className = 'carte-icone';
  icone.textContent = ICONE_TYPE[carte.type] || '?';
  el.appendChild(icone);

  const nom = document.createElement('div');
  nom.className = 'carte-nom';
  nom.textContent = carte.nom;
  el.appendChild(nom);

  const desc = document.createElement('div');
  desc.className = 'carte-description';
  desc.textContent = carte.description;
  el.appendChild(desc);

  if (options.onClick) el.addEventListener('click', options.onClick);
  return el;
}
