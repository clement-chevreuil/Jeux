/**
 * Construit le plan des étages et tire au sort le contenu d'un lieu au moment
 * où le joueur le choisit (quels ennemis, quel événement).
 */

/** Copie du plan fixe, pour ne jamais modifier les données d'origine. */
function genererPlanEtages() {
  return PLAN_ETAGES.map(e => ({ options: e.options.slice() }));
}

function piocherDans(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

/** Choisit un groupe d'ennemis normaux, en évitant si possible de répéter le dernier. */
function tirerGroupeCombat(dernierGroupe) {
  const choix = GROUPES_COMBAT.filter(g => g.join() !== (dernierGroupe || []).join());
  return piocherDans(choix.length ? choix : GROUPES_COMBAT).slice();
}

function tirerGroupeElite() {
  return piocherDans(GROUPES_ELITE).slice();
}

/** Choisit un événement pas encore vu cette run (ou n'importe lequel s'ils y sont tous passés). */
function tirerEvenement(dejaVus) {
  const restants = EVENEMENTS.filter(e => dejaVus.indexOf(e.id) < 0);
  return piocherDans(restants.length ? restants : EVENEMENTS);
}
