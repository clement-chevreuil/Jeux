/**
 * Moteur de combat au tour par tour. Toute la partie "règles du jeu" vit ici :
 * jouer une carte, résoudre le tour des ennemis, calculer les dégâts.
 * Aucun accès au DOM dans ce fichier — l'affichage lit juste l'état qu'il produit.
 */

/** Types d'effets qui demandent de choisir un ennemi précis. */
const EFFETS_CIBLES = ['degats', 'degats_multi', 'poison', 'faible', 'vulnerable'];

/** Une carte a-t-elle besoin qu'on lui désigne un ennemi ? */
function carteViseUnEnnemi(carte) {
  return carte.effets.some(e => EFFETS_CIBLES.includes(e.type));
}

function noter(C, texte) {
  C.journal.push(texte);
  if (C.journal.length > 50) C.journal.shift();
}

/** Inflige des dégâts à une cible, en tenant compte de la Force, Faible, Vulnérable et du bloc. */
function infliger(cible, valeurBase, source) {
  let degats = valeurBase + (source.force || 0);
  if (source.faible > 0) degats = Math.floor(degats * 0.75);
  if (cible.vulnerable > 0) degats = Math.floor(degats * 1.5);
  degats = Math.max(1, Math.round(degats));

  const absorbe = Math.min(cible.bloc || 0, degats);
  cible.bloc -= absorbe;
  cible.pv = Math.max(0, cible.pv - (degats - absorbe));
  if (cible.pv === 0 && 'vivant' in cible) cible.vivant = false;
  return degats;
}

/** Ajoute du bloc à une entité, augmenté par sa Dextérité si elle en a. */
function gagnerBloc(entite, valeur) {
  entite.bloc = (entite.bloc || 0) + valeur + (entite.dexterite || 0);
}

/** Applique un seul effet de carte ou d'intention ennemie. `source` agit, `cible` subit. */
function resoudreEffet(C, effet, source, cible) {
  switch (effet.type) {
    case 'degats': infliger(cible, effet.valeur, source); break;
    case 'degats_zone': C.ennemis.filter(e => e.vivant).forEach(e => infliger(e, effet.valeur, source)); break;
    case 'degats_multi': for (let i = 0; i < effet.fois; i++) infliger(cible, effet.valeur, source); break;
    case 'bloc': gagnerBloc(source, effet.valeur); break;
    case 'poison': if (cible) cible.poison = (cible.poison || 0) + effet.valeur; break;
    case 'faible': if (cible) cible.faible = (cible.faible || 0) + effet.valeur; break;
    case 'vulnerable': if (cible) cible.vulnerable = (cible.vulnerable || 0) + effet.valeur; break;
    case 'force': source.force = (source.force || 0) + effet.valeur; break;
    case 'dexterite': source.dexterite = (source.dexterite || 0) + effet.valeur; break;
    case 'pioche': piocherCartes(C.deck, effet.valeur); break;
    case 'energie': C.joueur.energie += effet.valeur; break;
    case 'soin': source.pv = Math.min(source.pvMax, source.pv + effet.valeur); break;
    case 'pv_perdus': source.pv = Math.max(0, source.pv - effet.valeur); break;
    case 'pouvoir': C.joueur.pouvoirs[effet.cle] = (C.joueur.pouvoirs[effet.cle] || 0) + effet.valeur; break;
  }
}

/** Certains pouvoirs se déclenchent tout seuls quand une carte d'attaque touche. */
function appliquerPouvoirsSurAttaque(C, carte, cible) {
  if (carte.type !== 'attaque') return;
  const zone = carte.effets.some(e => e.type === 'degats_zone');
  const cibles = zone ? C.ennemis.filter(e => e.vivant) : (cible ? [cible] : []);
  const poison = C.joueur.pouvoirs.poison_sur_attaque || 0;
  const faible = C.joueur.pouvoirs.faible_sur_attaque || 0;
  if (poison) cibles.forEach(e => { if (e.vivant) e.poison = (e.poison || 0) + poison; });
  if (faible) cibles.forEach(e => { if (e.vivant) e.faible = (e.faible || 0) + faible; });
}

/** Prépare un nouveau tour du joueur : bloc remis à zéro, énergie et pioche renouvelées. */
function debutTourJoueur(C) {
  C.tour++;
  if (C.joueur.poison > 0) {
    const d = C.joueur.poison;
    C.joueur.pv = Math.max(0, C.joueur.pv - d);
    C.joueur.poison--;
    noter(C, '☠ Le poison t’inflige ' + d + ' dégât(s).');
  }
  C.joueur.bloc = C.joueur.pouvoirs.bloc_par_tour || 0;
  const bonusPremierTour = (C.tour === 1 && C.joueur.reliques.includes('coeur_de_braise')) ? 2 : 0;
  C.joueur.energie = C.joueur.energieMax + (C.joueur.pouvoirs.energie_par_tour || 0) + bonusPremierTour;
  C.joueur.grimoireLegerUtilise = false;
  const nbCartes = HEROS.pioche + (C.joueur.reliques.includes('encre_infinie') ? 1 : 0);
  piocherCartes(C.deck, nbCartes);
  verifierFinCombat(C);
}

/** Joue une carte de la main. `indexEnnemiCible` est ignoré si la carte n'a pas besoin de cible. */
function jouerCarte(C, indexMain, indexEnnemiCible) {
  if (C.phase !== 'joueur') return { ok: false, raison: 'pas ton tour' };
  const idCarte = C.deck.main[indexMain];
  if (idCarte == null) return { ok: false, raison: 'carte introuvable' };
  const carte = CARTES[idCarte];

  const grimoireLeger = C.joueur.reliques.includes('grimoire_leger') && !C.joueur.grimoireLegerUtilise;
  const cout = grimoireLeger ? 0 : carte.cout;
  if (C.joueur.energie < cout) return { ok: false, raison: 'pas assez d’énergie' };

  C.joueur.energie -= cout;
  if (grimoireLeger) C.joueur.grimoireLegerUtilise = true;

  const cible = C.ennemis[indexEnnemiCible] && C.ennemis[indexEnnemiCible].vivant
    ? C.ennemis[indexEnnemiCible]
    : C.ennemis.find(e => e.vivant) || null;

  carte.effets.forEach(effet => resoudreEffet(C, effet, C.joueur, cible));
  appliquerPouvoirsSurAttaque(C, carte, cible);

  C.deck.main.splice(indexMain, 1);
  (carte.type === 'pouvoir' ? C.deck.epuisees : C.deck.defausse).push(idCarte);

  noter(C, 'Tu joues ' + carte.nom + '.');
  verifierFinCombat(C);
  return { ok: true };
}

/** Termine le tour du joueur et enchaîne directement sur celui des ennemis. */
function finTourJoueur(C) {
  if (C.phase !== 'joueur') return;
  C.joueur.faible = Math.max(0, C.joueur.faible - 1);
  C.joueur.vulnerable = Math.max(0, C.joueur.vulnerable - 1);
  defausserMain(C.deck);
  C.phase = 'ennemi';
  resoudreTourEnnemis(C);
}

function resoudreActionEnnemi(C, ennemi, action) {
  if (!action) return;
  if (action.type === 'attaque') infliger(C.joueur, action.valeur, ennemi);
  else if (action.type === 'attaque_multi') { for (let i = 0; i < action.fois; i++) infliger(C.joueur, action.valeur, ennemi); }
  else if (action.type === 'defense') gagnerBloc(ennemi, action.valeur);
  else if (action.type === 'buff') resoudreEffet(C, action.effet, ennemi, ennemi);
  else if (action.type === 'debuff') resoudreEffet(C, action.effet, ennemi, C.joueur);
}

/** Fait agir chaque ennemi vivant une fois, puis relance un tour du joueur si le combat continue. */
function resoudreTourEnnemis(C) {
  C.ennemis.forEach(e => {
    if (!e.vivant) return;
    if (e.poison > 0) {
      e.pv = Math.max(0, e.pv - e.poison);
      e.poison--;
      if (e.pv === 0) e.vivant = false;
    }
    if (!e.vivant) return;
    resoudreActionEnnemi(C, e, e.intentions[e.intentionIndex]);
    e.intentionIndex = (e.intentionIndex + 1) % e.intentions.length;
    e.faible = Math.max(0, e.faible - 1);
    e.vulnerable = Math.max(0, e.vulnerable - 1);
  });
  verifierFinCombat(C);
  if (C.phase !== 'fini') {
    C.phase = 'joueur';
    debutTourJoueur(C);
  }
}

function verifierFinCombat(C) {
  if (C.phase === 'fini') return;
  if (C.joueur.pv <= 0) { C.phase = 'fini'; C.vainqueur = 'ennemis'; noter(C, '☠ Tu tombes.'); return; }
  if (C.ennemis.every(e => !e.vivant)) { C.phase = 'fini'; C.vainqueur = 'joueur'; noter(C, '🏆 Combat gagné.'); }
}

/**
 * Construit un nouveau combat à partir de l'état du héros (PV, deck, reliques)
 * et d'une liste d'identifiants d'ennemis. `etage` sert à faire grandir leurs PV.
 */
function demarrerCombat(etatHeros, ennemisIds, etage) {
  const ennemis = ennemisIds.map((id, i) => {
    const base = ENNEMIS[id];
    const pv = pvAjustes(id, etage);
    return {
      cle: 'e' + i, id, nom: base.nom, aspect: base.aspect,
      pv, pvMax: pv, bloc: 0, force: 0, faible: 0, vulnerable: 0, poison: 0,
      intentions: base.intentions, intentionIndex: 0, vivant: true
    };
  });

  const deck = creerPioche(etatHeros.deck);
  deck.epuisees = [];

  const joueur = {
    pv: etatHeros.pv, pvMax: etatHeros.pvMax, bloc: 0, force: 0, dexterite: 0,
    faible: 0, vulnerable: 0, poison: 0, energie: 0, energieMax: HEROS.energieDepart,
    pouvoirs: {}, reliques: etatHeros.reliques.slice(), grimoireLegerUtilise: false
  };

  const C = { joueur, ennemis, deck, tour: 0, phase: 'joueur', vainqueur: null, journal: [], etage };
  noter(C, '⚔️ Le combat commence.');
  debutTourJoueur(C);
  return C;
}
