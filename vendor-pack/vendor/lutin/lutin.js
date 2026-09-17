/*!
 * Lutin 1.0.0 — sprites en pixel art à partir de grilles de caractères.
 * Aucune dépendance, aucun réseau, fonctionne en file://.
 * « Lutin » est le terme français officiel pour « sprite ».
 * Documentation : lutin-doc-complete.md (même dossier).
 */
(function (racine) {
  'use strict';

  const TRANSPARENT = '.';
  const INTERDITS = ' \'"`\\\t\n\r';
  const LETTRES_AUTO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*+=?@!~^-_:;<>|/()[]{}';
  const MAGENTA = [255, 0, 255, 255];

  const borner = (v, min, max) => Math.min(max, Math.max(min, v));

  // =====================================================================
  // COULEURS — conversions et retouches sur des chaînes '#rrggbb'
  // =====================================================================

  /** '#rgb', '#rgba', '#rrggbb' ou '#rrggbbaa' → [r, g, b, a] entre 0 et 255. */
  function versRgba(hex) {
    const erreur = () => new Error(`Lutin : couleur invalide « ${hex} » (attendu : #rrggbb)`);
    if (typeof hex !== 'string' || hex[0] !== '#') throw erreur();
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    if (h.length === 6) h += 'ff';
    if (h.length !== 8 || /[^0-9a-f]/i.test(h)) throw erreur();
    return [0, 2, 4, 6].map(i => parseInt(h.slice(i, i + 2), 16));
  }

  /** [r, g, b, a] → '#rrggbb', ou '#rrggbbaa' si la couleur est semi-transparente. */
  function versHex(r, g, b, a = 255) {
    const x = v => Math.round(borner(v, 0, 255)).toString(16).padStart(2, '0');
    return '#' + x(r) + x(g) + x(b) + (Math.round(a) < 255 ? x(a) : '');
  }

  /** [r, g, b] → [teinte 0–360, saturation 0–1, luminosité 0–1]. */
  function rgbVersHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h * 60, s, l];
  }

  /** [teinte, saturation, luminosité] → [r, g, b]. */
  function hslVersRgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    if (s === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const canal = t => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [canal(h + 1 / 3) * 255, canal(h) * 255, canal(h - 1 / 3) * 255];
  }

  /** Retouche la partie teinte/saturation/luminosité d'une couleur, en gardant son alpha. */
  function modifierHsl(hex, fn) {
    const [r, g, b, a] = versRgba(hex);
    const [h, s, l] = fn(...rgbVersHsl(r, g, b));
    return versHex(...hslVersRgb(h, borner(s, 0, 1), borner(l, 0, 1)), a);
  }

  /** Éclaircit : t = 0 inchangée, t = 1 blanche. */
  const eclaircir = (hex, t) => modifierHsl(hex, (h, s, l) => [h, s, l + (1 - l) * t]);

  /** Assombrit : t = 0 inchangée, t = 1 noire. */
  const assombrir = (hex, t) => modifierHsl(hex, (h, s, l) => [h, s, l * (1 - t)]);

  /** Change la saturation : t négatif = plus terne, positif = plus vif. */
  const saturer = (hex, t) => modifierHsl(hex, (h, s, l) => [h, s + t, l]);

  /** Fait tourner la teinte sur le cercle chromatique. */
  const tourner = (hex, degres) => modifierHsl(hex, (h, s, l) => [h + degres, s, l]);

  /** Mélange deux couleurs : t = 0 donne a, t = 1 donne b. */
  function melanger(a, b, t) {
    const ca = versRgba(a), cb = versRgba(b);
    return versHex(...ca.map((v, i) => v + (cb[i] - v) * t));
  }

  /** Version grise d'une couleur, à luminosité perçue égale. */
  function gris(hex) {
    const [r, g, b, a] = versRgba(hex);
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    return versHex(y, y, y, a);
  }

  /** Luminance relative (norme WCAG), entre 0 et 1. */
  function luminance(hex) {
    const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const [r, g, b] = versRgba(hex);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  /** Rapport de contraste entre deux couleurs, de 1 à 21. Au-dessus de 4.5 : texte lisible. */
  function contraste(a, b) {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  /** Distance perçue entre deux couleurs ; 0 = identiques. */
  function distance(a, b) {
    const [r1, g1, b1] = versRgba(a), [r2, g2, b2] = versRgba(b);
    const rm = (r1 + r2) / 2, dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  }

  /** Déplace une teinte vers une cible, d'au plus `pas` degrés, par le plus court chemin. */
  function versTeinte(h, cible, pas) {
    const d = ((cible - h + 540) % 360) - 180;
    return h + Math.sign(d) * Math.min(Math.abs(d), pas);
  }

  /**
   * Rampe d'ombrage, du plus clair au plus sombre, autour d'une couleur de base.
   * Les clairs glissent vers le jaune et les ombres vers le bleu : c'est ce qui rend un ombrage vivant.
   */
  function rampe(base, n = 3, options = {}) {
    const { ecart = 0.15, decalage = 8 } = options;
    const [r, g, b, a] = versRgba(base);
    const [h, s, l] = rgbVersHsl(r, g, b);
    const milieu = (n - 1) / 2;
    const couleurs = [];
    for (let i = 0; i < n; i++) {
      const pas = milieu - i;
      const cible = pas > 0 ? 55 : 235;
      const depart = s < 0.05 ? cible : h;
      const nh = pas === 0 ? h : versTeinte(depart, cible, Math.abs(pas) * decalage);
      const ns = borner(s + (pas > 0 ? -0.05 : 0.06) * Math.abs(pas), 0, 1);
      const nl = borner(l + pas * ecart, 0.03, 0.97);
      couleurs.push(versHex(...hslVersRgb(nh, ns, nl), a));
    }
    return couleurs;
  }

  // =====================================================================
  // PALETTES — immuables : chaque retouche renvoie une nouvelle palette
  // =====================================================================

  /** Refuse toute clé qui casserait la grille ou le code exporté. */
  function verifierLettre(l) {
    if (typeof l !== 'string' || l.length !== 1) {
      throw new Error(`Lutin : « ${l} » n'est pas une clé valide — une clé de palette fait exactement 1 caractère`);
    }
    if (l === TRANSPARENT) throw new Error(`Lutin : « ${TRANSPARENT} » est réservé à la transparence`);
    if (INTERDITS.includes(l)) {
      throw new Error(`Lutin : le caractère « ${JSON.stringify(l)} » est interdit (espace, guillemets, antislash)`);
    }
  }

  const cacheRgba = new WeakMap();

  class Palette {
    /** Crée une palette à partir d'un objet { lettre: '#couleur' }. */
    constructor(couleurs = {}) {
      const map = new Map();
      for (const [lettre, hex] of Object.entries(couleurs)) {
        verifierLettre(lettre);
        versRgba(hex);
        map.set(lettre, hex.toLowerCase());
      }
      this._couleurs = map;
      Object.freeze(this);
    }

    /** Palette à partir d'une liste de couleurs, lettres attribuées automatiquement. */
    static depuisListe(couleurs, lettres = LETTRES_AUTO) {
      if (couleurs.length > lettres.length) {
        throw new Error(`Lutin : ${couleurs.length} couleurs, mais seulement ${lettres.length} lettres disponibles`);
      }
      return new Palette(Object.fromEntries(couleurs.map((c, i) => [lettres[i], c])));
    }

    get taille() { return this._couleurs.size; }
    couleur(lettre) { return this._couleurs.get(lettre); }
    contient(lettre) { return this._couleurs.has(lettre); }
    lettres() { return [...this._couleurs.keys()]; }
    couleurs() { return [...this._couleurs.values()]; }
    versObjet() { return Object.fromEntries(this._couleurs); }
    toJSON() { return this.versObjet(); }

    /** Nouvelle palette avec des couleurs ajoutées ou remplacées. */
    avec(modifs) {
      const o = modifs instanceof Palette ? modifs.versObjet() : modifs;
      return new Palette({ ...this.versObjet(), ...o });
    }

    /** Nouvelle palette sans les lettres indiquées. */
    sans(...lettres) {
      const o = this.versObjet();
      lettres.flat().forEach(l => delete o[l]);
      return new Palette(o);
    }

    /** Nouvelle palette où chaque couleur passe par fn(couleur, lettre) — seulement `lettres` si précisé. */
    transformer(fn, lettres) {
      const cible = lettres ? new Set(lettres) : null;
      const o = {};
      for (const [l, c] of this._couleurs) o[l] = !cible || cible.has(l) ? fn(c, l) : c;
      return new Palette(o);
    }

    eclaircir(t, lettres) { return this.transformer(c => eclaircir(c, t), lettres); }
    assombrir(t, lettres) { return this.transformer(c => assombrir(c, t), lettres); }
    saturer(t, lettres) { return this.transformer(c => saturer(c, t), lettres); }
    tourner(degres, lettres) { return this.transformer(c => tourner(c, degres), lettres); }
    teinter(hex, t = 0.5, lettres) { return this.transformer(c => melanger(c, hex, t), lettres); }
    gris(lettres) { return this.transformer(c => gris(c), lettres); }

    /** Toutes les couleurs remplacées par une seule (flash blanc d'un personnage touché, ombre portée). */
    uni(hex, lettres) {
      versRgba(hex);
      return this.transformer(() => hex, lettres);
    }

    /** La lettre dont la couleur est la plus proche de `hex`. */
    plusProche(hex) {
      let meilleure = null, dMin = Infinity;
      for (const [l, c] of this._couleurs) {
        const d = distance(hex, c);
        if (d < dMin) { dMin = d; meilleure = l; }
      }
      if (meilleure === null) throw new Error('Lutin : impossible de chercher dans une palette vide');
      return meilleure;
    }

    /** [r, g, b, a] de chaque lettre, calculé une seule fois. */
    _rgba() {
      let t = cacheRgba.get(this);
      if (!t) {
        t = new Map([...this._couleurs].map(([l, c]) => [l, versRgba(c)]));
        cacheRgba.set(this, t);
      }
      return t;
    }
  }

  // =====================================================================
  // SPRITES — immuables : chaque transformation renvoie un nouveau sprite
  // =====================================================================

  const cacheCanvas = new WeakMap();

  /** Crée un canvas (lève une erreur claire hors navigateur). */
  function creerCanvas(w, h) {
    if (typeof document === 'undefined') {
      throw new Error('Lutin : le rendu demande un navigateur (document introuvable)');
    }
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, w);
    cv.height = Math.max(1, h);
    return cv;
  }

  /** Nom de clé utilisable tel quel dans un objet JavaScript, sinon entre guillemets. */
  const cleJs = l => (/^[A-Za-z_$]$/.test(l) ? l : `'${l}'`);

  class Sprite {
    /**
     * Crée un sprite. Accepte { nom, grille, palette }, { nom, cadres, palette }
     * ou le format JSON de l'éditeur DAB { name, w, h, palette, frames }.
     */
    constructor(def) {
      if (!def) throw new Error('Lutin : définition de sprite manquante');
      const nom = def.nom || def.name || '';
      const ici = nom ? `« ${nom} »` : 'sprite sans nom';
      const cadres = def.cadres || def.frames || (def.grille ? [def.grille] : null);
      if (!Array.isArray(cadres) || !cadres.length || !Array.isArray(cadres[0])) {
        throw new Error(`Lutin : ${ici} n'a pas de grille (attendu : un tableau de lignes)`);
      }

      const hauteur = cadres[0].length;
      const largeur = hauteur ? String(cadres[0][0]).length : 0;
      cadres.forEach((grille, c) => {
        if (!Array.isArray(grille) || grille.length !== hauteur) {
          throw new Error(`Lutin : ${ici}, le cadre ${c} fait ${grille && grille.length} lignes au lieu de ${hauteur}`);
        }
        grille.forEach((ligne, y) => {
          if (typeof ligne !== 'string') {
            throw new Error(`Lutin : ${ici}, cadre ${c}, ligne ${y} n'est pas une chaîne de caractères`);
          }
          if (ligne.length !== largeur) {
            throw new Error(`Lutin : ${ici}, cadre ${c}, ligne ${y} : ${ligne.length} caractères au lieu de ${largeur}`);
          }
          for (let x = 0; x < ligne.length; x++) {
            if (INTERDITS.includes(ligne[x])) {
              throw new Error(`Lutin : ${ici}, cadre ${c}, ligne ${y}, colonne ${x} : caractère ${JSON.stringify(ligne[x])} interdit (utilise « ${TRANSPARENT} » pour la transparence)`);
            }
          }
        });
      });

      this.nom = nom;
      this.largeur = largeur;
      this.hauteur = hauteur;
      this.cadres = Object.freeze(cadres.map(g => Object.freeze([...g])));
      this.palette = def.palette instanceof Palette ? def.palette : new Palette(def.palette || {});
      Object.freeze(this);
    }

    get nbCadres() { return this.cadres.length; }

    /** Vérifie que chaque lettre utilisée a une couleur, et signale les couleurs inutiles. */
    valider() {
      const utilisees = new Set();
      for (const g of this.cadres) {
        for (const ligne of g) for (const c of ligne) if (c !== TRANSPARENT) utilisees.add(c);
      }
      const manquantes = [...utilisees].filter(c => !this.palette.contient(c)).sort();
      const inutiles = this.palette.lettres().filter(c => !utilisees.has(c)).sort();
      return {
        ok: manquantes.length === 0,
        erreurs: manquantes.map(c => `couleur manquante pour « ${c} » (affichée en magenta)`),
        avertissements: inutiles.map(c => `couleur « ${c} » définie mais jamais utilisée`),
        lettres: [...utilisees].sort()
      };
    }

    /** Copie avec d'autres réglages. */
    _avec(modifs) {
      return new Sprite({ nom: this.nom, cadres: this.cadres, palette: this.palette, ...modifs });
    }

    /** Applique fn(grille, index) à chaque cadre. */
    _mapCadres(fn, palette = this.palette) {
      return this._avec({ cadres: this.cadres.map(fn), palette });
    }

    /** Même dessin, autres couleurs. Un objet partiel ne remplace que les lettres indiquées. */
    avecPalette(palette) {
      return this._avec({ palette: palette instanceof Palette ? palette : this.palette.avec(palette) });
    }

    /** Même sprite, sous un autre nom. */
    renommer(nom) { return this._avec({ nom }); }

    /** Miroir : 'h' gauche-droite, 'v' haut-bas. */
    retourner(sens = 'h') {
      if (sens === 'h') return this._mapCadres(g => g.map(l => [...l].reverse().join('')));
      if (sens === 'v') return this._mapCadres(g => [...g].reverse());
      throw new Error(`Lutin : sens de retournement inconnu « ${sens} » (attendu 'h' ou 'v')`);
    }

    /** Pivote par quarts de tour dans le sens horaire. */
    pivoter(quarts = 1) {
      let s = this;
      for (let i = 0; i < ((quarts % 4) + 4) % 4; i++) {
        s = s._mapCadres(g => {
          const out = [];
          for (let x = 0; x < (g[0] || '').length; x++) {
            let ligne = '';
            for (let y = g.length - 1; y >= 0; y--) ligne += g[y][x];
            out.push(ligne);
          }
          return out;
        });
      }
      return s;
    }

    /** Ajoute des marges transparentes (même ordre qu'en CSS : haut, droite, bas, gauche). */
    marges(haut = 1, droite = haut, bas = haut, gauche = droite) {
      const vide = TRANSPARENT.repeat(this.largeur + gauche + droite);
      const g0 = TRANSPARENT.repeat(gauche), d0 = TRANSPARENT.repeat(droite);
      return this._mapCadres(g => [
        ...Array(haut).fill(vide),
        ...g.map(l => g0 + l + d0),
        ...Array(bas).fill(vide)
      ]);
    }

    /** Retire les bords entièrement transparents (le même cadrage pour tous les cadres). */
    recadrer() {
      let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
      for (const g of this.cadres) {
        g.forEach((l, y) => {
          for (let x = 0; x < l.length; x++) {
            if (l[x] === TRANSPARENT) continue;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        });
      }
      if (x1 < 0) return this;
      return this._mapCadres(g => g.slice(y0, y1 + 1).map(l => l.slice(x0, x1 + 1)));
    }

    /**
     * Ajoute un contour autour de la silhouette.
     * Par défaut le sprite grandit d'un pixel de chaque côté, pour que le contour ne soit jamais coupé.
     */
    contour(lettre = 'K', options = {}) {
      const { couleur, diagonales = false, agrandir = true } = options;
      verifierLettre(lettre);
      const palette = couleur ? this.palette.avec({ [lettre]: couleur }) : this.palette;
      if (!palette.contient(lettre)) {
        throw new Error(`Lutin : la lettre de contour « ${lettre} » n'a pas de couleur — passe { couleur: '#...' }`);
      }
      const voisins = diagonales
        ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
        : [[0, -1], [-1, 0], [1, 0], [0, 1]];
      const base = agrandir ? this.marges(1) : this;
      return base._mapCadres(g => g.map((l, y) => {
        let out = '';
        for (let x = 0; x < l.length; x++) {
          if (l[x] !== TRANSPARENT) { out += l[x]; continue; }
          const touche = voisins.some(([dx, dy]) => {
            const v = g[y + dy] && g[y + dy][x + dx];
            return v !== undefined && v !== TRANSPARENT;
          });
          out += touche ? lettre : TRANSPARENT;
        }
        return out;
      }), palette);
    }

    /** Pose un autre sprite par-dessus, à la position (x, y). Les deux palettes sont fusionnées. */
    superposer(autre, x = 0, y = 0) {
      const conflit = autre.palette.lettres().find(
        l => this.palette.contient(l) && this.palette.couleur(l) !== autre.palette.couleur(l)
      );
      if (conflit) {
        throw new Error(`Lutin : superposition impossible, « ${conflit} » n'a pas la même couleur dans les deux palettes`);
      }
      const palette = this.palette.avec(autre.palette);
      return this._mapCadres((g, i) => {
        const dessus = autre.cadres[i % autre.nbCadres];
        return g.map((l, ligne) => {
          const ly = ligne - y;
          if (ly < 0 || ly >= dessus.length) return l;
          const chars = [...l];
          for (let lx = 0; lx < dessus[ly].length; lx++) {
            const c = dessus[ly][lx], tx = x + lx;
            if (c !== TRANSPARENT && tx >= 0 && tx < chars.length) chars[tx] = c;
          }
          return chars.join('');
        });
      }, palette);
    }

    /** Les pixels d'un cadre en RVBA (4 octets par pixel). Les lettres sans couleur sortent en magenta. */
    pixels(cadre = 0) {
      const g = this.cadres[cadre];
      if (!g) throw new Error(`Lutin : cadre ${cadre} inexistant (${this.nbCadres} cadre(s))`);
      const rgba = this.palette._rgba();
      const out = new Uint8ClampedArray(this.largeur * this.hauteur * 4);
      let i = 0;
      for (const ligne of g) {
        for (let x = 0; x < ligne.length; x++, i += 4) {
          const c = ligne[x];
          if (c === TRANSPARENT) continue;
          const v = rgba.get(c) || MAGENTA;
          out[i] = v[0]; out[i + 1] = v[1]; out[i + 2] = v[2]; out[i + 3] = v[3];
        }
      }
      return out;
    }

    /** Le cadre sur un canvas agrandi `echelle` fois. Mis en cache : ne dessine pas dessus. */
    canvas(echelle = 1, cadre = 0) {
      echelle = Math.max(1, Math.floor(echelle));
      let cache = cacheCanvas.get(this);
      if (!cache) { cache = new Map(); cacheCanvas.set(this, cache); }
      const cle = cadre + ':' + echelle;
      if (cache.has(cle)) return cache.get(cle);

      let cv;
      if (echelle === 1) {
        const donnees = this.pixels(cadre);
        cv = creerCanvas(this.largeur, this.hauteur);
        if (this.largeur && this.hauteur) {
          const ctx = cv.getContext('2d');
          const img = ctx.createImageData(this.largeur, this.hauteur);
          img.data.set(donnees);
          ctx.putImageData(img, 0, 0);
        }
      } else {
        const base = this.canvas(1, cadre);
        cv = creerCanvas(this.largeur * echelle, this.hauteur * echelle);
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(base, 0, 0, cv.width, cv.height);
      }
      cache.set(cle, cv);
      return cv;
    }

    /** Un canvas neuf, à insérer dans la page (un même élément ne peut pas être à deux endroits). */
    nouveauCanvas(echelle = 1, cadre = 0) {
      const src = this.canvas(echelle, cadre);
      const cv = creerCanvas(src.width, src.height);
      cv.getContext('2d').drawImage(src, 0, 0);
      cv.style.imageRendering = 'pixelated';
      return cv;
    }

    /**
     * Dessine sur un contexte 2D.
     * options : echelle, cadre, ancre ('haut-gauche' | 'centre' | 'bas-centre'), miroir, alpha.
     */
    dessiner(ctx, x, y, options = {}) {
      const { echelle = 1, cadre = 0, ancre = 'haut-gauche', miroir = false, alpha } = options;
      const cv = this.canvas(echelle, cadre);
      const w = cv.width, h = cv.height;
      let dx, dy;
      if (ancre === 'haut-gauche') { dx = x; dy = y; }
      else if (ancre === 'centre') { dx = x - w / 2; dy = y - h / 2; }
      else if (ancre === 'bas-centre') { dx = x - w / 2; dy = y - h; }
      else throw new Error(`Lutin : ancre inconnue « ${ancre} » (haut-gauche, centre ou bas-centre)`);
      dx = Math.round(dx);
      dy = Math.round(dy);

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (alpha !== undefined) ctx.globalAlpha *= alpha;
      if (miroir) {
        ctx.translate(dx + w, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(cv, 0, 0);
      } else {
        ctx.drawImage(cv, dx, dy);
      }
      ctx.restore();
    }

    /** Tous les cadres côte à côte sur un seul canvas. */
    planche(echelle = 1) {
      const w = this.largeur * echelle, h = this.hauteur * echelle;
      const cv = creerCanvas(w * this.nbCadres, h);
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.cadres.forEach((_, i) => ctx.drawImage(this.canvas(echelle, i), i * w, 0));
      return cv;
    }

    /** Exporte un cadre en PNG (promesse d'un Blob). */
    png(echelle = 1, cadre = 0) {
      const cv = this.canvas(echelle, cadre);
      return new Promise((ok, ko) => {
        cv.toBlob(b => (b ? ok(b) : ko(new Error('Lutin : export PNG impossible'))), 'image/png');
      });
    }

    /** Prépare une animation qui parcourt les cadres. */
    animation(options) { return new Animation(this, options); }

    /** Le sprite en code JavaScript, prêt à coller dans un fichier. */
    versCode(nom = this.nom || 'monSprite') {
      const q = JSON.stringify(nom).slice(1, -1).replace(/'/g, "\\'");
      const pal = this.palette.lettres()
        .map(l => `    ${cleJs(l)}: '${this.palette.couleur(l)}'`)
        .join(',\n');
      const bloc = (g, indent) => g.map(l => `${indent}'${l}'`).join(',\n');
      const corps = this.nbCadres === 1
        ? `  grille: [\n${bloc(this.cadres[0], '    ')}\n  ]`
        : `  cadres: [\n${this.cadres.map(g => `    [\n${bloc(g, '      ')}\n    ]`).join(',\n')}\n  ]`;
      return `Lutin.enregistrer('${q}', Lutin.sprite({\n  nom: '${q}',\n  palette: {\n${pal}\n  },\n${corps}\n}));\n`;
    }

    /** Format JSON compatible avec l'éditeur DAB. */
    toJSON() {
      return {
        name: this.nom,
        w: this.largeur,
        h: this.hauteur,
        palette: this.palette.versObjet(),
        frames: this.cadres.map(g => [...g])
      };
    }
  }

  // =====================================================================
  // ANIMATION — pilotée par le temps, sans minuteur interne
  // =====================================================================

  class Animation {
    /** options : ips (images par seconde), boucle, sequence (ordre des cadres, avec répétitions possibles). */
    constructor(sprite, { ips = 8, boucle = true, sequence } = {}) {
      this.sprite = sprite;
      this.ips = ips;
      this.boucle = boucle;
      this.sequence = Object.freeze(sequence ? [...sequence] : sprite.cadres.map((_, i) => i));
      if (!this.sequence.length) throw new Error('Lutin : une animation a besoin d\'au moins un cadre');
      const hors = this.sequence.find(i => !sprite.cadres[i]);
      if (hors !== undefined) {
        throw new Error(`Lutin : la séquence contient le cadre ${hors}, qui n'existe pas (${sprite.nbCadres} cadre(s))`);
      }
      Object.freeze(this);
    }

    /** Durée d'un tour complet, en millisecondes. */
    get duree() { return (this.sequence.length / this.ips) * 1000; }

    /** Numéro du cadre à afficher après `temps` millisecondes. */
    cadre(temps) {
      const n = Math.floor((temps * this.ips) / 1000);
      const t = this.sequence.length;
      const i = this.boucle ? ((n % t) + t) % t : borner(n, 0, t - 1);
      return this.sequence[i];
    }

    /** Vrai quand une animation sans boucle est arrivée au bout. */
    terminee(temps) { return !this.boucle && temps >= this.duree; }

    /** Dessine le bon cadre pour l'instant `temps`. */
    dessiner(ctx, x, y, temps, options = {}) {
      this.sprite.dessiner(ctx, x, y, { ...options, cadre: this.cadre(temps) });
    }
  }

  // =====================================================================
  // IMPORT D'IMAGES — pour dessiner dans un vrai éditeur puis convertir
  // =====================================================================

  /**
   * Sprite à partir d'une image déjà chargée (<img>, canvas).
   * options : nom, palette (force les couleurs vers celles-ci), largeurCadre (planche d'animation),
   *           seuilAlpha (en dessous : transparent, défaut 128), garderAlpha.
   */
  function depuisImage(source, options = {}) {
    const { nom = '', largeurCadre, seuilAlpha = 128, garderAlpha = false } = options;
    const palette = options.palette && !(options.palette instanceof Palette)
      ? new Palette(options.palette) : options.palette;
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    if (largeurCadre && w % largeurCadre) {
      throw new Error(`Lutin : l'image fait ${w} px de large, pas un multiple de largeurCadre (${largeurCadre})`);
    }

    const cv = creerCanvas(w, h);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    let data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      throw new Error('Lutin : le navigateur bloque la lecture de cette image (fichier local en file://) — passe par Lutin.depuisFichier()');
    }

    const lettreDe = new Map();
    const couleurs = {};
    const lignes = [];
    for (let y = 0; y < h; y++) {
      let ligne = '';
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = data[i + 3];
        if (a < seuilAlpha) { ligne += TRANSPARENT; continue; }
        const hex = versHex(data[i], data[i + 1], data[i + 2], garderAlpha ? a : 255);
        let l = lettreDe.get(hex);
        if (l === undefined) {
          if (palette) {
            l = palette.plusProche(hex);
          } else {
            if (lettreDe.size >= LETTRES_AUTO.length) {
              throw new Error(`Lutin : l'image contient plus de ${LETTRES_AUTO.length} couleurs — réduis sa palette avant l'import`);
            }
            l = LETTRES_AUTO[lettreDe.size];
            couleurs[l] = hex;
          }
          lettreDe.set(hex, l);
        }
        ligne += l;
      }
      lignes.push(ligne);
    }

    const pal = palette || couleurs;
    if (!largeurCadre) return new Sprite({ nom, grille: lignes, palette: pal });
    const cadres = Array.from({ length: w / largeurCadre }, (_, c) =>
      lignes.map(l => l.slice(c * largeurCadre, (c + 1) * largeurCadre)));
    return new Sprite({ nom, cadres, palette: pal });
  }

  /** Sprite à partir d'un fichier choisi par l'utilisateur. Passe par une data URL : fonctionne en file://. */
  function depuisFichier(fichier, options = {}) {
    return new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onerror = () => ko(new Error('Lutin : lecture du fichier impossible'));
      lecteur.onload = () => {
        const img = new Image();
        img.onerror = () => ko(new Error("Lutin : ce fichier n'est pas une image lisible"));
        img.onload = () => {
          try {
            const nom = options.nom || fichier.name.replace(/\.[^.]+$/, '');
            ok(depuisImage(img, { ...options, nom }));
          } catch (e) {
            ko(e);
          }
        };
        img.src = lecteur.result;
      };
      lecteur.readAsDataURL(fichier);
    });
  }

  // =====================================================================
  // REGISTRE ET PALETTES CÉLÈBRES
  // =====================================================================

  const registre = new Map();

  /** Range un sprite sous un nom, pour le retrouver ailleurs dans le projet. */
  function enregistrer(nom, sprite) {
    const s = sprite instanceof Sprite ? sprite : new Sprite({ nom, ...sprite });
    registre.set(nom, s);
    return s;
  }

  /** Retrouve un sprite rangé ; l'erreur liste les noms connus. */
  function obtenir(nom) {
    const s = registre.get(nom);
    if (!s) {
      const connus = [...registre.keys()].join(', ') || 'aucun';
      throw new Error(`Lutin : aucun sprite nommé « ${nom} » (connus : ${connus})`);
    }
    return s;
  }

  const PALETTES = Object.freeze({
    pico8: Object.freeze([
      '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
      '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa'
    ]),
    gameboy: Object.freeze(['#0f380f', '#306230', '#8bac0f', '#9bbc0f']),
    sweetie16: Object.freeze([
      '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179',
      '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
    ])
  });

  function palette(couleurs) { return new Palette(couleurs); }
  palette.depuisListe = Palette.depuisListe;

  const Lutin = Object.freeze({
    version: '1.0.0',
    TRANSPARENT,
    sprite: def => new Sprite(def),
    palette,
    depuisJSON: obj => new Sprite(typeof obj === 'string' ? JSON.parse(obj) : obj),
    depuisImage,
    depuisFichier,
    enregistrer,
    obtenir,
    existe: nom => registre.has(nom),
    liste: () => [...registre.keys()],
    couleur: Object.freeze({
      versRgba, versHex, rgbVersHsl, hslVersRgb,
      eclaircir, assombrir, saturer, tourner, melanger, gris,
      luminance, contraste, distance, rampe
    }),
    palettes: PALETTES,
    Sprite,
    Palette,
    Animation
  });

  racine.Lutin = Lutin;
  if (typeof module !== 'undefined' && module.exports) module.exports = Lutin;
})(typeof window !== 'undefined' ? window : globalThis);
