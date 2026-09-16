/**
 * Point d'entrée : état global (R = la run, C = le combat en cours), petits
 * outils DOM partagés, et démarrage de la page.
 */

let R = null;
let C = null;

function $(sel) { return document.querySelector(sel); }

/** Montre l'écran demandé, cache tous les autres. */
function afficherEcran(nom) {
  document.querySelectorAll('.ecran').forEach(e => {
    e.classList.toggle('actif', e.id === 'ecran-' + nom);
  });
}

function demarrerNouvelleRun() {
  const record = R ? R.record : (chargerRun() || {}).record || 0;
  R = nouvelleRun(record);
  sauvegarderRun(R);
  afficherEcranCarte();
}

function init() {
  R = chargerRun();
  if (!R) R = nouvelleRun(0);

  document.body.dataset.biome = 'donjon';
  $('#bouton-fin-tour').onclick = finirLeTour;
  $('#bouton-nouvelle-run').onclick = demarrerNouvelleRun;
  $('#bouton-abandonner').onclick = () => {
    if (confirm('Abandonner cette run et repartir de zéro ?')) demarrerNouvelleRun();
  };
  $('#bouton-aide').onclick = () => $('#aide').classList.add('ouvert');
  $('#aide').onclick = (e) => {
    if (e.target.id === 'aide' || e.target.id === 'aide-fermer') $('#aide').classList.remove('ouvert');
  };

  afficherEcranCarte();
}

document.addEventListener('DOMContentLoaded', init);
