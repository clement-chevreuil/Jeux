/* ---------------------------------------------------------------
   Moteur de combat automatique + rendu canvas.
   Le joueur ne joue pas pendant le combat : il a joué en plaçant
   son escouade. Ici on regarde le résultat de ses choix.
   --------------------------------------------------------------- */

const SOL = 198;
const LARG = 480, HAUT = 240;

let B = null;              // état du combat en cours
let rafId = null;
let dernierTemps = 0;

/* ------------------------- construction ------------------------- */

function uniteDepuisHeros(h, i) {
  return {
    cle: 'a' + i, camp: 'allie', nom: h.nom, ref: h,
    pv: h.pvActuel, pvmax: h.pvmax, atq: h.atq, vit: h.vit,
    cap: h.cap, art: h.art, echelle: 3,
    jauge: Math.floor(Math.random() * 20), vivant: true,
    poison: 0, flash: 0, decalage: 0, mort: 0
  };
}

function uniteDepuisMonstre(id, i, palier) {
  const m = MONSTRES[id];
  /* Les monstres ordinaires montent doucement en puissance ; les boss sont déjà réglés. */
  const boost = m.boss ? 1 : 1 + Math.max(0, palier - 1) * 0.06;
  const pv = Math.round(m.pv * boost);
  return {
    cle: 'e' + i, camp: 'ennemi', nom: m.nom, ref: null,
    pv: pv, pvmax: pv, atq: Math.round(m.atq * boost), vit: m.vit,
    cap: m.cap, art: m.art, echelle: m.echelle || 3, boss: !!m.boss,
    jauge: Math.floor(Math.random() * 20), vivant: true,
    poison: 0, flash: 0, decalage: 0, mort: 0
  };
}

function demarrerCombat(escouade, niveau, palier, surFin) {
  B = {
    allies: escouade.map(uniteDepuisHeros),
    ennemis: niveau.ennemis.map((id, i) => uniteDepuisMonstre(id, i, palier)),
    biome: niveau.biome,
    nom: niveau.nom,
    journal: [],
    anim: null,
    flottants: [],
    particules: [],
    fini: false,
    vainqueur: null,
    vitesse: 1,
    attente: 300,
    surFin: surFin,
    t: 0
  };
  placer(B.allies, false);
  placer(B.ennemis, true);
  noter('⚔️ ' + niveau.nom);
  lancerBoucle();
}

function placer(liste, ennemi) {
  liste.forEach((u, i) => {
    u.x = ennemi ? (LARG - 58 - i * 50) : (58 + i * 50);
    u.x0 = u.x;
  });
}

function tous() { return B.allies.concat(B.ennemis); }
function vivants(camp) { return (camp === 'allie' ? B.allies : B.ennemis).filter(u => u.vivant); }
function adversaires(u) { return vivants(u.camp === 'allie' ? 'ennemi' : 'allie'); }
function allies(u) { return vivants(u.camp); }

function noter(txt) {
  B.journal.push(txt);
  if (B.journal.length > 60) B.journal.shift();
  const el = document.getElementById('journal');
  if (el) { el.innerHTML = B.journal.slice(-30).map(l => '<div>' + l + '</div>').join(''); el.scrollTop = el.scrollHeight; }
}

/* --------------------------- règles ----------------------------- */

function atqEffectif(u) {
  let a = u.atq;
  if (u.cap === 'rage' && u.pv <= u.pvmax / 2) a += 3;
  return a;
}

/* Chaque "protege" vivant dans le camp retire 1 dégât. */
function reduction(camp) {
  return vivants(camp).filter(u => u.cap === 'protege').length;
}

function infliger(src, cible, brut, opts) {
  opts = opts || {};
  let d = brut;
  if (!opts.pur) d -= reduction(cible.camp);
  d = Math.max(1, Math.round(d));
  cible.pv -= d;
  cible.flash = 1;
  flottant(cible, '-' + d, '#ff6b5e');
  if (cible.pv <= 0) {
    cible.pv = 0; cible.vivant = false; cible.mort = 1;
    noter('💀 ' + cible.nom + ' tombe.');
  } else if (src && !opts.pur && opts.melee && cible.cap === 'riposte' && cible.vivant) {
    src.pv -= 2; src.flash = 1;
    flottant(src, '-2', '#ffb45e');
    if (src.pv <= 0) { src.pv = 0; src.vivant = false; src.mort = 1; noter('💀 ' + src.nom + ' tombe (riposte).'); }
  }
  return d;
}

function soigner(cible, montant) {
  const avant = cible.pv;
  cible.pv = Math.min(cible.pvmax, cible.pv + montant);
  flottant(cible, '+' + (cible.pv - avant), '#7fe08a');
}

function flottant(u, txt, couleur) {
  B.flottants.push({ x: u.x + (Math.random() * 16 - 8), y: SOL - u.echelle * 16 - 6, txt: txt, c: couleur, t: 0 });
}

function cible_par_defaut(u) {
  const adv = adversaires(u);
  if (!adv.length) return null;
  if (u.cap === 'vise_faible') {
    return adv.slice().sort((a, b) => a.pv - b.pv)[0];
  }
  return adv[0];
}

/* Résout le tour d'une unité : renvoie une animation à jouer. */
function agir(u) {
  if (u.poison > 0) {
    u.poison--;
    infliger(null, u, 2, { pur: true });
    if (!u.vivant) return { u: u, type: 'rien', dur: 200 };
  }

  if (u.cap === 'soigne') {
    const blesses = allies(u).filter(a => a.pv < a.pvmax).sort((a, b) => (a.pv / a.pvmax) - (b.pv / b.pvmax));
    if (blesses.length) {
      return { u: u, type: 'soin', cibles: [blesses[0]], valeur: 5 + Math.floor(u.atq / 2), dur: 560 };
    }
  }

  const c = cible_par_defaut(u);
  if (!c) return { u: u, type: 'rien', dur: 200 };

  if (u.cap === 'eclat') return { u: u, type: 'sort', cibles: adversaires(u), dur: 700 };
  if (u.cap === 'double') return { u: u, type: 'melee', cibles: [c], coups: 2, dur: 640 };
  if (u.cap === 'poison') return { u: u, type: 'sort', cibles: [c], poison: 3, dur: 620 };
  if (u.art && u.art.arme === 'arc') return { u: u, type: 'tir', cibles: [c], dur: 560 };
  return { u: u, type: 'melee', cibles: [c], coups: 1, dur: 560 };
}

function appliquer(anim) {
  const u = anim.u;
  if (!u.vivant) return;
  if (anim.type === 'soin') {
    const c = anim.cibles[0];
    if (c && c.vivant) { soigner(c, anim.valeur); noter('✨ ' + u.nom + ' soigne ' + c.nom + '.'); }
    return;
  }
  if (anim.type === 'rien') return;

  const melee = anim.type === 'melee';
  const coups = anim.coups || 1;
  let total = 0, touches = 0;
  for (let k = 0; k < coups; k++) {
    anim.cibles.forEach(c => {
      if (!c.vivant) return;
      let base = atqEffectif(u) + Math.floor(Math.random() * 2);
      if (anim.cibles.length > 1) base = Math.max(1, Math.round(base * 0.65));  // une attaque de zone tape moins fort
      total += infliger(u, c, base, { melee: melee });
      touches++;
      if (anim.poison && c.vivant) { c.poison = Math.max(c.poison, anim.poison); flottant(c, '☠', '#8ce05a'); }
    });
  }
  if (touches) noter('⚔️ ' + u.nom + ' inflige ' + total + (anim.cibles.length > 1 ? ' (zone)' : '') + '.');
}

/* ------------------------- déroulement -------------------------- */

function prochainActeur() {
  let garde = 0;
  while (garde++ < 5000) {
    const prets = tous().filter(u => u.vivant && u.jauge >= 100);
    if (prets.length) {
      prets.sort((a, b) => (b.jauge - a.jauge) || (b.vit - a.vit));
      return prets[0];
    }
    tous().forEach(u => { if (u.vivant) u.jauge += Math.max(1, u.vit); });
  }
  return null;
}

function verifierFin() {
  if (B.fini) return;
  const a = vivants('allie').length, e = vivants('ennemi').length;
  if (a === 0 || e === 0) {
    B.fini = true;
    B.vainqueur = (e === 0 && a > 0) ? 'allie' : 'ennemi';
    B.finT = 0;
    noter(B.vainqueur === 'allie' ? '🏆 Niveau réussi.' : '☠️ Escouade anéantie.');
  }
}

function majCombat(dt) {
  B.t += dt;
  B.flottants.forEach(f => { f.t += dt; });
  B.flottants = B.flottants.filter(f => f.t < 900);
  tous().forEach(u => {
    if (u.flash > 0) u.flash = Math.max(0, u.flash - dt / 220);
    if (!u.vivant && u.mort < 1.2) u.mort += dt / 700;
  });

  if (B.fini) { B.finT += dt; if (B.finT > 900 && !B.rendu) { B.rendu = true; B.surFin(B.vainqueur, B.allies); } return; }

  if (B.anim) {
    B.anim.t += dt;
    if (!B.anim.applique && B.anim.t >= B.anim.dur * 0.45) {
      B.anim.applique = true;
      appliquer(B.anim);
      verifierFin();
    }
    if (B.anim.t >= B.anim.dur) { B.anim = null; B.attente = 160; }
    return;
  }

  B.attente -= dt;
  if (B.attente <= 0) {
    const u = prochainActeur();
    if (!u) { verifierFin(); return; }
    u.jauge -= 100;
    B.anim = agir(u);
    B.anim.t = 0;
    verifierFin();
  }
}

/* ---------------------------- rendu ----------------------------- */

function fondCombat(ctx, biome) {
  const themes = {
    foret:  { h: '#1d2b22', b: '#35503a', sol: '#2a3f2c', solb: '#1b2a1e', silo: '#24382a', accent: '#4e7a4a' },
    crypte: { h: '#17141f', b: '#2b2340', sol: '#241d31', solb: '#171223', silo: '#1e1930', accent: '#5b4bb0' },
    cendre: { h: '#1d0f0f', b: '#46201a', sol: '#331915', solb: '#20100d', silo: '#2a1310', accent: '#b03a2a' }
  };
  const t = themes[biome] || themes.foret;
  const g = ctx.createLinearGradient(0, 0, 0, SOL);
  g.addColorStop(0, t.h); g.addColorStop(1, t.b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, LARG, SOL);

  /* silhouettes de fond, dessinées en gros pixels pour rester raccord */
  ctx.fillStyle = t.silo;
  for (let i = 0; i < 9; i++) {
    const x = i * 56 - 10, h = 40 + ((i * 37) % 5) * 12;
    if (biome === 'foret') {
      ctx.fillRect(x + 18, SOL - h, 8, h);
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 6 - k * 2, SOL - h + k * 12, 32 + k * 4, 10);
    } else if (biome === 'crypte') {
      ctx.fillRect(x + 10, SOL - h, 20, h);
      ctx.fillRect(x + 4, SOL - h - 8, 32, 8);
    } else {
      ctx.fillRect(x + 4, SOL - h * 0.7, 40, h * 0.7);
    }
  }

  ctx.fillStyle = t.sol; ctx.fillRect(0, SOL, LARG, HAUT - SOL);
  ctx.fillStyle = t.solb; ctx.fillRect(0, SOL, LARG, 4);
  ctx.fillStyle = t.accent;
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % LARG, y = SOL + 8 + ((i * 53) % 30);
    ctx.globalAlpha = 0.18; ctx.fillRect(x, y, 3, 2);
  }
  ctx.globalAlpha = 1;
}

function barre(ctx, x, y, l, h, ratio, couleur, fond) {
  ctx.fillStyle = '#0d0b12'; ctx.fillRect(x - 1, y - 1, l + 2, h + 2);
  ctx.fillStyle = fond || '#3a3448'; ctx.fillRect(x, y, l, h);
  ctx.fillStyle = couleur; ctx.fillRect(x, y, Math.max(0, Math.round(l * ratio)), h);
}

function rendreCombat(ctx) {
  ctx.imageSmoothingEnabled = false;
  fondCombat(ctx, B.biome);

  const anim = B.anim;
  tous().forEach(u => {
    if (!u.vivant && u.mort >= 1.2) return;
    const ech = u.echelle;
    let dx = 0, dy = 0;

    /* respiration */
    dy += Math.sin((B.t / 420) + u.x) * 1.2;

    /* animation d'action */
    if (anim && anim.u === u && u.vivant) {
      const p = Math.min(1, anim.t / anim.dur);
      const bond = Math.sin(p * Math.PI);
      if (anim.type === 'melee') dx += bond * 26 * (u.camp === 'allie' ? 1 : -1);
      else dy -= bond * 6;
    }

    const alpha = u.vivant ? 1 : Math.max(0, 1 - u.mort);
    const bas = SOL + 2 + dy + (u.vivant ? 0 : u.mort * 6);

    /* ombre */
    ctx.globalAlpha = 0.28 * alpha;
    ctx.fillStyle = '#000';
    ctx.fillRect(Math.round(u.x + dx - ech * 4), SOL, ech * 8, 4);
    ctx.globalAlpha = 1;

    peindreUnite(ctx, u.art, ech, u.x + dx, bas, { flip: u.camp === 'ennemi', alpha: alpha });
    if (u.flash > 0 && u.vivant) {
      peindreUnite(ctx, u.art, ech, u.x + dx, bas, { flip: u.camp === 'ennemi', alpha: u.flash * 0.85, teinte: '#ffffff' });
    }

    if (u.vivant) {
      const l = u.boss ? 64 : 40;
      const y = SOL - ech * 16 - 14;
      barre(ctx, u.x - l / 2, y, l, 4, u.pv / u.pvmax, u.camp === 'allie' ? '#7fe08a' : '#e0645a');
      barre(ctx, u.x - l / 2, y + 6, l, 2, Math.min(1, u.jauge / 100), '#f0c860', '#2a2438');
      if (u.poison > 0) { ctx.fillStyle = '#8ce05a'; ctx.fillRect(u.x + l / 2 + 3, y, 3, 3); }
    }
  });

  /* projectiles */
  if (anim && (anim.type === 'tir' || anim.type === 'sort' || anim.type === 'soin')) {
    const p = (anim.t / anim.dur - 0.15) / 0.32;
    if (p > 0 && p < 1.2) {
      anim.cibles.forEach(c => {
        const x = anim.u.x + (c.x - anim.u.x) * Math.min(1, p);
        const y = (SOL - anim.u.echelle * 10) + ((SOL - c.echelle * 10) - (SOL - anim.u.echelle * 10)) * Math.min(1, p);
        if (anim.type === 'tir') { ctx.fillStyle = '#e8e0c8'; ctx.fillRect(Math.round(x) - 5, Math.round(y), 10, 2); }
        else if (anim.type === 'soin') { ctx.fillStyle = '#7fe08a'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); }
        else { ctx.fillStyle = '#c8a0ff'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6); ctx.fillStyle = '#f0e0ff'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); }
      });
    }
  }

  /* textes flottants */
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.textAlign = 'center';
  B.flottants.forEach(f => {
    const p = f.t / 900;
    ctx.globalAlpha = Math.max(0, 1 - p);
    ctx.fillStyle = '#100c18';
    ctx.fillText(f.txt, f.x + 1, f.y - p * 26 + 1);
    ctx.fillStyle = f.c;
    ctx.fillText(f.txt, f.x, f.y - p * 26);
  });
  ctx.globalAlpha = 1;

  if (B.fini) {
    ctx.fillStyle = 'rgba(12,9,18,0.62)';
    ctx.fillRect(0, 0, LARG, HAUT);
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillStyle = B.vainqueur === 'allie' ? '#f0c860' : '#e0645a';
    ctx.fillText(B.vainqueur === 'allie' ? 'NIVEAU RÉUSSI' : 'ESCOUADE BRISÉE', LARG / 2, HAUT / 2 + 6);
  }
  ctx.textAlign = 'left';
}

/* --------------------------- boucle ----------------------------- */

function lancerBoucle() {
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d');
  dernierTemps = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  const tick = (now) => {
    let dt = Math.min(60, now - dernierTemps);
    dernierTemps = now;
    if (B) {
      majCombat(dt * B.vitesse);
      rendreCombat(ctx);
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function arreterBoucle() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } B = null; }
