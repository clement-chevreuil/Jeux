/** Lit et écrit l'état de la run dans le localStorage. Aucun réseau, tout reste sur la machine. */

const CLE_SAUVEGARDE = 'grimoire.sorcier-errant.v1';

function sauvegarderRun(R) {
  try {
    localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(R));
  } catch (e) { /* stockage indisponible (navigation privée) : on continue sans sauvegarde */ }
}

function chargerRun() {
  try {
    const brut = localStorage.getItem(CLE_SAUVEGARDE);
    if (!brut) return null;
    const R = JSON.parse(brut);
    return (R && R.deck) ? R : null;
  } catch (e) { return null; }
}

function effacerRun() {
  try { localStorage.removeItem(CLE_SAUVEGARDE); } catch (e) { /* rien à faire */ }
}

/** Crée une run toute neuve : deck de départ, PV pleins, aucune relique, plan d'étages tiré au sort. */
function nouvelleRun(record) {
  return {
    pv: HEROS.pvDepart, pvMax: HEROS.pvDepart,
    deck: DECK_DEPART.slice(), reliques: [],
    etage: 0, planEtages: genererPlanEtages(),
    dernierGroupeCombat: [], evenementsVus: [],
    rencontreEnCours: null,
    record: record || 0
  };
}
