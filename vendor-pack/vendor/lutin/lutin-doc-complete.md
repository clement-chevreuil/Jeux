# Documentation complète Lutin (hors-ligne)

Version couverte : 1.0.0 — `vendor/lutin/lutin.js`

```html
<script src="vendor/lutin/lutin.js"></script>
```

Expose le global `Lutin`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Lutin gère des sprites en pixel art décrits comme du texte** : une grille de lettres, plus une palette qui dit ce que chaque lettre veut dire. « Lutin » est le terme français officiel pour « sprite ».

```js
const s = Lutin.sprite({
  nom: 'gobelin',
  grille: ['.RR.', 'RRRR', '.RR.'],
  palette: { R: '#5c8f4a' }
});
```

### Pourquoi pas une image

Une image (`.png`) est un fichier binaire : illisible dans un diff, impossible à corriger d'un coup d'œil, invisible sans un éditeur d'image. Une grille de texte se lit, se corrige, se versionne comme du code — c'est exactement le principe déjà utilisé dans [aspects.js](../../grimoire/js/data/aspects.js) et [heros.js](../../grimoire/js/data/heros.js) du projet Grimoire, où chaque personnage est une liste de chaînes de caractères plus un objet de couleurs.

### Pourquoi une librairie plutôt que le code artisanal existant

`grimoire/js/rendu/sprites.js` fait déjà l'essentiel (grille → canvas), mais tout le reste — ombrer une couleur, générer un contour, superposer une arme, réordonner une palette, exporter — a dû être réécrit à la main à chaque sprite, avec de vrais bugs au passage (une clé de palette à deux caractères qui casse tout l'alignement, un contour qui déborde du canevas). Lutin encapsule ces opérations une fois, testées, pour ne plus jamais les réécrire.

### Ce que j'ai vérifié avant de l'écrire

Une recherche a été faite avant d'ajouter ce fichier : la seule chose qui correspond au même format (grille de caractères + palette) est [DAB](https://github.com/eetu/dab), mais c'est un **éditeur graphique** autonome (TypeScript + backend Rust, pensé pour tourner en local avec accès disque), pas une librairie à inclure dans une page. Rien d'existant ne fait ce que fait Lutin : une petite API pour créer, transformer, ombrer et dessiner ces sprites depuis du code.

### Quand l'utiliser

- Tout projet qui dessine des personnages ou objets en pixel art sans fichier image
- Besoin de variantes de couleur d'un même sprite (ennemi normal / élite / boss)
- Besoin d'un contour automatique, de miroir, de rotation, d'ombrage cohérent
- Convertir une grille dessinée à la main en un vrai fichier `.js` réutilisable

### Quand s'en passer

- Un seul sprite fixe, jamais transformé → une fonction `fillRect` suivant la grille suffit, comme le fait déjà `sprites.js`
- De l'art plus détaillé que quelques dizaines de pixels → une vraie image `.png` (dessinée dans un éditeur, intégrée localement) est plus adaptée

Poids : environ 15 Ko, non minifié (c'est un fichier lisible, pas une dépendance à décortiquer).

---

## 1. Créer un sprite

```js
const hero = Lutin.sprite({
  nom: 'chevalier',
  grille: [
    '.SS.',
    'SSSS',
    '.SS.'
  ],
  palette: { S: '#ccd4dc' }
});
```

Un point (`.`) est transparent. Toute autre lettre doit être définie dans `palette`, sinon `valider()` la signale (section 3) et le rendu l'affiche en **magenta** — une couleur volontairement criarde pour repérer l'oubli au premier coup d'œil.

Plusieurs cadres, pour une animation :

```js
const flamme = Lutin.sprite({
  nom: 'flamme',
  cadres: [
    ['.F.', 'FFF'],
    ['F.F', '.F.'],
    ['.F.', 'FFF']
  ],
  palette: { F: '#f0a030' }
});
```

Toutes les lignes d'un même sprite doivent faire la même longueur, et tous les cadres la même hauteur et largeur. Une grille mal formée lève une erreur précise :

```js
Lutin.sprite({ nom: 'x', grille: ['RR', 'RRR'], palette: { R: '#f00' } });
// Erreur : Lutin : « x », cadre 0, ligne 1 : 3 caractères au lieu de 2
```

Les lettres de palette interdites (espace, guillemets, antislash, et `.` qui veut dire transparent) sont refusées à la construction, pas silencieusement ignorées :

```js
Lutin.palette({ ' ': '#fff' });
// Erreur : Lutin : le caractère " " est interdit (espace, guillemets, antislash)
```

### Vérifier un sprite

```js
const rapport = hero.valider();
rapport.ok;              // true si tout est en ordre
rapport.erreurs;         // ['couleur manquante pour « Z » (affichée en magenta)']
rapport.avertissements;  // ['couleur « B » définie mais jamais utilisée']
rapport.lettres;         // toutes les lettres réellement utilisées dans la grille
```

Un sprite reste **utilisable** même invalide (il se dessine en magenta) — `valider()` sert à le repérer pendant le développement, pas à bloquer le rendu.

---

## 2. La palette

Une `Palette` est **immuable** : chaque méthode renvoie une nouvelle palette, l'originale ne change jamais. C'est ce qui permet de dériver des variantes sans jamais risquer d'altérer le sprite de base.

```js
const base = Lutin.palette({ R: '#7fada0', D: '#4f7a6e' });

base.couleur('R');        // '#7fada0'
base.taille;               // 2
base.lettres();             // ['R', 'D']
base.contient('R');         // true
base.versObjet();           // { R: '#7fada0', D: '#4f7a6e' }
```

### Construire

```js
Lutin.palette({ R: '#ff0000', B: '#0000ff' });

// à partir d'une simple liste de couleurs, lettres attribuées automatiquement (A, B, C, …)
Lutin.palette.depuisListe(['#ff0000', '#00ff00', '#0000ff']);
```

### Dériver

```js
base.avec({ V: '#9fffe0' });          // ajoute ou remplace des couleurs
base.sans('D');                        // retire des lettres
base.transformer((c, lettre) => c);    // passe chaque couleur dans une fonction

base.eclaircir(0.3);                   // 0 = inchangé, 1 = blanc
base.assombrir(0.3);                   // 0 = inchangé, 1 = noir
base.saturer(0.2);                     // négatif = plus terne
base.tourner(180);                     // fait tourner la teinte (degrés)
base.teinter('#ff0000', 0.4);          // mélange vers une couleur
base.gris();                           // désature à luminosité égale
base.uni('#ffffff');                   // toutes les couleurs remplacées par une seule
```

Chaque méthode accepte un deuxième argument optionnel : la liste des lettres à toucher (les autres restent inchangées).

```js
base.assombrir(0.5, ['D']);   // seule la lettre D s'assombrit
```

### Trouver une couleur proche

```js
base.plusProche('#80a090');   // 'R' — la lettre dont la couleur est la plus proche
```

Sert notamment à `Lutin.depuisImage()` (section 7) pour ramener une image vers une palette imposée.

---

## 3. Les couleurs (`Lutin.couleur`)

Ces fonctions travaillent directement sur des chaînes `'#rrggbb'` — utile même sans passer par un sprite.

```js
const C = Lutin.couleur;

C.versRgba('#f00');            // [255, 0, 0, 255] — accepte aussi #rgba, #rrggbb, #rrggbbaa
C.versHex(255, 0, 0);          // '#ff0000'
C.versHex(255, 0, 0, 128);     // '#ff000080' — alpha seulement s'il n'est pas opaque

C.rgbVersHsl(255, 0, 0);       // [0, 1, 0.5]
C.hslVersRgb(0, 1, 0.5);       // [255, 0, 0]

C.eclaircir('#336699', 0.3);
C.assombrir('#336699', 0.3);
C.saturer('#336699', 0.2);
C.tourner('#336699', 90);
C.melanger('#000000', '#ffffff', 0.5);   // '#808080'
C.gris('#ff0000');

C.luminance('#336699');         // 0 (noir) à 1 (blanc), norme WCAG
C.contraste('#000000', '#ffffff');   // 21 — rapport de contraste, utile pour vérifier la lisibilité d'un texte
C.distance('#ff0000', '#ff0505');    // petite distance perçue = couleurs proches
```

### `rampe()` — la fonction la plus utile pour un ombrage cohérent

```js
C.rampe('#7fada0', 3);
// ['#a8c9bf', '#7fada0', '#4f7a6e']   — du plus clair au plus sombre
```

Une rampe naïve (juste éclaircir/assombrir la même teinte) donne un ombrage plat et terne. `rampe()` fait ce qu'un pixel artiste fait à la main : les tons clairs glissent légèrement vers le jaune, les tons sombres vers le bleu — c'est ce qui donne un ombrage qui a l'air peint plutôt que dégradé au filtre.

```js
C.rampe('#7fada0', 5, {
  ecart: 0.15,     // écart de luminosité entre les tons (défaut 0.15)
  decalage: 8       // force du glissement de teinte, en degrés par ton (défaut 8)
});
```

Le ton du milieu est toujours la couleur de départ, inchangée — pratique pour l'utiliser directement comme couleur « normale » du dégradé.

---

## 4. Transformer un sprite

Comme la palette, un `Sprite` est immuable : chaque transformation renvoie un **nouveau** sprite.

```js
hero.retourner('h');        // miroir horizontal
hero.retourner('v');        // miroir vertical
hero.pivoter(1);             // un quart de tour horaire ; pivoter(-1) = sens inverse
hero.marges(1);              // 1 pixel transparent tout autour
hero.marges(2, 0, 0, 0);      // haut, droite, bas, gauche — comme en CSS
hero.recadrer();             // retire les bords entièrement transparents
```

### Contour automatique

C'est la technique qui a réglé le sprite du chevalier de Grimoire (voir la conversation qui a mené à ce fichier) : chaque pixel transparent collé à un pixel peint devient un contour.

```js
hero.contour('K', { couleur: '#141018' });
```

Par défaut le sprite **grandit d'un pixel** de chaque côté, pour que le contour d'un personnage qui touche déjà le bord de sa grille ne soit jamais coupé :

```js
hero.contour('K', { couleur: '#000', agrandir: false });   // désactive ce comportement
hero.contour('K', { couleur: '#000', diagonales: true });   // contour aussi en diagonale (plus épais aux coins)
```

### Superposer (armes, accessoires)

```js
const corps = Lutin.sprite({ grille: ['SSS', 'SSS'], palette: { S: '#ccc' } });
const epee  = Lutin.sprite({ grille: ['L.', 'L.'], palette: { L: '#e8e' } });

corps.superposer(epee, 2, 0);   // pose l'épée à la position (x=2, y=0), ce qui dépasse est coupé
```

Les deux palettes sont fusionnées. Si les deux sprites utilisent la même lettre pour deux couleurs différentes, c'est une erreur — mieux vaut le savoir tout de suite que de dessiner la mauvaise couleur en silence :

```js
// Erreur : Lutin : superposition impossible, « R » n'a pas la même couleur dans les deux palettes
```

### Recolorer

```js
hero.avecPalette({ S: '#ff0000' });          // ne change que S, garde le reste
hero.avecPalette(Lutin.palette({ S: '#f00' })); // remplace la palette entière
```

---

## 5. Dessiner

### Sur un canvas caché, mis en cache

```js
const cv = hero.canvas(4);          // le sprite peint à l'échelle 4, un <canvas>
```

Chaque combinaison (cadre, échelle) n'est peinte **qu'une seule fois** — les appels suivants renvoient le même canvas déjà prêt. C'est la même optimisation que `canvasAspect()` dans `sprites.js`.

### Sur un canvas à soi, pour l'insérer dans la page

```js
document.body.appendChild(hero.nouveauCanvas(4));
```

`canvas()` renvoie un canvas partagé en interne (ne jamais l'insérer deux fois dans la page) ; `nouveauCanvas()` en fait une copie indépendante, prête à être ajoutée au DOM.

### Sur un contexte 2D existant (le cas d'un jeu)

```js
function boucle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hero.dessiner(ctx, 100, 200, { echelle: 3 });
  requestAnimationFrame(boucle);
}
```

Options de `dessiner(ctx, x, y, options)` :

```js
{
  echelle: 3,
  cadre: 0,
  ancre: 'haut-gauche',    // 'haut-gauche' | 'centre' | 'bas-centre'
  miroir: false,
  alpha: 1                  // se multiplie avec le globalAlpha déjà en place sur le contexte
}
```

`ancre: 'bas-centre'` est le réglage naturel pour poser un personnage debout sur une ligne de sol : `x` est son centre horizontal, `y` est ses pieds.

### Toute la feuille de cadres

```js
hero.planche(2);   // tous les cadres d'animation côte à côte, un seul canvas
```

### Exporter en PNG

```js
const blob = await hero.png(8);
saveAs(blob, 'chevalier.png');   // voir vendor/filesaver
```

---

## 6. Animation

```js
const anim = flamme.animation({ ips: 6, boucle: true });

function boucle(temps) {
  anim.dessiner(ctx, 100, 100, temps, { echelle: 3 });
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);
```

`anim.dessiner` prend le temps courant en millisecondes (celui que `requestAnimationFrame` fournit) — pas besoin de gérer soi-même un minuteur ou un compteur de frames.

```js
anim.duree;             // durée d'un tour complet, en ms
anim.cadre(750);        // numéro du cadre à afficher à cet instant
anim.terminee(2000);    // pour une animation sans boucle : est-elle finie ?
```

Une séquence personnalisée permet de répéter ou réordonner des cadres sans dupliquer la grille :

```js
hero.animation({ ips: 10, boucle: false, sequence: [0, 1, 2, 1, 0] });
```

---

## 7. Importer depuis une image

Pour partir d'un dessin fait dans un vrai éditeur (ou récupéré ailleurs) et le ramener au format grille + palette :

```js
const img = document.querySelector('img');
const sprite = Lutin.depuisImage(img, { nom: 'depuis-png' });
```

Une couleur par lettre, attribuées automatiquement dans l'ordre de lecture. Pour forcer une palette précise (chaque pixel de l'image est alors ramené à sa couleur la plus proche) :

```js
Lutin.depuisImage(img, { palette: Lutin.palettes.gameboy });
```

Découper une planche d'animation en cadres :

```js
Lutin.depuisImage(img, { largeurCadre: 16 });   // une planche de 64px de large → 4 cadres de 16px
```

### La contrainte `file://`

Lire les pixels d'une image chargée depuis un fichier voisin est bloqué par le navigateur en `file://` (le fameux canvas « contaminé », déjà rencontré avec html2canvas). `Lutin.depuisImage()` lève alors une erreur qui pointe vers la bonne solution :

```js
// Erreur : Lutin : le navigateur bloque la lecture de cette image (fichier local en file://) — passe par Lutin.depuisFichier()
```

**`Lutin.depuisFichier()` contourne le problème** en passant par une `data:` URL plutôt que par un fichier :

```html
<input type="file" id="import" accept="image/*">
```

```js
document.getElementById('import').addEventListener('change', async (e) => {
  const sprite = await Lutin.depuisFichier(e.target.files[0]);
  Lutin.enregistrer(sprite.nom, sprite);
});
```

---

## 8. Le registre

Pour retrouver un sprite depuis n'importe quel fichier du projet sans jongler avec des imports :

```js
// dans un fichier de données
Lutin.enregistrer('chevalier', hero);

// ailleurs
const s = Lutin.obtenir('chevalier');

Lutin.existe('chevalier');   // true
Lutin.liste();                 // ['chevalier', ...]
```

Demander un sprite absent donne une erreur qui liste ceux qui existent, plutôt qu'un silencieux `undefined` :

```js
Lutin.obtenir('inconnu');
// Erreur : Lutin : aucun sprite nommé « inconnu » (connus : chevalier, gobelin, squelette)
```

---

## 9. Exporter en code ou en JSON

### Vers un fichier `.js` prêt à coller

Après avoir construit un sprite par du code (une import, une génération), fige-le en un fichier lisible et versionnable :

```js
console.log(hero.versCode());
```

```js
Lutin.enregistrer('chevalier', Lutin.sprite({
  nom: 'chevalier',
  palette: {
    S: '#ccd4dc'
  },
  grille: [
    '.SS.',
    'SSSS',
    '.SS.'
  ]
}));
```

C'est exactement le style déjà utilisé dans les fichiers `grimoire/js/data/sprites/*.js` du projet.

### Vers du JSON, compatible avec l'éditeur DAB

```js
JSON.stringify(hero);   // { name, w, h, palette, frames }

Lutin.depuisJSON(jsonString);   // ou directement un objet déjà parsé
```

Ce format est celui de [DAB](https://github.com/eetu/dab), l'éditeur graphique repéré pendant la recherche préalable (section « À quoi ça sert ») : un sprite dessiné dans DAB s'importe directement ici, et inversement.

---

## 10. Palettes toutes prêtes

```js
Lutin.palettes.pico8;       // les 16 couleurs de la fantasy console PICO-8
Lutin.palettes.gameboy;     // les 4 verts du Game Boy original
Lutin.palettes.sweetie16;   // une palette 16 couleurs très utilisée en pixel art moderne
```

```js
const p = Lutin.palette.depuisListe(Lutin.palettes.sweetie16);
```

---

## 11. Recettes

### Variantes de couleur d'un même ennemi (normal / élite / boss)

```js
const gobelinNormal = Lutin.sprite({ nom: 'gobelin', grille: [...], palette: { P: '#5c8f4a' } });

const gobelinElite = gobelinNormal
  .renommer('gobelin-elite')
  .avecPalette(p => p.saturer(0.2).eclaircir(0.1));

const gobelinBoss = gobelinNormal
  .renommer('gobelin-boss')
  .avecPalette({ P: '#c04040' })   // rouge plutôt que vert
  .contour('K', { couleur: '#200' });
```

### Ombrage cohérent à partir d'une seule couleur

```js
const [clair, base, sombre] = Lutin.couleur.rampe('#7fada0', 3);

const manteau = Lutin.sprite({
  nom: 'manteau',
  grille: ['ccc', 'cBc', 'ccc'],
  palette: { c: base, B: clair }
}).contour('K', { couleur: sombre });
```

### Migrer un sprite existant de `sprites.js` (Grimoire) vers Lutin

L'ancien format sépare tête et corps (voir la conversation qui a mené à leur fusion) ; Lutin travaille directement sur une grille complète :

```js
// avant, dans aspects.js : FORMES.chevalier = [ ...lignes... ]
// avant, dans heros.js   : pal: { S: '#...', s: '#...', ... }

const chevalier = Lutin.sprite({
  nom: 'chevalier',
  grille: FORMES.chevalier,        // réutilisable tel quel
  palette: HEROS.aspect.pal
});

Lutin.enregistrer('chevalier', chevalier);
chevalier.dessiner(ctx, x, y, { echelle: 3, ancre: 'bas-centre' });
```

### Sprite touché : flash blanc bref

```js
function flashBlanc(sprite, ctx, x, y, options) {
  sprite.avecPalette(p => p.uni('#ffffff')).dessiner(ctx, x, y, options);
}

// dans la boucle de jeu, pendant 80 ms après un coup reçu
if (Date.now() - dernierCoup < 80) {
  flashBlanc(ennemi, ctx, x, y, { echelle: 4 });
} else {
  ennemi.dessiner(ctx, x, y, { echelle: 4 });
}
```

### Générer un contour puis figer le résultat en fichier

```js
const avecContour = hero.contour('K', { couleur: '#141018' });
console.log(avecContour.versCode('chevalier'));
// copier la sortie dans grimoire/js/data/sprites/chevalier.js
```

---

## 12. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Damier de couleurs / motif cassé | Clé de palette à plusieurs caractères | Lutin le refuse à la construction — le message d'erreur donne la clé fautive |
| Couleur magenta inattendue | Une lettre de la grille n'a pas de couleur dans la palette | `sprite.valider()` pour la repérer, puis compléter la palette |
| Le contour déborde du canevas | `agrandir: false` sur un sprite qui touche déjà le bord | Laisser `agrandir` à sa valeur par défaut (`true`) |
| `depuisImage` échoue en double-clic sur le HTML | Canvas contaminé par un fichier local | `Lutin.depuisFichier()` (section 7) |
| Deux sprites superposés donnent une couleur inattendue | Même lettre, couleurs différentes dans les deux palettes | Renommer une des deux lettres avant de superposer |
| Rien ne se dessine | `dessiner()`/`canvas()` appelés hors navigateur (Node, tests) | Normal — Lutin lève une erreur claire plutôt qu'un plantage silencieux |
| Le sprite ne change pas après une transformation | Toutes les méthodes sont immuables | Récupérer la valeur de retour : `s = s.retourner('h')` |
| Rampe de couleurs plate, sans relief | Fonction d'éclaircissement/assombrissement naïve | Utiliser `Lutin.couleur.rampe()`, qui glisse la teinte (section 3) |
