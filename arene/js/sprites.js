/* ---------------------------------------------------------------
   Rendu des sprites : on compose une grille 16x16 de caractères
   puis on la peint pixel par pixel sur un canvas hors écran.
   Le résultat est mis en cache (une seule peinture par sprite/taille).
   --------------------------------------------------------------- */

const _cacheSprites = new Map();
let _cacheId = 0;

function grilleSprite(art) {
  let g;
  if (art.sprite) {
    g = SPRITES[art.sprite].map(r => r.split(''));
  } else {
    g = TETES[art.tete].concat(CORPS[art.corps]).map(r => r.split(''));
  }
  if (art.arme && ARMES[art.arme]) {
    const a = ARMES[art.arme];
    a.px.forEach((ligne, y) => {
      ligne.split('').forEach((c, x) => {
        if (c === '.') return;
        const gy = a.oy + y, gx = a.ox + x;
        if (g[gy] && gx >= 0 && gx < 16) g[gy][gx] = c;
      });
    });
  }
  return g;
}

/* Retourne un canvas 16*echelle contenant le sprite peint. */
function canvasSprite(art, echelle) {
  if (!art._id) { art._id = 'sp' + (++_cacheId); }
  const cle = art._id + '@' + echelle;
  if (_cacheSprites.has(cle)) return _cacheSprites.get(cle);

  const g = grilleSprite(art);
  const cv = document.createElement('canvas');
  cv.width = 16 * echelle;
  cv.height = 16 * echelle;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  for (let y = 0; y < 16; y++) {
    const ligne = g[y];
    if (!ligne) continue;
    for (let x = 0; x < 16; x++) {
      const col = art.pal[ligne[x]];
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x * echelle, y * echelle, echelle, echelle);
    }
  }
  _cacheSprites.set(cle, cv);
  return cv;
}

/* Silhouette monochrome (éclair blanc quand l'unité est touchée). */
function canvasTeinte(art, echelle, couleur) {
  const base = canvasSprite(art, echelle);
  const cle = art._id + '@' + echelle + '#' + couleur;
  if (_cacheSprites.has(cle)) return _cacheSprites.get(cle);
  const cv = document.createElement('canvas');
  cv.width = base.width; cv.height = base.height;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(base, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = couleur;
  c.fillRect(0, 0, cv.width, cv.height);
  _cacheSprites.set(cle, cv);
  return cv;
}

/* Dessine une unité : cx = centre horizontal, bas = ligne de sol. */
function peindreUnite(ctx, art, echelle, cx, bas, opts) {
  opts = opts || {};
  const cv = opts.teinte ? canvasTeinte(art, echelle, opts.teinte) : canvasSprite(art, echelle);
  const l = cv.width, h = cv.height;
  const x = Math.round(cx - l / 2), y = Math.round(bas - h);
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  if (opts.flip) {
    ctx.translate(x + l, y);
    ctx.scale(-1, 1);
    ctx.drawImage(cv, 0, 0);
  } else {
    ctx.drawImage(cv, x, y);
  }
  ctx.restore();
}

/* Petit portrait pour les cartes / la collection. */
function portraitSprite(art, echelle) {
  const cv = document.createElement('canvas');
  cv.width = 16 * echelle; cv.height = 16 * echelle;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(canvasSprite(art, echelle), 0, 0);
  return cv;
}
