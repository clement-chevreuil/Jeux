/**
 * Feu de camp : se soigner, ou améliorer une carte du deck. Un seul des deux, puis retour à la carte.
 */

function afficherEcranRepos() {
  afficherEcran('repos');

  $('#bouton-repos-soigner').onclick = () => {
    R.pv = Math.min(R.pvMax, R.pv + Math.round(R.pvMax * 0.3));
    sauvegarderRun(R);
    afficherEcranCarte();
  };

  dessinerChoixAmelioration();
}

function dessinerChoixAmelioration() {
  const zone = $('#repos-amelioration');
  zone.innerHTML = '';

  const idsUniques = R.deck.filter((id, i) => R.deck.indexOf(id) === i);
  const ameliorables = idsUniques.filter(carteEstAmeliorable);

  if (!ameliorables.length) {
    zone.appendChild(texteVide('Aucune carte à améliorer pour l’instant.'));
    return;
  }

  ameliorables.forEach(id => {
    zone.appendChild(creerCarteDOM(id, { onClick: () => ameliorerEtContinuer(id) }));
  });
}

function ameliorerEtContinuer(idBase) {
  const idAmeliore = genererCarteAmelioree(idBase);
  const position = R.deck.indexOf(idBase);
  R.deck[position] = idAmeliore;
  sauvegarderRun(R);
  afficherEcranCarte();
}
