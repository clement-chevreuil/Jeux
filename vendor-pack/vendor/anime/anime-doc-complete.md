# Documentation complète anime.js (hors-ligne)

Version couverte : 3.2.2 — `vendor/anime/anime.min.js`

```html
<script src="vendor/anime/anime.min.js"></script>
```

Expose le global `anime`. Aucune dépendance, fonctionne en `file://` sans aucune précaution.

> Note de version : la v4 d'anime.js existe mais s'utilise en modules ES (`import`). La **v3.2.2** est la dernière version qui expose un global classique — c'est celle qui convient à un projet sans build.

---

## À quoi ça sert

**anime.js anime n'importe quelle valeur numérique dans le temps** : la position d'un élément, son opacité, sa couleur, un attribut SVG, ou même une simple variable JavaScript.

Le problème qu'il résout : les animations CSS (`transition`, `@keyframes`) suffisent pour des effets simples, mais deviennent vite ingérables dès qu'il faut enchaîner des étapes, décaler une série d'éléments, piloter l'animation depuis le code (pause, reprise, inversion), ou réagir à la fin. anime.js fait tout ça en JavaScript, avec une syntaxe courte, et reste léger.

C'est la librairie qui transforme un prototype fonctionnel en quelque chose qui donne envie d'être utilisé : les cartes qui se distribuent, le nombre de dégâts qui s'envole, l'écran qui tremble, la barre de vie qui descend en douceur.

### Quand l'utiliser

- Enchaîner plusieurs animations dans un ordre précis (timeline)
- Décaler une série d'éléments en cascade (`anime.stagger`)
- Animer une valeur qui n'est pas du CSS (compteur, objet de jeu, canvas)
- Besoin de contrôler l'animation : pause, reprise, inversion, saut à un instant

### Quand s'en passer

- Un simple survol qui change une couleur ou une taille → `transition` en CSS fait mieux et coûte zéro octet
- Une animation en boucle purement décorative → `@keyframes` en CSS

Poids : 17 Ko minifié.

---

## 1. Principe

Une animation = un appel à `anime({ ... })` avec trois choses : **quoi** animer (`targets`), **quelles propriétés** changer, et **comment** (durée, easing).

```js
anime({
  targets: '.carte',      // quoi
  translateY: -20,        // quelle propriété et vers quelle valeur
  duration: 400,          // comment
  easing: 'easeOutQuad'
});
```

anime.js anime des éléments DOM, des objets JavaScript, du SVG et des attributs — tout ce qui a une valeur numérique.

---

## 2. Cibles (`targets`)

```js
targets: '.carte'                       // sélecteur CSS (tous les éléments qui matchent)
targets: document.querySelector('#x')   // un élément DOM
targets: [el1, el2]                     // un tableau d'éléments
targets: document.querySelectorAll('li')// une NodeList
targets: monObjet                        // un objet JS quelconque
```

Animer un objet JS est pratique pour faire monter un compteur :

```js
const compteur = { valeur: 0 };
anime({
  targets: compteur,
  valeur: 100,
  round: 1,                                  // arrondir à l'entier
  duration: 1500,
  easing: 'linear',
  update: () => { el.textContent = compteur.valeur; }
});
```

---

## 3. Propriétés animables

### Transformations CSS (les plus utiles, accélérées par le GPU)

```js
translateX, translateY, translateZ
rotate, rotateX, rotateY, rotateZ
scale, scaleX, scaleY
skew, skewX, skewY
perspective
```

### Propriétés CSS classiques

```js
opacity, backgroundColor, color, borderRadius,
width, height, top, left, margin, padding, fontSize, boxShadow...
```

### Attributs HTML/SVG

```js
anime({ targets: 'circle', r: 40, cx: 100 });     // attributs SVG
anime({ targets: 'input', value: 100, round: 1 }); // attribut value
```

### Unités

```js
translateX: 100       // px par défaut
translateX: '100%'    // pourcentage
rotate: '1turn'       // tours
rotate: '45deg'
width: '80vw'
```

---

## 4. Valeurs de départ et relatives

```js
translateX: 250                    // de la valeur actuelle vers 250
translateX: [0, 250]               // [départ, arrivée] — force le point de départ
translateX: '+=100'                // relatif : ajoute 100 à la valeur actuelle
translateX: '-=50'
rotate: '*=2'                      // multiplie
```

Une valeur peut être une **fonction**, appelée pour chaque élément — c'est ce qui permet de varier l'animation élément par élément :

```js
anime({
  targets: '.carte',
  translateY: (el, i) => -20 - i * 5,   // chaque carte monte un peu plus
  rotate: () => anime.random(-15, 15),  // rotation aléatoire
  duration: 600
});
```

Les arguments sont `(element, index, total)`.

---

## 5. Réglages temporels

```js
anime({
  targets: '.x',
  translateX: 100,
  duration: 800,          // durée en ms (défaut 1000)
  delay: 200,             // attendre avant de démarrer (défaut 0)
  endDelay: 100,          // attendre après avoir fini
  easing: 'easeOutElastic(1, .6)',
  direction: 'normal',    // 'normal' | 'reverse' | 'alternate'
  loop: true,             // true = infini, ou un nombre de répétitions
  autoplay: true          // false pour démarrer manuellement (défaut true)
});
```

`direction: 'alternate'` avec `loop: true` fait un aller-retour permanent — idéal pour un effet de respiration/pulsation.

---

## 6. Décalage en cascade (`anime.stagger`)

C'est l'outil qui donne instantanément un aspect professionnel : les éléments s'animent les uns après les autres.

```js
anime({
  targets: '.carte',
  translateY: [40, 0],
  opacity: [0, 1],
  delay: anime.stagger(80)      // 0ms, 80ms, 160ms, 240ms...
});
```

Variantes :

```js
anime.stagger(80, { start: 500 })            // commence à 500ms
anime.stagger(80, { from: 'center' })        // part du centre vers les bords
anime.stagger(80, { from: 'last' })          // part du dernier
anime.stagger(80, { direction: 'reverse' })
anime.stagger([-40, 40])                      // répartit les valeurs entre -40 et 40
```

`stagger` marche aussi sur les valeurs, pas seulement sur `delay` :

```js
anime({
  targets: '.carte',
  rotate: anime.stagger([-10, 10]),   // éventail : de -10° à +10°
  delay: anime.stagger(50)
});
```

---

## 7. Easings (courbes d'accélération)

```js
easing: 'linear'
easing: 'easeInQuad'     | 'easeOutQuad'     | 'easeInOutQuad'
easing: 'easeInCubic'    | 'easeOutCubic'    | 'easeInOutCubic'
easing: 'easeInQuart'    | 'easeOutQuart'    | 'easeInOutQuart'
easing: 'easeInExpo'     | 'easeOutExpo'     | 'easeInOutExpo'
easing: 'easeInBack'     | 'easeOutBack'     | 'easeInOutBack'
easing: 'easeOutElastic(amplitude, période)'   // ex: 'easeOutElastic(1, .6)'
easing: 'easeOutBounce'
easing: 'spring(masse, raideur, amortissement, vitesse)'
easing: 'steps(5)'                              // par paliers — parfait en pixel art
easing: 'cubicBezier(.5, 0, .5, 1)'
```

En pratique :

- **`easeOutQuad`** — le passe-partout, pour 90 % des cas
- **`easeOutBack`** — léger dépassement, donne du punch à une apparition
- **`easeOutElastic`** — rebond marqué, pour un effet "pop"
- **`steps(n)`** — saccadé, cohérent avec un rendu pixel art

---

## 8. Callbacks

```js
anime({
  targets: '.x',
  translateX: 100,
  begin:  (anim) => {},   // au démarrage
  update: (anim) => {},   // à chaque frame
  change: (anim) => {},   // à chaque frame, uniquement pendant l'animation
  complete:(anim) => {},  // à la fin
  loopBegin:    () => {},
  loopComplete: () => {}
});
```

`anim.progress` donne l'avancement de 0 à 100.

Une animation renvoie aussi une **promesse** via `.finished` :

```js
await anime({ targets: '.x', opacity: 0, duration: 300 }).finished;
el.remove();
```

---

## 9. Contrôler une animation

```js
const a = anime({ targets: '.x', translateX: 100, autoplay: false });

a.play();
a.pause();
a.restart();
a.reverse();
a.seek(500);                    // aller à 500 ms
a.seek(a.duration * 0.5);       // aller à la moitié
```

---

## 10. Keyframes (plusieurs étapes)

Un tableau de valeurs = autant d'étapes successives :

```js
anime({
  targets: '.x',
  translateX: [
    { value: 100, duration: 400 },
    { value: 0,   duration: 800, delay: 200 }
  ],
  easing: 'easeOutQuad'
});
```

Keyframes globales (s'appliquent à toutes les propriétés) :

```js
anime({
  targets: '.x',
  keyframes: [
    { translateY: -40 },
    { translateX: 30 },
    { translateY: 0, translateX: 0 }
  ],
  duration: 1200,
  easing: 'easeOutQuad'
});
```

---

## 11. Timeline (enchaîner des animations)

```js
const tl = anime.timeline({
  easing: 'easeOutQuad',
  duration: 400            // valeurs par défaut pour toutes les étapes
});

tl.add({ targets: '.titre',  opacity: [0, 1], translateY: [-20, 0] })
  .add({ targets: '.carte',  opacity: [0, 1], delay: anime.stagger(60) })
  .add({ targets: '.bouton', scale: [0, 1] }, '-=200');   // démarre 200ms avant la fin de la précédente
```

Le deuxième argument de `.add()` est le **décalage** :

```js
'-=200'   // 200 ms avant la fin de l'étape précédente (chevauchement)
'+=300'   // 300 ms après
1000      // à 1000 ms depuis le début de la timeline (position absolue)
```

---

## 12. Utilitaires

```js
anime.random(-20, 20);                 // entier aléatoire entre deux bornes
anime.set('.x', { opacity: 0 });        // applique des valeurs SANS animer
anime.get(el, 'translateX');            // lit une valeur animable
anime.remove('.x');                     // stoppe et retire toutes les animations de ces cibles
anime.running;                          // tableau des animations en cours
```

`anime.remove()` est important : si tu relances une animation sur un élément déjà animé, les deux se battent. Nettoie d'abord.

---

## 13. Recettes pour un jeu

### Carte qui monte au survol

```js
carte.addEventListener('mouseenter', () => {
  anime.remove(carte);
  anime({ targets: carte, translateY: -14, scale: 1.05, duration: 180, easing: 'easeOutQuad' });
});
carte.addEventListener('mouseleave', () => {
  anime.remove(carte);
  anime({ targets: carte, translateY: 0, scale: 1, duration: 180, easing: 'easeOutQuad' });
});
```

### Distribution de la main

```js
anime({
  targets: '.main-combat .carte',
  translateY: [80, 0],
  opacity: [0, 1],
  rotate: anime.stagger([-6, 6]),
  delay: anime.stagger(70),
  duration: 450,
  easing: 'easeOutBack'
});
```

### Secousse d'écran (dégâts reçus)

```js
function secousse(el, force = 8) {
  anime({
    targets: el,
    translateX: [
      { value: -force, duration: 50 }, { value: force, duration: 50 },
      { value: -force / 2, duration: 50 }, { value: 0, duration: 50 }
    ],
    easing: 'linear'
  });
}
```

### Nombre de dégâts qui monte et disparaît

```js
function afficherDegats(zone, montant) {
  const el = document.createElement('div');
  el.className = 'degats-flottants';
  el.textContent = '-' + montant;
  zone.appendChild(el);

  anime({
    targets: el,
    translateY: -50,
    opacity: [1, 0],
    scale: [1.4, 1],
    duration: 900,
    easing: 'easeOutQuad',
    complete: () => el.remove()
  });
}
```

### Barre de vie qui descend en douceur

```js
anime({
  targets: barre,
  width: pourcentage + '%',
  duration: 500,
  easing: 'easeOutQuart'
});
```

### Flash rouge sur un ennemi touché

```js
anime({
  targets: sprite,
  opacity: [1, 0.3, 1],
  duration: 200,
  easing: 'steps(3)'      // saccadé : cohérent avec du pixel art
});
```

---

## 14. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| L'animation ne part pas | `targets` ne matche rien | Vérifier le sélecteur, l'élément doit être dans le DOM |
| Ça saccade | Animation de `width`/`top`/`left` | Préférer `translateX/Y` et `scale` (GPU) |
| Deux animations se battent | Relance sans nettoyage | `anime.remove(cible)` avant de relancer |
| La valeur de départ est incohérente | anime lit la valeur calculée actuelle | Forcer avec un tableau : `opacity: [0, 1]` |
| Rien ne bouge sur un objet JS | Il faut redessiner soi-même | Utiliser le callback `update` |
| `translateX` ignoré sur un `<span>` | Les éléments `inline` ignorent les transforms | Mettre `display: inline-block` en CSS |
