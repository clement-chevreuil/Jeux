/**
 * Transforme une grille de caractères + une palette en image, dessinée sur un canvas.
 * Chaque image est mise en cache : elle n'est peinte qu'une seule fois par taille.
 */

const _cacheImages = new Map();
let _prochainId = 0;

/** Construit la grille complète d'un personnage : tête + corps, ou une silhouette seule. */
function construireGrille(aspect) {
  let grille;
  if (aspect.silhouette) {
    grille = SILHOUETTES[aspect.silhouette].map(ligne => ligne.split(''));
  } else {
    grille = TETES[aspect.tete].concat(CORPS[aspect.corps]).map(ligne => ligne.split(''));
  }
  if (aspect.objet && OBJETS[aspect.objet]) {
    const o = OBJETS[aspect.objet];
    o.px.forEach((ligne, y) => {
      ligne.split('').forEach((c, x) => {
        if (c === '.') return;
        const gy = o.oy + y, gx = o.ox + x;
        if (grille[gy] && gx >= 0 && gx < grille[gy].length) grille[gy][gx] = c;
      });
    });
  }
  return grille;
}

/** Peint un aspect sur un petit canvas hors écran, à l'échelle demandée, et le garde en cache. */
function canvasAspect(aspect, echelle) {
  if (!aspect._id) aspect._id = 'im' + (++_prochainId);
  const cle = aspect._id + '@' + echelle;
  if (_cacheImages.has(cle)) return _cacheImages.get(cle);

  const grille = construireGrille(aspect);
  const largeur = grille[0].length;
  const cv = document.createElement('canvas');
  cv.width = largeur * echelle;
  cv.height = grille.length * echelle;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  grille.forEach((ligne, y) => {
    ligne.forEach((c, x) => {
      const couleur = aspect.pal[c];
      if (!couleur) return;
      ctx.fillStyle = couleur;
      ctx.fillRect(x * echelle, y * echelle, echelle, echelle);
    });
  });
  _cacheImages.set(cle, cv);
  return cv;
}

/** Dessine un personnage dans une scène : cx = centre horizontal, bas = ligne de sol. */
function peindrePersonnage(ctx, aspect, echelle, cx, bas, options) {
  options = options || {};
  const cv = canvasAspect(aspect, echelle);
  const l = cv.width, h = cv.height;
  const x = Math.round(cx - l / 2), y = Math.round(bas - h);
  ctx.save();
  if (options.alpha != null) ctx.globalAlpha = options.alpha;
  if (options.flip) {
    ctx.translate(x + l, y);
    ctx.scale(-1, 1);
    ctx.drawImage(cv, 0, 0);
  } else {
    ctx.drawImage(cv, x, y);
  }
  ctx.restore();
}

/** Petite image isolée, pour une carte ou une vignette d'ennemi. */
function portraitAspect(aspect, echelle) {
  const cv = document.createElement('canvas');
  const source = canvasAspect(aspect, echelle);
  cv.width = source.width;
  cv.height = source.height;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0);
  return cv;
}
