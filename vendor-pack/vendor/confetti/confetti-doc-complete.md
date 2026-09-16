# Documentation complète canvas-confetti (hors-ligne)

Version couverte : 1.9.3 — `vendor/confetti/confetti.browser.js`

```html
<script src="vendor/confetti/confetti.browser.js"></script>
```

Expose le global `confetti`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**canvas-confetti lance des confettis à l'écran.** C'est tout, et c'est volontaire.

Le problème qu'il résout : donner un retour visuel à un moment de réussite. Une run terminée, un objectif atteint, un score battu — l'utilisateur a besoin de sentir que quelque chose de bien vient d'arriver. Écrire une simulation de particules soi-même (physique, rotation, couleurs, nettoyage du canvas) prend une centaine de lignes ; ici c'est un appel de fonction.

Techniquement : la librairie crée un canvas plein écran en `position: fixed` par-dessus la page, anime les particules, puis se nettoie toute seule. Rien à préparer, aucun élément à ajouter dans ton HTML.

### Quand l'utiliser

- Écran de victoire, fin de partie réussie
- Récompense obtenue, palier franchi, succès débloqué
- Confirmation d'une action importante (formulaire envoyé, objectif validé)

### Quand s'en passer

- Si ça se déclenche souvent : l'effet perd tout son sens et devient agaçant
- Pour un effet de particules intégré au jeu lui-même (explosions, étincelles sur un sprite) → mieux vaut dessiner dans ton propre canvas de jeu

Poids : 25 Ko.

---

## 1. Démarrage

```js
confetti();     // c'est tout
```

Avec des réglages :

```js
confetti({
  particleCount: 120,
  spread: 70,
  origin: { x: 0.5, y: 0.6 }
});
```

L'appel retourne une **promesse** résolue quand toutes les particules ont disparu :

```js
await confetti({ particleCount: 100 });
console.log('animation terminée');
```

---

## 2. Toutes les options

```js
confetti({
  particleCount: 50,        // nombre de particules (défaut 50)
  angle: 90,                // direction du tir en degrés, 90 = vers le haut (défaut 90)
  spread: 45,               // dispersion en degrés autour de l'angle (défaut 45)
  startVelocity: 45,        // vitesse initiale (défaut 45)
  decay: 0.9,               // perte de vitesse par frame, 0–1 (défaut 0.9)
  gravity: 1,               // 1 = normal, 0 = flotte, négatif = monte (défaut 1)
  drift: 0,                 // dérive latérale, négatif = gauche (défaut 0)
  ticks: 200,               // durée de vie des particules en frames (défaut 200)
  origin: { x: 0.5, y: 0.5 },// point de départ, en fraction de l'écran (0–1)
  colors: ['#ff0000', '#00ff00'],       // palette (défaut : multicolore)
  shapes: ['square', 'circle', 'star'], // formes (défaut ['square','circle'])
  scalar: 1,                // taille des particules (défaut 1)
  zIndex: 100,              // z-index du canvas (défaut 100)
  disableForReducedMotion: false        // respecter "réduire les animations" de l'OS
});
```

Repères sur `origin` : `{ x: 0, y: 0 }` = coin haut-gauche, `{ x: 1, y: 1 }` = coin bas-droit. Pour un tir depuis le bas de l'écran : `{ y: 0.9 }`.

---

## 3. Formes

```js
shapes: ['square']                    // carrés — le plus lisible en pixel art
shapes: ['circle']
shapes: ['star']
shapes: ['square', 'circle', 'star']  // mélange
```

Créer une forme à partir de texte ou d'emoji :

```js
const coeur = confetti.shapeFromText({ text: '❤️', scalar: 2 });
confetti({ shapes: [coeur], scalar: 2, particleCount: 30 });
```

Créer une forme à partir d'un chemin SVG :

```js
const forme = confetti.shapeFromPath({ path: 'M0 0 L10 0 L5 10 Z' });
confetti({ shapes: [forme] });
```

---

## 4. Contrôle

```js
confetti.reset();    // efface immédiatement toutes les particules à l'écran
```

Utile quand on change d'écran pendant une animation en cours.

---

## 5. Utiliser son propre canvas

Par défaut confetti crée son canvas plein écran. Pour le confiner à une zone (une carte, une modale) :

```js
const canvas = document.getElementById('mon-canvas');
const tirer = confetti.create(canvas, {
  resize: true,        // ajuste le canvas à sa taille CSS automatiquement
  useWorker: true      // calculs dans un Web Worker (plus fluide)
});

tirer({ particleCount: 80, spread: 60 });
tirer.reset();
```

> ⚠️ **`useWorker: true` échoue en `file://`** — les Web Workers sont bloqués sur ce protocole dans Chrome/Edge. Mets `useWorker: false` si ton projet s'ouvre par double-clic. La librairie retombe alors sur le thread principal, ce qui reste largement assez fluide pour quelques centaines de particules.

```js
const tirer = confetti.create(canvas, { resize: true, useWorker: false });
```

---

## 6. Recettes

### Victoire classique

```js
confetti({
  particleCount: 150,
  spread: 80,
  origin: { y: 0.6 }
});
```

### Tir depuis les deux côtés

```js
function victoire() {
  const base = { particleCount: 60, spread: 55, startVelocity: 45 };
  confetti({ ...base, angle: 60,  origin: { x: 0, y: 0.7 } });   // depuis la gauche
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });   // depuis la droite
}
```

### Pluie continue pendant quelques secondes

```js
function pluie(duree = 3000) {
  const fin = Date.now() + duree;
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,  spread: 55, origin: { x: 0 }
    });
    confetti({
      particleCount: 3,
      angle: 120, spread: 55, origin: { x: 1 }
    });
    if (Date.now() < fin) requestAnimationFrame(frame);
  })();
}
```

### Explosion aux couleurs du jeu

```js
confetti({
  particleCount: 100,
  spread: 100,
  shapes: ['square'],       // carrés = cohérent avec du pixel art
  scalar: 1.4,              // plus gros, plus visible
  colors: ['#f0c040', '#4a86d0', '#ccd4dc', '#d0402f'],
  ticks: 150
});
```

### Petit effet au clic, à l'endroit du clic

```js
document.addEventListener('click', (e) => {
  confetti({
    particleCount: 20,
    spread: 40,
    scalar: 0.7,
    ticks: 60,
    origin: {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    }
  });
});
```

### Effet "pièces qui tombent" (récompense)

```js
confetti({
  particleCount: 40,
  spread: 50,
  startVelocity: 25,
  gravity: 1.4,
  colors: ['#f0c040', '#b0842a'],
  shapes: ['circle'],
  origin: { y: 0.3 }
});
```

---

## 7. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Erreur de Worker en double-clic sur le HTML | Workers bloqués en `file://` | `useWorker: false` |
| Les confettis passent sous l'interface | `zIndex` trop bas | Monter `zIndex: 9999` |
| Particules invisibles sur fond clair | Palette par défaut trop claire | Définir `colors` contrastées |
| L'animation dure trop longtemps | `ticks` élevé | Baisser `ticks` (60–120 pour un effet bref) |
| Ça rame avec beaucoup de particules | Trop de `particleCount` | Rester sous ~200, ou plusieurs petits tirs |
| Confettis encore là après changement d'écran | Animation non interrompue | `confetti.reset()` |
