/** Affiche un ennemi en combat : son portrait, ses PV, son bloc et sa prochaine action. */

/** Traduit une intention d'ennemi en icône + texte court, pour que le joueur sache à quoi s'attendre. */
function texteIntention(action) {
  if (!action) return { icone: '💤', texte: '' };
  if (action.type === 'attaque') return { icone: '⚔️', texte: String(action.valeur) };
  if (action.type === 'attaque_multi') return { icone: '⚔️', texte: action.valeur + '×' + action.fois };
  if (action.type === 'defense') return { icone: '🛡️', texte: String(action.valeur) };
  if (action.type === 'buff') return { icone: '⬆️', texte: '' };
  if (action.type === 'debuff') return { icone: '⬇️', texte: '' };
  return { icone: '❔', texte: '' };
}

/**
 * Construit l'élément DOM d'un ennemi. `options.onClick` sert à le désigner comme cible.
 */
function creerEnnemiDOM(ennemi, options) {
  options = options || {};
  const el = document.createElement('div');
  el.className = 'ennemi' + (ennemi.vivant ? '' : ' ennemi-mort');
  if (options.ciblable) el.classList.add('ennemi-ciblable');

  const portrait = document.createElement('div');
  portrait.className = 'ennemi-portrait';
  portrait.appendChild(portraitAspect(ennemi.aspect, 4));
  el.appendChild(portrait);

  const nom = document.createElement('div');
  nom.className = 'ennemi-nom';
  nom.textContent = ennemi.nom;
  el.appendChild(nom);

  const pv = document.createElement('div');
  pv.className = 'ennemi-pv';
  pv.appendChild(creerBarre(ennemi.pv, ennemi.pvMax, 'barre-pv'));
  const texte = document.createElement('span');
  texte.textContent = ennemi.pv + '/' + ennemi.pvMax;
  pv.appendChild(texte);
  el.appendChild(pv);

  const statuts = document.createElement('div');
  statuts.className = 'ennemi-statuts';
  if (ennemi.bloc > 0) statuts.appendChild(pastilleStatut('🛡️', ennemi.bloc));
  if (ennemi.poison > 0) statuts.appendChild(pastilleStatut('☠️', ennemi.poison));
  if (ennemi.faible > 0) statuts.appendChild(pastilleStatut('⬇️', ennemi.faible));
  if (ennemi.vulnerable > 0) statuts.appendChild(pastilleStatut('🎯', ennemi.vulnerable));
  if (ennemi.force > 0) statuts.appendChild(pastilleStatut('💪', ennemi.force));
  el.appendChild(statuts);

  if (ennemi.vivant) {
    const intention = texteIntention(ennemi.intentions[ennemi.intentionIndex]);
    const bulle = document.createElement('div');
    bulle.className = 'ennemi-intention';
    bulle.textContent = intention.icone + ' ' + intention.texte;
    el.appendChild(bulle);
  }

  if (options.onClick && ennemi.vivant) el.addEventListener('click', options.onClick);
  return el;
}

function pastilleStatut(icone, valeur) {
  const p = document.createElement('span');
  p.className = 'pastille-statut';
  p.textContent = icone + valeur;
  return p;
}
