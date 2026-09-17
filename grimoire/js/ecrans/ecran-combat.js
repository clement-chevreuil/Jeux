/**
 * Écran de combat : affiche l'état du combat (C, dans app.js) et réagit aux clics.
 * On clique une carte, puis un ennemi si la carte en a besoin.
 */

let carteEnMainSelectionnee = null;

function afficherEcranCombat() {
  afficherEcran('combat');
  carteEnMainSelectionnee = null;
  redessinerCombat();
}

function redessinerCombat() {
  dessinerJoueur();
  dessinerEnnemis();
  dessinerMain();
  dessinerJournal();

  const finButton = $('#bouton-fin-tour');
  finButton.disabled = C.phase !== 'joueur';

  if (C.phase === 'fini') return setTimeout(finDuCombat, 900);
}

function dessinerJoueur() {
  const zone = $('#joueur-combat');
  zone.innerHTML = '';

  const portrait = document.createElement('div');
  portrait.className = 'joueur-portrait';
  portrait.appendChild(HEROS.aspect.nouveauCanvas(3));
  zone.appendChild(portrait);

  const infos = document.createElement('div');
  infos.className = 'joueur-infos';

  const pv = document.createElement('div');
  pv.className = 'joueur-pv';
  pv.appendChild(creerBarre(C.joueur.pv, C.joueur.pvMax, 'barre-pv'));
  const texte = document.createElement('span');
  texte.textContent = C.joueur.pv + ' / ' + C.joueur.pvMax;
  pv.appendChild(texte);
  infos.appendChild(pv);

  const statuts = document.createElement('div');
  statuts.className = 'joueur-statuts';
  if (C.joueur.bloc > 0) statuts.appendChild(pastilleStatut('🛡️', C.joueur.bloc));
  if (C.joueur.force > 0) statuts.appendChild(pastilleStatut('💪', C.joueur.force));
  if (C.joueur.dexterite > 0) statuts.appendChild(pastilleStatut('🤸', C.joueur.dexterite));
  if (C.joueur.poison > 0) statuts.appendChild(pastilleStatut('☠️', C.joueur.poison));
  if (C.joueur.faible > 0) statuts.appendChild(pastilleStatut('⬇️', C.joueur.faible));
  if (C.joueur.vulnerable > 0) statuts.appendChild(pastilleStatut('🎯', C.joueur.vulnerable));
  infos.appendChild(statuts);

  const energie = document.createElement('div');
  energie.className = 'joueur-energie';
  energie.textContent = '✦ ' + C.joueur.energie + ' / ' + C.joueur.energieMax;
  infos.appendChild(energie);

  zone.appendChild(infos);
}

function dessinerEnnemis() {
  const zone = $('#ennemis-combat');
  zone.innerHTML = '';
  const carteAttenduneCible = carteEnMainSelectionnee != null &&
    carteViseUnEnnemi(CARTES[C.deck.main[carteEnMainSelectionnee]]);

  C.ennemis.forEach((ennemi, i) => {
    zone.appendChild(creerEnnemiDOM(ennemi, {
      ciblable: carteAttenduneCible && ennemi.vivant,
      onClick: carteAttenduneCible ? () => jouerCarteChoisie(i) : null
    }));
  });
}

function dessinerMain() {
  const zone = $('#main-combat');
  zone.innerHTML = '';
  C.deck.main.forEach((idCarte, i) => {
    const carte = CARTES[idCarte];
    const grimoireLeger = C.joueur.reliques.includes('grimoire_leger') && !C.joueur.grimoireLegerUtilise;
    const cout = grimoireLeger ? 0 : carte.cout;
    const jouable = C.phase === 'joueur' && C.joueur.energie >= cout;

    const el = creerCarteDOM(idCarte, {
      jouable: jouable,
      coutAffiche: cout,
      onClick: jouable ? () => selectionnerCarte(i) : null
    });
    if (i === carteEnMainSelectionnee) el.classList.add('carte-selectionnee');
    zone.appendChild(el);
  });
}

function dessinerJournal() {
  const zone = $('#journal-combat');
  zone.innerHTML = C.journal.slice(-20).map(l => '<div>' + l + '</div>').join('');
  zone.scrollTop = zone.scrollHeight;
}

function selectionnerCarte(index) {
  if (C.phase !== 'joueur') return;
  const idCarte = C.deck.main[index];
  if (!carteViseUnEnnemi(CARTES[idCarte])) {
    carteEnMainSelectionnee = null;
    jouerCarte(C, index, null);
    return redessinerCombat();
  }
  carteEnMainSelectionnee = (carteEnMainSelectionnee === index) ? null : index;
  redessinerCombat();
}

function jouerCarteChoisie(indexEnnemi) {
  if (carteEnMainSelectionnee == null) return;
  jouerCarte(C, carteEnMainSelectionnee, indexEnnemi);
  carteEnMainSelectionnee = null;
  redessinerCombat();
}

function finirLeTour() {
  if (C.phase !== 'joueur') return;
  carteEnMainSelectionnee = null;
  finTourJoueur(C);
  redessinerCombat();
}

/** Reporte le résultat du combat sur la run, puis enchaîne sur l'écran qui convient. */
function finDuCombat() {
  R.pv = C.joueur.pv;

  if (C.vainqueur === 'ennemis') {
    sauvegarderRun(R);
    return afficherEcranFin(false);
  }

  if (R.reliques.includes('fiole_de_vigueur')) R.pv = Math.min(R.pvMax, R.pv + 8);
  sauvegarderRun(R);

  if (C.palier === 'boss') return afficherEcranFin(true);
  if (C.palier === 'elite') return afficherEcranRecompense({ mode: 'relique' });
  return afficherEcranRecompense({ mode: 'carte' });
}
