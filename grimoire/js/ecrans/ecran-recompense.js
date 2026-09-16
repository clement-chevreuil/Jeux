/**
 * Écran de récompense : soit 3 cartes au choix (combat normal), soit 2 reliques
 * (combat d'élite). `apresChoix` dit où aller ensuite (la carte du donjon par défaut).
 */

function afficherEcranRecompense(config) {
  config = config || {};
  const apresChoix = config.apresChoix || afficherEcranCarte;

  if (config.mode === 'relique') return afficherChoixReliques(apresChoix);
  return afficherChoixCartes(apresChoix, !!config.sansCombat);
}

function afficherChoixCartes(apresChoix, sansCombat) {
  afficherEcran('recompense');
  $('#titre-recompense').textContent = 'Choisis une carte';

  const pool = melanger(cartesDeRecompense()).slice(0, 3);
  const zone = $('#choix-recompense');
  zone.innerHTML = '';
  pool.forEach(id => {
    zone.appendChild(creerCarteDOM(id, {
      onClick: () => { R.deck.push(id); sauvegarderRun(R); apresChoix(); }
    }));
  });

  const passer = $('#bouton-passer-recompense');
  passer.style.display = sansCombat ? 'none' : '';
  passer.onclick = apresChoix;
}

function afficherChoixReliques(apresChoix) {
  afficherEcran('recompense');
  $('#titre-recompense').textContent = 'Une relique t’attend';

  const disponibles = melanger(Object.keys(RELIQUES).filter(id => R.reliques.indexOf(id) < 0));
  const zone = $('#choix-recompense');
  zone.innerHTML = '';

  if (!disponibles.length) {
    zone.appendChild(texteVide('Tu possèdes déjà toutes les reliques.'));
  }
  disponibles.slice(0, 2).forEach(id => {
    const r = RELIQUES[id];
    const carte = document.createElement('div');
    carte.className = 'carte carte-relique';
    carte.innerHTML =
      '<div class="carte-icone">' + r.icone + '</div>' +
      '<div class="carte-nom">' + r.nom + '</div>' +
      '<div class="carte-description">' + r.description + '</div>';
    carte.addEventListener('click', () => prendreRelique(id, apresChoix));
    zone.appendChild(carte);
  });

  $('#bouton-passer-recompense').style.display = '';
  $('#bouton-passer-recompense').onclick = apresChoix;
}

function prendreRelique(id, apresChoix) {
  R.reliques.push(id);
  if (id === 'amulette_de_survie') { R.pvMax += 15; R.pv += 15; }
  sauvegarderRun(R);
  apresChoix();
}
