/** Écran de fin de run : victoire (boss battu) ou défaite. */

function afficherEcranFin(victoire) {
  afficherEcran('fin');

  R.record = Math.max(R.record || 0, R.etage);
  sauvegarderRun(R);

  $('#titre-fin').textContent = victoire ? 'Le Bibliothécaire est tombé' : 'Le grimoire se referme';
  $('#texte-fin').textContent = victoire
    ? 'Tu as traversé tout le donjon. Une nouvelle run t’attend, avec un deck tout neuf.'
    : 'Ta run s’arrête ici. Le deck ne compte pas : chaque run recommence de zéro.';

  const details = $('#details-fin');
  details.innerHTML = '';
  details.appendChild(ligneDetail('Étages franchis', R.etage + ' / ' + R.planEtages.length));
  details.appendChild(ligneDetail('Cartes dans le deck', String(R.deck.length)));
  details.appendChild(ligneDetail('Reliques trouvées', String(R.reliques.length)));
  details.appendChild(ligneDetail('Meilleur score', String(R.record)));
}

function ligneDetail(label, valeur) {
  const d = document.createElement('div');
  d.textContent = label + ' : ' + valeur;
  return d;
}
