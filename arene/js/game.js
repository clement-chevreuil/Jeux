/* ---------------------------------------------------------------
   Dernière Escouade — boucle de jeu, camp, collection, récompenses.
   Sauvegarde en localStorage. Aucune ressource externe.
   --------------------------------------------------------------- */

const CLE_SAUVEGARDE = 'arene.derniere-escouade.v1';

let G = null;
let deploy = [];          // uid ou null, un par emplacement
let cibleEnAttente = null; // carte de récompense qui attend un héros cible

/* ------------------------- état de jeu -------------------------- */

function baseHeros(id) { return HEROS.find(h => h.id === id); }

function hydrater(h) {
  const b = baseHeros(h.id);
  h.nom = b.nom; h.cap = b.cap; h.art = b.art; h.desc = b.desc; h.rar = b.rar;
  return h;
}

function creerHeros(id) {
  const b = baseHeros(id);
  return hydrater({
    uid: ++G.uid, id: id,
    pvmax: b.pv, pvActuel: b.pv, atq: b.atq, vit: b.vit,
    combats: 0
  });
}

function nouvellePartie() {
  G = { uid: 0, niveau: 0, escouadeMax: 3, roster: [], cimetiere: [], reliques: [], record: (G && G.record) || 0, runs: ((G && G.runs) || 0) + 1 };
  ['garde', 'archer', 'clerc', 'voleur'].forEach(id => G.roster.push(creerHeros(id)));
  deploy = new Array(G.escouadeMax).fill(null);
  sauver();
  montrerCamp();
}

function sauver() {
  try {
    localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify({
      uid: G.uid, niveau: G.niveau, escouadeMax: G.escouadeMax, record: G.record, runs: G.runs,
      reliques: G.reliques, cimetiere: G.cimetiere,
      roster: G.roster.map(h => ({ uid: h.uid, id: h.id, pvmax: h.pvmax, pvActuel: h.pvActuel, atq: h.atq, vit: h.vit, combats: h.combats }))
    }));
  } catch (e) { /* mode privé : on joue sans sauvegarde */ }
}

function charger() {
  try {
    const brut = localStorage.getItem(CLE_SAUVEGARDE);
    if (!brut) return false;
    const d = JSON.parse(brut);
    if (!d || !d.roster) return false;
    G = d;
    G.roster.forEach(hydrater);
    G.cimetiere = G.cimetiere || [];
    G.reliques = G.reliques || [];
    deploy = new Array(G.escouadeMax).fill(null);
    return G.roster.length > 0;
  } catch (e) { return false; }
}

function relique(id) { return G.reliques.indexOf(id) >= 0; }

/* ------------------------- utilitaires -------------------------- */

function $(sel) { return document.querySelector(sel); }
function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}
function ecran(nom) {
  ['camp', 'combat', 'recompense', 'fin'].forEach(n => {
    $('#ecran-' + n).classList.toggle('actif', n === nom);
  });
}
function hasard(n) { return Math.floor(Math.random() * n); }
function melanger(t) { const a = t.slice(); for (let i = a.length - 1; i > 0; i--) { const j = hasard(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; }

/* --------------------------- cartes ----------------------------- */

function carteHeros(h, opts) {
  opts = opts || {};
  const c = el('div', 'carte rar-' + h.rar);
  c.dataset.uid = h.uid;
  const art = el('div', 'carte-art');
  art.appendChild(portraitSprite(h.art, opts.echelle || 4));
  c.appendChild(art);
  c.appendChild(el('div', 'carte-nom', h.nom));
  const pv = el('div', 'carte-pv');
  const j = el('div', 'jauge');
  const i = el('i'); i.style.width = Math.round(100 * h.pvActuel / h.pvmax) + '%';
  if (h.pvActuel / h.pvmax < 0.34) i.classList.add('bas');
  j.appendChild(i); pv.appendChild(j);
  pv.appendChild(el('span', null, h.pvActuel + '/' + h.pvmax));
  c.appendChild(pv);
  const st = el('div', 'carte-stats');
  st.appendChild(el('span', null, '⚔ ' + h.atq));
  st.appendChild(el('span', null, '⚡ ' + h.vit));
  c.appendChild(st);
  c.appendChild(el('div', 'carte-cap', h.desc));
  return c;
}

function vignetteMonstre(id) {
  const m = MONSTRES[id];
  const v = el('div', 'vignette' + (m.boss ? ' boss' : ''));
  v.appendChild(portraitSprite(m.art, 3));
  const info = el('div', 'vignette-info');
  info.appendChild(el('strong', null, m.nom));
  info.appendChild(el('span', null, '♥ ' + m.pv + '  ⚔ ' + m.atq + '  ⚡ ' + m.vit));
  v.appendChild(info);
  return v;
}

/* ---------------------------- camp ------------------------------ */

function montrerCamp() {
  ecran('camp');
  const niv = NIVEAUX[G.niveau];

  $('#titre-niveau').textContent = 'Niveau ' + (G.niveau + 1) + '/' + NIVEAUX.length + ' — ' + niv.nom;
  $('#sous-titre').textContent = { foret: 'Forêt', crypte: 'Crypte', cendre: 'Terres cendrées' }[niv.biome];
  document.body.dataset.biome = niv.biome;

  const ennemis = $('#ennemis'); ennemis.innerHTML = '';
  niv.ennemis.forEach(id => ennemis.appendChild(vignetteMonstre(id)));

  const rel = $('#reliques'); rel.innerHTML = '';
  if (!G.reliques.length) rel.appendChild(el('span', 'vide', 'Aucune relique.'));
  G.reliques.forEach(id => {
    const r = RELIQUES.find(x => x.id === id);
    const b = el('span', 'relique', '✦ ' + r.nom);
    b.title = r.txt;
    rel.appendChild(b);
  });

  /* emplacements */
  if (deploy.length !== G.escouadeMax) {
    const d = new Array(G.escouadeMax).fill(null);
    deploy.forEach((u, i) => { if (i < d.length) d[i] = u; });
    deploy = d;
  }
  deploy = deploy.map(u => (u && G.roster.some(h => h.uid === u)) ? u : null);

  const slots = $('#slots'); slots.innerHTML = '';
  deploy.forEach((uid, i) => {
    const s = el('div', 'slot');
    s.dataset.slot = i;
    if (uid) {
      const h = G.roster.find(x => x.uid === uid);
      s.appendChild(carteHeros(h));
      s.classList.add('plein');
    } else {
      s.appendChild(el('div', 'slot-vide', 'emplacement ' + (i + 1)));
    }
    slots.appendChild(s);
  });

  const coll = $('#collection'); coll.innerHTML = '';
  const dispo = G.roster.filter(h => deploy.indexOf(h.uid) < 0);
  if (!dispo.length) coll.appendChild(el('div', 'vide', 'Toute la collection est déployée.'));
  dispo.forEach(h => coll.appendChild(carteHeros(h)));

  $('#btn-combat').disabled = deploy.every(u => !u);
  $('#compte-cimetiere').textContent = G.cimetiere.length;
  majCimetiere();
  sauver();
}

function majCimetiere() {
  const l = $('#liste-cimetiere'); l.innerHTML = '';
  if (!G.cimetiere.length) { l.appendChild(el('span', 'vide', 'Personne. Pour l’instant.')); return; }
  G.cimetiere.forEach(m => {
    const e = el('div', 'tombe');
    e.appendChild(el('span', 'tombe-nom', '† ' + m.nom));
    e.appendChild(el('span', 'tombe-note', 'niveau ' + m.niveau + ' · ' + m.combats + ' combat' + (m.combats > 1 ? 's' : '')));
    l.appendChild(e);
  });
}

/* --------------------- glisser-déposer / clic -------------------- */
/* Pointer events : marche à la souris comme au doigt. */

let drag = null;

function poserDans(uid, slot) {
  const pos = deploy.indexOf(uid);
  if (pos >= 0) deploy[pos] = null;
  if (slot == null) { montrerCamp(); return; }
  const occupant = deploy[slot];
  deploy[slot] = uid;
  if (occupant && occupant !== uid && pos >= 0) deploy[pos] = occupant;
  montrerCamp();
}

function premierLibre() {
  for (let i = 0; i < deploy.length; i++) if (!deploy[i]) return i;
  return null;
}

function initDrag() {
  const zone = document.getElementById('ecran-camp');

  zone.addEventListener('pointerdown', (ev) => {
    const carte = ev.target.closest('.carte');
    if (!carte || !carte.dataset.uid) return;
    drag = { uid: +carte.dataset.uid, x0: ev.clientX, y0: ev.clientY, actif: false, carte: carte };
    zone.setPointerCapture(ev.pointerId);
  });

  zone.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
    if (!drag.actif && Math.hypot(dx, dy) < 8) return;
    if (!drag.actif) {
      drag.actif = true;
      const g = drag.carte.cloneNode(true);
      g.className += ' fantome';
      const r = drag.carte.getBoundingClientRect();
      g.style.width = r.width + 'px';
      drag.ox = r.left - drag.x0;
      drag.oy = r.top - drag.y0;
      document.body.appendChild(g);
      drag.ghost = g;
      drag.carte.classList.add('en-vol');
    }
    drag.ghost.style.left = (ev.clientX + drag.ox) + 'px';
    drag.ghost.style.top = (ev.clientY + drag.oy) + 'px';
    document.querySelectorAll('.slot.vise').forEach(s => s.classList.remove('vise'));
    const sous = document.elementFromPoint(ev.clientX, ev.clientY);
    const s = sous && sous.closest('[data-slot]');
    if (s) s.classList.add('vise');
  });

  const fin = (ev) => {
    if (!drag) return;
    const d = drag; drag = null;
    document.querySelectorAll('.slot.vise').forEach(s => s.classList.remove('vise'));
    if (d.ghost) d.ghost.remove();
    if (d.carte) d.carte.classList.remove('en-vol');
    if (!d.actif) {
      /* simple clic : premier emplacement libre, ou retour à la collection */
      if (deploy.indexOf(d.uid) >= 0) poserDans(d.uid, null);
      else { const libre = premierLibre(); if (libre != null) poserDans(d.uid, libre); }
      return;
    }
    const sous = document.elementFromPoint(ev.clientX, ev.clientY);
    const s = sous && sous.closest('[data-slot]');
    if (s) poserDans(d.uid, +s.dataset.slot);
    else if (sous && sous.closest('#collection')) poserDans(d.uid, null);
    else montrerCamp();
  };
  zone.addEventListener('pointerup', fin);
  zone.addEventListener('pointercancel', fin);
}

/* --------------------------- combat ----------------------------- */

function lancerCombat() {
  const escouade = deploy.filter(Boolean).map(uid => G.roster.find(h => h.uid === uid));
  if (!escouade.length) return;
  escouade.forEach(h => { h.combats++; });
  ecran('combat');
  $('#journal').innerHTML = '';
  $('#titre-combat').textContent = NIVEAUX[G.niveau].nom;
  $('#suite-combat').classList.remove('visible');
  demarrerCombat(escouade, NIVEAUX[G.niveau], G.niveau + 1, finCombat);
}

function finCombat(vainqueur, unites) {
  /* Les dégâts sont reportés sur la collection. Les morts le sont pour de bon. */
  const perdus = [];
  unites.forEach(u => {
    const h = u.ref;
    if (!h) return;
    h.pvActuel = u.pv;
    if (!u.vivant) {
      perdus.push(h);
      G.cimetiere.push({ nom: h.nom, id: h.id, niveau: G.niveau + 1, combats: h.combats });
      G.roster = G.roster.filter(x => x.uid !== h.uid);
    }
  });
  deploy = deploy.map(uid => G.roster.some(h => h.uid === uid) ? uid : null);

  if (vainqueur === 'allie') {
    /* une victoire remet un peu tout le monde d'aplomb : sans ça l'usure tue la run trop vite */
    const repos = relique('camp') ? 5 : 0;
    G.roster.forEach(h => {
      h.pvActuel = Math.min(h.pvmax, h.pvActuel + Math.max(3, Math.ceil(h.pvmax * 0.25)) + repos);
    });
    G.niveau++;
    if (G.niveau > G.record) G.record = G.niveau;
  }
  sauver();
  bilanCombat(vainqueur, perdus);
}

function bilanCombat(vainqueur, perdus) {
  const zone = $('#suite-combat');
  zone.innerHTML = '';
  const t = el('div', 'bilan');
  if (vainqueur === 'allie') {
    t.appendChild(el('h3', null, 'Niveau réussi'));
    t.appendChild(el('p', null, perdus.length
      ? 'Mais ' + perdus.map(h => h.nom).join(', ') + ' ne reviendra pas.'
      : 'Toute l’escouade rentre au camp.'));
  } else {
    t.appendChild(el('h3', 'ko', 'Niveau perdu'));
    t.appendChild(el('p', null, perdus.map(h => h.nom).join(', ') +
      ' — perdu' + (perdus.length > 1 ? 's' : '') + ' définitivement.'));
  }
  zone.appendChild(t);

  const b = el('button', 'btn', 'Continuer');
  b.onclick = () => {
    arreterBoucle();
    if (!G.roster.length) return montrerFin(false);
    if (vainqueur === 'allie') {
      if (G.niveau >= NIVEAUX.length) return montrerFin(true);
      return montrerRecompense();
    }
    montrerCamp();
  };
  zone.appendChild(b);
  zone.classList.add('visible');
}

/* ------------------------- récompenses --------------------------- */

function piocheCartes() {
  const pool = [];
  melanger(HEROS).slice(0, 2).forEach(r => pool.push({
    type: 'recrue', id: r.id, nom: r.nom, sous: 'Recrue · ' + r.rar, txt: r.desc, art: r.art
  }));
  pool.push({ type: 'soin', nom: 'Rations', sous: 'Soin', txt: 'Rend 14 PV à toute la collection.' });
  pool.push({ type: 'forge', nom: 'Pierre à Aiguiser', sous: 'Amélioration', txt: '+3 ATQ à un héros de ton choix.' });
  pool.push({ type: 'vigueur', nom: 'Ceinture Épaisse', sous: 'Amélioration', txt: '+12 PV max à un héros (et soigne d’autant).' });
  pool.push({ type: 'vitesse', nom: 'Huile de Course', sous: 'Amélioration', txt: '+3 VIT à un héros de ton choix.' });

  const relDispo = RELIQUES.filter(r => !relique(r.id));
  if (relDispo.length) {
    const r = relDispo[hasard(relDispo.length)];
    pool.push({ type: 'relique', id: r.id, nom: r.nom, sous: 'Relique', txt: r.txt });
  }
  if (G.cimetiere.length && Math.random() < 0.45) {
    const m = G.cimetiere[G.cimetiere.length - 1];
    pool.push({
      type: 'resurrection', id: m.id, nom: 'Second Souffle', sous: 'Rare',
      txt: 'Ramène ' + m.nom + ' du cimetière, à moitié en vie.', art: baseHeros(m.id).art
    });
  }
  return melanger(pool).slice(0, 3);
}

const GLYPHES = { soin: '🍖', forge: '🪓', vigueur: '🛡', vitesse: '🥾', relique: '✦' };

function montrerRecompense() {
  ecran('recompense');
  const z = $('#cartes-recompense'); z.innerHTML = '';
  piocheCartes().forEach(c => {
    const d = el('div', 'carte-recompense t-' + c.type);
    if (c.art) { const a = el('div', 'carte-art'); a.appendChild(portraitSprite(c.art, 4)); d.appendChild(a); }
    else d.appendChild(el('div', 'carte-glyphe', GLYPHES[c.type] || '?'));
    d.appendChild(el('div', 'carte-sous', c.sous));
    d.appendChild(el('div', 'carte-nom', c.nom));
    d.appendChild(el('div', 'carte-cap', c.txt));
    d.onclick = () => choisirCarte(c);
    z.appendChild(d);
  });
}

function choisirCarte(c) {
  if (c.type === 'recrue') { G.roster.push(creerHeros(c.id)); return montrerCamp(); }
  if (c.type === 'resurrection') {
    const h = creerHeros(c.id);
    h.pvActuel = Math.max(1, Math.round(h.pvmax / 2));
    G.roster.push(h);
    G.cimetiere.pop();
    return montrerCamp();
  }
  if (c.type === 'soin') {
    G.roster.forEach(h => { h.pvActuel = Math.min(h.pvmax, h.pvActuel + 14); });
    return montrerCamp();
  }
  if (c.type === 'relique') {
    G.reliques.push(c.id);
    if (c.id === 'banniere') G.roster.forEach(h => { h.atq += 1; });
    if (c.id === 'talisman') G.roster.forEach(h => { h.pvmax += 4; h.pvActuel += 4; });
    if (c.id === 'bottes') G.roster.forEach(h => { h.vit += 2; });
    if (c.id === 'etendard') { G.escouadeMax = Math.min(4, G.escouadeMax + 1); deploy.push(null); }
    return montrerCamp();
  }
  /* cartes qui demandent une cible */
  const z = $('#cartes-recompense'); z.innerHTML = '';
  z.appendChild(el('p', 'consigne', 'Sur qui ?'));
  const g = el('div', 'grille-cartes');
  G.roster.forEach(h => {
    const carte = carteHeros(h);
    carte.onclick = () => {
      if (c.type === 'forge') h.atq += 3;
      if (c.type === 'vitesse') h.vit += 3;
      if (c.type === 'vigueur') { h.pvmax += 12; h.pvActuel += 12; }
      montrerCamp();
    };
    g.appendChild(carte);
  });
  z.appendChild(g);
}

/* ----------------------------- fin ------------------------------- */

function montrerFin(gagne) {
  ecran('fin');
  $('#fin-titre').textContent = gagne ? 'Le Dragon Cendré est tombé' : 'Plus personne ne se relève';
  $('#fin-texte').textContent = gagne
    ? 'Ton escouade a traversé les douze niveaux. Ceux qui restent rentrent au camp.'
    : 'Il ne reste plus un seul héros. La run s’arrête ici.';
  const l = $('#fin-detail'); l.innerHTML = '';
  l.appendChild(el('div', null, 'Niveaux franchis : ' + G.niveau + ' / ' + NIVEAUX.length));
  l.appendChild(el('div', null, 'Meilleur score : ' + G.record));
  l.appendChild(el('div', null, 'Tombés : ' + (G.cimetiere.map(m => m.nom).join(', ') || '—')));
  sauver();
}

/* --------------------------- démarrage --------------------------- */

function init() {
  G = { uid: 0, record: 0, runs: 0 };
  if (charger()) {
    /* run déjà terminée : on rouvre sur l'écran de fin plutôt que sur un niveau inexistant */
    if (G.niveau >= NIVEAUX.length) montrerFin(true); else montrerCamp();
  } else nouvellePartie();
  initDrag();

  $('#btn-combat').onclick = lancerCombat;
  $('#btn-reset').onclick = () => {
    if (confirm('Abandonner la run en cours et repartir de zéro ?')) nouvellePartie();
  };
  $('#btn-rejouer').onclick = nouvellePartie;
  $('#btn-aide').onclick = () => $('#aide').classList.add('ouvert');
  $('#aide').onclick = (e) => {
    if (e.target.id === 'aide' || e.target.id === 'aide-fermer') $('#aide').classList.remove('ouvert');
  };
  document.querySelectorAll('[data-vitesse]').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('[data-vitesse]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      if (B) B.vitesse = +b.dataset.vitesse;
    };
  });
  $('#bascule-cimetiere').onclick = () => $('#cimetiere').classList.toggle('ouvert');
}

document.addEventListener('DOMContentLoaded', init);
