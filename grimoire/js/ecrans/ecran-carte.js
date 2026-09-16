/**
 * Écran de la carte du donjon : montre l'étage courant et les lieux possibles.
 * Choisir un lieu tire son contenu au sort puis lance l'écran correspondant.
 */

function afficherEcranCarte() {
  afficherEcran('carte');

  const etage = R.planEtages[R.etage];
  $('#numero-etage').textContent = 'Étage ' + (R.etage + 1) + ' / ' + R.planEtages.length;
  $('#pv-carte').textContent = R.pv + ' / ' + R.pvMax + ' PV';
  $('#taille-deck').textContent = R.deck.length + ' cartes';

  const zoneReliques = $('#reliques-carte');
  zoneReliques.innerHTML = '';
  if (!R.reliques.length) zoneReliques.appendChild(texteVide('Aucune relique pour l’instant.'));
  R.reliques.forEach(id => {
    const r = RELIQUES[id];
    const span = document.createElement('span');
    span.className = 'relique-badge';
    span.title = r.description;
    span.textContent = r.icone + ' ' + r.nom;
    zoneReliques.appendChild(span);
  });

  const zoneNoeuds = $('#noeuds-carte');
  zoneNoeuds.innerHTML = '';
  etage.options.forEach(type => {
    zoneNoeuds.appendChild(creerNoeudDOM(type, () => choisirLieu(type)));
  });
}

function texteVide(texte) {
  const p = document.createElement('span');
  p.className = 'texte-vide';
  p.textContent = texte;
  return p;
}

function choisirLieu(type) {
  R.etage++;
  sauvegarderRun(R);

  if (type === 'combat') return lancerCombat(tirerGroupeCombat(R.dernierGroupeCombat), 'combat');
  if (type === 'elite') return lancerCombat(tirerGroupeElite(), 'elite');
  if (type === 'boss') return lancerCombat(GROUPE_BOSS.slice(), 'boss');
  if (type === 'repos') return afficherEcranRepos();
  if (type === 'evenement') return afficherEcranEvenement();
}

function lancerCombat(idsEnnemis, palier) {
  R.dernierGroupeCombat = idsEnnemis;
  C = demarrerCombat(R, idsEnnemis, R.etage);
  C.palier = palier;
  afficherEcranCombat();
}
