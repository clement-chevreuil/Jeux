# Documentation complète Hammer.js (hors-ligne)

Version couverte : 2.0.7 — `vendor/hammer/hammer.min.js`

```html
<script src="vendor/hammer/hammer.min.js"></script>
```

Expose le global `Hammer`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Hammer.js traduit les événements tactiles bruts en gestes lisibles** : tap, balayage, pincement, appui long.

Le problème qu'il résout : le navigateur ne t'envoie que `touchstart`, `touchmove` et `touchend`, avec une liste de doigts et leurs coordonnées. Reconnaître qu'un utilisateur a « balayé vers la gauche » ou « pincé pour zoomer » à partir de ça demande de mémoriser les positions, calculer des distances, des vitesses, des angles, et gérer les cas limites. Hammer fait ce calcul et te donne directement `swipeleft`, `pinch`, `press`, avec la distance, la vitesse et la direction déjà calculées.

Indispensable dès qu'un projet doit être utilisable au doigt sur téléphone — ce qui, pour un logiciel qui s'ouvre par double-clic et tourne aussi sur mobile, est presque toujours le cas.

### Quand l'utiliser

- Balayer pour changer d'écran ou de page
- Glisser un élément (carte à jouer, curseur, élément à déplacer)
- Pincer pour zoomer sur une image ou une carte
- Appui long pour afficher un détail ou un menu contextuel

### Quand s'en passer

- Un simple clic ou tap → `addEventListener('click')` fonctionne déjà au doigt
- Un défilement classique → le navigateur le fait nativement, mieux que toi

Poids : 21 Ko minifié.

---

## 1. Démarrage

```js
const zone = document.getElementById('ma-zone');
const mc = new Hammer(zone);

mc.on('tap', (ev) => console.log('tapé'));
mc.on('swipeleft', (ev) => console.log('balayage gauche'));
```

`new Hammer(element)` active par défaut : **tap**, **doubletap**, **press**, **pan** (horizontal), **swipe** (horizontal). Pinch et rotate sont **désactivés** par défaut (voir section 5).

---

## 2. La règle CSS à ne jamais oublier

```css
.ma-zone { touch-action: none; }
```

Sans ça, le navigateur intercepte le geste pour faire défiler la page avant que Hammer ne le voie — tes `pan` et `swipe` verticaux ne se déclencheront jamais sur mobile.

Nuances utiles :

```css
touch-action: none;        /* Hammer reçoit tout (gestes libres, canvas de jeu) */
touch-action: pan-y;       /* le scroll vertical reste au navigateur, Hammer gère l'horizontal */
touch-action: pan-x;       /* l'inverse */
touch-action: manipulation;/* garde le scroll, supprime le délai de 300ms sur le tap */
```

En pratique : `pan-y` sur une liste qu'on veut pouvoir scroller **et** balayer latéralement ; `none` sur une zone de jeu plein écran.

---

## 3. Les gestes et leurs événements

| Geste | Événements |
| --- | --- |
| **tap** | `tap` |
| **doubletap** | `doubletap` |
| **press** | `press` (appui long), `pressup` (relâchement) |
| **pan** | `pan`, `panstart`, `panmove`, `panend`, `pancancel`, `panleft`, `panright`, `panup`, `pandown` |
| **swipe** | `swipe`, `swipeleft`, `swiperight`, `swipeup`, `swipedown` |
| **pinch** | `pinch`, `pinchstart`, `pinchmove`, `pinchend`, `pinchin`, `pinchout` |
| **rotate** | `rotate`, `rotatestart`, `rotatemove`, `rotateend` |

Plusieurs gestes d'un coup :

```js
mc.on('swipeleft swiperight', (ev) => {
  console.log(ev.type);   // 'swipeleft' ou 'swiperight'
});
```

---

## 4. L'objet événement

```js
mc.on('panmove', (ev) => {
  ev.deltaX;        // déplacement horizontal depuis le début du geste (px)
  ev.deltaY;
  ev.distance;      // distance totale parcourue
  ev.angle;         // angle en degrés
  ev.direction;     // Hammer.DIRECTION_LEFT / RIGHT / UP / DOWN
  ev.velocity;      // vitesse (la plus grande des deux axes)
  ev.velocityX;
  ev.velocityY;
  ev.scale;         // pour pinch : 1 = taille d'origine, 2 = doublé
  ev.rotation;      // pour rotate : angle en degrés
  ev.center;        // { x, y } centre du geste
  ev.pointers;      // nombre de doigts
  ev.isFinal;       // true sur le dernier événement du geste
  ev.target;        // élément touché
  ev.srcEvent;      // l'événement natif d'origine
});
```

Comparer une direction :

```js
if (ev.direction === Hammer.DIRECTION_LEFT) { ... }
```

Constantes : `DIRECTION_NONE`, `DIRECTION_LEFT`, `DIRECTION_RIGHT`, `DIRECTION_UP`, `DIRECTION_DOWN`, `DIRECTION_HORIZONTAL`, `DIRECTION_VERTICAL`, `DIRECTION_ALL`.

---

## 5. Activer pinch et rotate

Ils sont désactivés par défaut car ils entrent en conflit avec pan. Il faut les activer explicitement :

```js
const mc = new Hammer(zone);
mc.get('pinch').set({ enable: true });
mc.get('rotate').set({ enable: true });

mc.on('pinch', (ev) => {
  image.style.transform = `scale(${ev.scale})`;
});
```

Pour garder l'échelle entre deux gestes (sinon elle repart de 1 à chaque fois) :

```js
let echelle = 1;
let echelleCourante = 1;

mc.on('pinchstart', () => { echelleCourante = echelle; });
mc.on('pinch', (ev) => {
  echelle = Math.min(Math.max(echelleCourante * ev.scale, 0.5), 4);  // bornes 0.5x–4x
  image.style.transform = `scale(${echelle})`;
});
```

---

## 6. Régler les gestes

```js
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });   // pan dans tous les sens
mc.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
mc.get('press').set({ time: 800 });                        // appui long à 800ms (défaut 251)
mc.get('tap').set({ taps: 2 });                            // exiger 2 taps
```

Options principales par reconnaisseur :

**pan** — `direction`, `threshold` (distance minimale en px, défaut 10), `pointers` (nb de doigts, 0 = tous)
**swipe** — `direction`, `threshold` (défaut 10), `velocity` (vitesse minimale, défaut 0.3)
**press** — `time` (durée, défaut 251), `threshold` (tolérance de mouvement, défaut 9)
**tap** — `taps`, `interval` (entre deux taps, défaut 300), `time` (durée max, défaut 250), `threshold` (défaut 9)
**pinch** / **rotate** — `enable`, `threshold`, `pointers`

---

## 7. Construire son propre jeu de gestes

Pour éviter les conflits, on part d'un manager vide et on ajoute ce qu'on veut :

```js
const mc = new Hammer.Manager(zone);

mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 5 }));
mc.add(new Hammer.Tap({ event: 'simpletap' }));
mc.add(new Hammer.Press({ time: 600 }));

mc.on('simpletap', () => { ... });
```

Gérer les priorités entre gestes :

```js
const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
const simpleTap = new Hammer.Tap({ event: 'simpletap' });

mc.add([doubleTap, simpleTap]);
simpleTap.requireFailure(doubleTap);   // ne déclenche le simple que si le double a échoué
```

`recognizeWith()` permet au contraire à deux gestes de fonctionner en même temps (typiquement pinch + rotate) :

```js
pinch.recognizeWith(rotate);
```

---

## 8. Détruire / désactiver

```js
mc.set({ enable: false });    // désactive temporairement
mc.set({ enable: true });

mc.off('tap');                 // retire un handler
mc.destroy();                  // nettoie tout (à faire si tu retires l'élément du DOM)
```

Oublier `destroy()` sur des éléments recréés souvent (cartes d'un jeu, lignes d'une liste) crée une fuite mémoire et des handlers en double.

---

## 9. Recettes

### Balayer entre des écrans

```js
const mc = new Hammer(document.body);
mc.on('swipeleft',  () => ecranSuivant());
mc.on('swiperight', () => ecranPrecedent());
```

### Glisser une carte pour la jouer

```js
const mc = new Hammer(carte);
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

mc.on('panmove', (ev) => {
  carte.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px) rotate(${ev.deltaX / 20}deg)`;
});

mc.on('panend', (ev) => {
  if (ev.deltaY < -120) {
    jouerLaCarte();                       // remontée franche = on joue
  } else {
    carte.style.transform = '';           // sinon la carte revient
  }
});
```

### Appui long pour voir le détail

```js
mc.on('press', () => afficherDetail(carte));
mc.on('pressup', () => cacherDetail());
```

### Zoom + déplacement sur une carte de donjon

```css
#carte-donjon { touch-action: none; }
```

```js
const mc = new Hammer(document.getElementById('carte-donjon'));
mc.get('pinch').set({ enable: true });
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

let x = 0, y = 0, z = 1, xd = 0, yd = 0, zd = 1;

mc.on('panstart pinchstart', () => { xd = x; yd = y; zd = z; });
mc.on('panmove', (ev) => { x = xd + ev.deltaX; y = yd + ev.deltaY; appliquer(); });
mc.on('pinchmove', (ev) => { z = Math.min(Math.max(zd * ev.scale, 0.5), 3); appliquer(); });

function appliquer() {
  contenu.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
}
```

---

## 10. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Aucun geste vertical ne se déclenche | Le navigateur prend le geste pour du scroll | `touch-action: none` (ou `pan-y`) en CSS |
| `pinch` ne fait rien | Désactivé par défaut | `mc.get('pinch').set({ enable: true })` |
| `ev.scale` repart de 1 à chaque geste | C'est le comportement normal | Mémoriser l'échelle sur `pinchstart` (section 5) |
| Tap déclenché en même temps que doubletap | Pas de priorité définie | `simpleTap.requireFailure(doubleTap)` |
| Handlers en double après re-render | Manager jamais détruit | `mc.destroy()` avant de retirer l'élément |
| Rien ne marche à la souris | Hammer gère souris ET tactile normalement | Vérifier que l'élément a bien une taille (pas `display:none`) |
