/**
 * Petit événement narratif : un texte, deux choix, chacun avec ses conséquences.
 */

function afficherEcranEvenement() {
  const evenement = tirerEvenement(R.evenementsVus);
  R.evenementsVus.push(evenement.id);

  afficherEcran('evenement');
  $('#titre-evenement').textContent = evenement.titre;
  $('#texte-evenement').textContent = evenement.texte;

  const zone = $('#choix-evenement');
  zone.innerHTML = '';
  evenement.choix.forEach(choix => {
    const bouton = document.createElement('button');
    bouton.className = 'btn choix-evenement-bouton';
    bouton.textContent = choix.texte;
    bouton.onclick = () => appliquerChoixEvenement(choix.consequences);
    zone.appendChild(bouton);
  });
}

function appliquerChoixEvenement(consequences) {
  let demandeCarte = false;

  consequences.forEach(c => {
    if (c.type === 'soin') R.pv = Math.min(R.pvMax, R.pv + c.valeur);
    else if (c.type === 'pv_perdus') R.pv = Math.max(1, R.pv - c.valeur);
    else if (c.type === 'relique' && R.reliques.indexOf(c.id) < 0) R.reliques.push(c.id);
    else if (c.type === 'carte_choix') demandeCarte = true;
  });

  sauvegarderRun(R);
  if (demandeCarte) return afficherEcranRecompense({ mode: 'carte', sansCombat: true });
  afficherEcranCarte();
}
