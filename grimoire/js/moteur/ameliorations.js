/**
 * Améliore une carte au feu de camp : les valeurs de ses effets montent d'un tiers.
 * La version améliorée est ajoutée une seule fois au catalogue CARTES, puis réutilisée.
 */
function idCarteAmelioree(idBase) {
  return idBase + '_ameliore';
}

function carteEstAmeliorable(idCarte) {
  return !idCarte.endsWith('_ameliore') && !CARTES[idCarteAmelioree(idCarte)];
}

function genererCarteAmelioree(idBase) {
  const idNouveau = idCarteAmelioree(idBase);
  if (CARTES[idNouveau]) return idNouveau;

  const base = CARTES[idBase];
  const effets = base.effets.map(e => {
    if (e.valeur == null) return Object.assign({}, e);
    return Object.assign({}, e, { valeur: e.valeur + Math.max(1, Math.round(e.valeur * 0.35)) });
  });
  CARTES[idNouveau] = {
    nom: base.nom + ' +', type: base.type, cout: base.cout, rarete: base.rarete,
    description: base.description + ' (améliorée)',
    effets: effets
  };
  return idNouveau;
}
