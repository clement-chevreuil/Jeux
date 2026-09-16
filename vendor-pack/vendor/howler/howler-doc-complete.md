# Documentation complète Howler.js (hors-ligne)

Version couverte : 2.2.4 — `vendor/howler/howler.min.js`

```html
<script src="vendor/howler/howler.min.js"></script>
```

Expose deux globaux : `Howl` (un son) et `Howler` (le contrôleur global).

---

## À quoi ça sert

**Howler.js joue du son dans une page web.** Musique de fond, bruitages, ambiances — tout ce qui fait qu'un logiciel a une présence sonore.

Le problème qu'il résout : la balise `<audio>` native existe, mais elle est pénible dès qu'on dépasse « jouer un fichier ». Elle ne sait pas jouer le même son deux fois en même temps, ne gère pas les fondus, ne permet pas de découper un fichier en plusieurs effets, et son comportement varie d'un navigateur à l'autre. Howler enveloppe tout ça derrière une API simple et identique partout.

### Quand l'utiliser

- Un jeu qui a des bruitages et une musique
- Plusieurs sons qui se superposent (clic + dégâts + musique en même temps)
- Besoin de fondus, de volume global, d'un bouton « couper le son »
- Beaucoup de petits effets à charger d'un coup (sprites audio, section 6)

### Quand s'en passer

- Un seul son joué de temps en temps → `new Audio('bip.mp3').play()` suffit
- Des bips et clics synthétiques → la Web Audio API native les génère sans aucun fichier (section 9, solution C)

Poids : 36 Ko minifié.

> ⚠️ **Point crucial en `file://`** — par défaut Howler charge les sons via XHR pour utiliser la Web Audio API, et la plupart des navigateurs bloquent XHR sur `file://`. Deux solutions, détaillées en section 9 : forcer le mode `html5: true`, ou embarquer les sons en base64. **Lis cette section avant toute autre chose.**

---

## 1. Jouer un son

```js
const son = new Howl({ src: ['sons/clic.mp3'] });
son.play();
```

`src` est un **tableau** : mets plusieurs formats, Howler prend le premier que le navigateur sait lire.

```js
const son = new Howl({ src: ['sons/clic.webm', 'sons/clic.mp3'] });
```

En pratique, `.mp3` seul suffit aujourd'hui (supporté partout). Le `.webm`/`.ogg` sert surtout à gagner du poids.

---

## 2. Toutes les options du constructeur

```js
const son = new Howl({
  src: ['sons/musique.mp3'],
  volume: 0.5,        // 0.0 à 1.0 (défaut 1.0)
  loop: true,         // rejouer en boucle (défaut false)
  autoplay: false,    // jouer dès que chargé (défaut false)
  rate: 1.0,          // vitesse/pitch, 0.5 = moitié, 2.0 = double (défaut 1.0)
  mute: false,        // démarrer en sourdine (défaut false)
  html5: false,       // voir section 9 (défaut false)
  preload: true,      // charger tout de suite (défaut true)
  pool: 5,            // nb de lectures simultanées du même son (défaut 5)
  format: ['mp3'],    // force le format si l'URL n'a pas d'extension (ex: base64)
  onload: () => {},
  onplay: (id) => {},
  onend: (id) => {},
  onpause: (id) => {},
  onstop: (id) => {},
  onloaderror: (id, err) => {},
  onplayerror: (id, err) => {}
});
```

`pool` compte : si tu joues un bruit de clic 10 fois très vite avec `pool: 5`, les plus anciens sont coupés. Monte-le pour les sons très répétés.

---

## 3. Contrôler la lecture

```js
son.play();        // retourne un id de lecture (nombre)
son.pause();       // met en pause (reprend là où c'était)
son.stop();        // arrête et remet au début
son.playing();     // true / false
```

Chaque `play()` renvoie un **id** qui permet de piloter une lecture précise quand le même son tourne plusieurs fois :

```js
const id = son.play();
son.volume(0.2, id);   // ne change le volume que de CETTE lecture
son.stop(id);          // n'arrête que CETTE lecture
```

Sans id, la méthode s'applique à **toutes** les lectures de ce `Howl`.

---

## 4. Volume, vitesse, position

Toutes ces méthodes sont des **getter/setter** : sans argument elles lisent, avec argument elles écrivent.

```js
son.volume();        // lit le volume actuel
son.volume(0.3);     // écrit le volume

son.rate();          // lit la vitesse
son.rate(1.5);       // 1.5x plus rapide (et plus aigu)

son.seek();          // position actuelle en secondes
son.seek(10);        // saute à 10 secondes

son.duration();      // durée totale en secondes (0 tant que pas chargé)

son.loop(true);      // active/désactive la boucle
son.mute(true);      // coupe/rétablit le son
```

---

## 5. Fondus (fade)

```js
son.fade(volumeDépart, volumeArrivée, duréeEnMs);

son.fade(0, 1, 2000);        // fondu entrant sur 2 s
son.fade(1, 0, 1000);        // fondu sortant sur 1 s
```

Pour arrêter vraiment le son après un fondu sortant, écoute l'événement `fade` :

```js
son.once('fade', () => son.stop());
son.fade(son.volume(), 0, 800);
```

Démarrer une musique en fondu :

```js
const musique = new Howl({ src: ['sons/theme.mp3'], loop: true, volume: 0 });
musique.play();
musique.fade(0, 0.4, 3000);
```

---

## 6. Sprites audio (plusieurs sons dans un seul fichier)

C'est **la** technique pour les jeux : un seul fichier audio contient tous les effets, découpés par plages de millisecondes. Un seul chargement, aucune latence.

```js
const sfx = new Howl({
  src: ['sons/effets.mp3'],
  sprite: {
    clic:    [0, 200],          // [départ en ms, durée en ms]
    degats:  [300, 450],
    victoire:[900, 1800],
    boucle:  [3000, 4000, true] // le 3e élément true = ce sprite boucle
  }
});

sfx.play('clic');
sfx.play('degats');
```

---

## 7. Événements

```js
son.on('end', () => console.log('terminé'));
son.once('load', () => son.play());     // ne se déclenche qu'une fois
son.off('end');                          // retire tous les handlers 'end'
```

Événements disponibles : `load`, `loaderror`, `playerror`, `play`, `end`, `pause`, `stop`, `mute`, `volume`, `rate`, `seek`, `fade`, `unlock`.

Attention avec `loop: true` : l'événement `end` se déclenche **à chaque tour de boucle**, pas seulement à la fin.

---

## 8. Le contrôleur global `Howler`

```js
Howler.volume(0.5);     // volume maître de TOUS les sons (0 à 1)
Howler.mute(true);      // coupe tout
Howler.stop();          // arrête tout
Howler.unload();        // décharge tous les sons de la mémoire

Howler.codecs('mp3');   // true si le navigateur sait lire ce format
```

Un bouton "couper le son" global tient en une ligne :

```js
let coupe = false;
btn.onclick = () => { coupe = !coupe; Howler.mute(coupe); };
```

---

## 9. Faire marcher Howler en `file://` — la section importante

### Le problème

En mode Web Audio (le défaut), Howler fait un `XMLHttpRequest` pour charger le fichier son. En `file://`, Chrome et Edge bloquent cette requête (erreur CORS), et tu obtiens un `onloaderror`. Firefox est parfois plus permissif, mais ne compte pas dessus.

### Solution A — mode HTML5 (le plus simple)

```js
const son = new Howl({
  src: ['sons/clic.mp3'],
  html5: true          // utilise une balise <audio> au lieu de la Web Audio API
});
```

Une balise `<audio>` charge le fichier comme une image : pas de XHR, donc pas de blocage CORS.

Ce que tu perds avec `html5: true` :

- Les **sprites audio** deviennent imprécis (le décalage de lecture n'est pas garanti à la milliseconde)
- Légère latence au démarrage du son
- Moins adapté aux effets très courts joués en rafale

**Quand c'est parfait** : musique de fond, ambiances, sons longs.

### Solution B — sons en base64 (aucune limite)

Exactement la même astuce que ton `sql-wasm-base64.js` : le son devient du texte dans un `.js`, donc plus aucun fichier à charger.

Génère le fichier une fois (avec Node, depuis n'importe quel dossier) :

```js
// outil-base64.js — à lancer une seule fois : node outil-base64.js
const fs = require('fs');
const b64 = fs.readFileSync('clic.mp3').toString('base64');
fs.writeFileSync('sons-base64.js', `const SON_CLIC = "data:audio/mpeg;base64,${b64}";\n`);
```

Puis dans la page :

```html
<script src="sons/sons-base64.js"></script>
<script>
  const clic = new Howl({ src: [SON_CLIC], format: ['mp3'] });
  clic.play();
</script>
```

L'option `format` est **obligatoire** ici : l'URL en base64 n'a pas d'extension, Howler ne peut pas deviner le type.

**Compte le poids** : le base64 gonfle le fichier d'environ 33 %. Un son de 30 Ko devient 40 Ko de texte. Pour des effets courts c'est négligeable ; pour une musique de 3 Mo, préfère la solution A.

### Solution C — pas de fichier du tout

Pour des bips, clics et bruits simples, tu n'as besoin d'aucune librairie ni d'aucun fichier — la Web Audio API native génère le son :

```js
function bip(frequence = 440, duree = 0.1) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = frequence;
  osc.type = 'square';                              // square = son rétro 8-bit
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duree);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duree);
}

bip(880, 0.08);   // clic aigu
bip(220, 0.25);   // impact grave
```

Zéro dépendance, zéro fichier, zéro problème de CORS. Pour un jeu en pixel art, c'est souvent le choix le plus cohérent.

---

## 10. Le déblocage au premier clic

Les navigateurs interdisent de jouer du son avant que l'utilisateur ait interagi avec la page. Howler gère ça automatiquement (événement `unlock`), mais concrètement : **ta musique de fond ne démarrera pas au chargement**. Déclenche-la sur le premier clic.

```js
let demarree = false;
document.addEventListener('click', () => {
  if (demarree) return;
  demarree = true;
  musique.play();
}, { once: false });
```

---

## 11. Recette complète pour un jeu

```js
// audio.js
const Audio = {
  actif: true,
  sons: {
    clic:     new Howl({ src: ['sons/clic.mp3'],     html5: true, volume: 0.5 }),
    degats:   new Howl({ src: ['sons/degats.mp3'],   html5: true, volume: 0.7 }),
    victoire: new Howl({ src: ['sons/victoire.mp3'], html5: true, volume: 0.8 })
  },
  musique: new Howl({ src: ['sons/theme.mp3'], html5: true, loop: true, volume: 0 }),

  jouer(nom) {
    if (this.actif && this.sons[nom]) this.sons[nom].play();
  },

  demarrerMusique() {
    if (this.musique.playing()) return;
    this.musique.play();
    this.musique.fade(0, 0.3, 2000);
  },

  basculer() {
    this.actif = !this.actif;
    Howler.mute(!this.actif);
    return this.actif;
  }
};
```

Utilisation : `Audio.jouer('degats')`, `Audio.basculer()` sur un bouton 🔊.

---

## 12. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `onloaderror` en double-clic sur le HTML | XHR bloqué en `file://` | `html5: true` ou base64 (section 9) |
| Aucun son au chargement de la page | Le navigateur attend une interaction | Démarrer sur le premier clic (section 10) |
| Le son se coupe quand on le rejoue vite | `pool` trop bas | Monter `pool: 10` |
| `duration()` renvoie 0 | Le son n'est pas encore chargé | Attendre l'événement `load` |
| Sprite imprécis | Mode `html5: true` | Utiliser le base64 pour garder la Web Audio |
| Un son en boucle déclenche `end` sans arrêt | Comportement normal avec `loop: true` | Utiliser `once` ou ne pas écouter `end` |
