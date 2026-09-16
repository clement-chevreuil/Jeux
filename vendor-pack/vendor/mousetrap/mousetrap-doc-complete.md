# Documentation complète Mousetrap (hors-ligne)

Version couverte : 1.6.5 — `vendor/mousetrap/mousetrap.min.js`

```html
<script src="vendor/mousetrap/mousetrap.min.js"></script>
```

Expose le global `Mousetrap`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Mousetrap gère les raccourcis clavier.** Touches simples, combinaisons (`Ctrl+S`), et séquences de touches jouées l'une après l'autre (à la Konami code).

Le problème qu'il résout : écouter `keydown` soi-même paraît simple, jusqu'à ce qu'il faille gérer les codes de touches qui diffèrent selon les navigateurs, la différence Ctrl/Cmd entre Windows et Mac, les combinaisons à trois touches, et surtout : ne pas déclencher un raccourci quand l'utilisateur est en train de taper dans un champ de saisie. Mousetrap règle tout ça en 2 Ko.

Un logiciel qui a des raccourcis clavier donne immédiatement une impression d'outil sérieux plutôt que de prototype.

### Quand l'utiliser

- Raccourcis d'une application (sauvegarder, annuler, rechercher)
- Commandes de jeu au clavier (jouer une carte, finir le tour, ouvrir le menu)
- Navigation au clavier dans une liste
- Codes secrets / modes cachés

### Quand s'en passer

- Une seule touche écoutée dans un contexte précis → un `addEventListener('keydown')` suffit
- Un jeu d'action temps réel où il faut savoir quelles touches sont **maintenues** simultanément → gérer soi-même un dictionnaire d'état sur `keydown`/`keyup` est plus adapté

Poids : 5 Ko minifié.

---

## 1. Démarrage

```js
Mousetrap.bind('espace', () => {});              // ❌ les noms sont en anglais
Mousetrap.bind('space', () => finirLeTour());     // ✅
Mousetrap.bind('1', () => jouerCarte(0));
Mousetrap.bind('mod+s', () => sauvegarder());
```

Retourner `false` dans le handler bloque le comportement par défaut du navigateur (équivaut à `preventDefault()` + `stopPropagation()`) :

```js
Mousetrap.bind('mod+s', (e) => {
  sauvegarder();
  return false;      // empêche la boîte "Enregistrer la page" du navigateur
});
```

---

## 2. Noms des touches

### Modificateurs

```text
shift, ctrl, alt, meta, mod
```

`mod` vaut **ctrl** sur Windows/Linux et **cmd** sur Mac — utilise-le systématiquement plutôt que `ctrl`, ton raccourci marchera partout.

### Touches spéciales

```text
backspace, tab, enter, return, capslock, esc, escape, space,
pageup, pagedown, end, home, left, up, right, down,
ins, del, plus
```

### Autres

```text
f1 ... f19
a-z, 0-9
```

Les caractères qui nécessitent shift se déclarent directement :

```js
Mousetrap.bind('?', () => afficherAide());     // pas besoin d'écrire 'shift+/'
```

---

## 3. Combinaisons

```js
Mousetrap.bind('mod+shift+k', () => {});
Mousetrap.bind('ctrl+alt+del', () => {});      // (interceptée par l'OS, exemple théorique)
```

Plusieurs raccourcis pour la même action — passe un tableau :

```js
Mousetrap.bind(['mod+s', 'mod+enter'], () => sauvegarder());
```

Dans ce cas, le second argument du handler donne la combinaison réellement utilisée :

```js
Mousetrap.bind(['left', 'a'], (e, combo) => {
  console.log(combo);   // 'left' ou 'a'
  deplacer(-1);
});
```

---

## 4. Séquences

Des touches pressées **l'une après l'autre** (délai max d'une seconde entre chaque) :

```js
Mousetrap.bind('g i', () => allerAInventaire());       // "g" puis "i"
Mousetrap.bind('up up down down left right left right b a', () => codeKonami());
```

C'est la fonctionnalité qui distingue Mousetrap des alternatives.

---

## 5. Type d'événement

Par défaut Mousetrap choisit `keypress` pour les caractères et `keydown` pour le reste. Tu peux forcer :

```js
Mousetrap.bind('a', () => {}, 'keyup');
Mousetrap.bind('space', () => {}, 'keydown');
```

Utile pour un jeu : `keydown` pour commencer à bouger, `keyup` pour arrêter.

```js
Mousetrap.bind('right', () => avancer(true),  'keydown');
Mousetrap.bind('right', () => avancer(false), 'keyup');
```

---

## 6. Retirer des raccourcis

```js
Mousetrap.unbind('mod+s');
Mousetrap.unbind(['left', 'right']);
Mousetrap.unbind('a', 'keyup');       // préciser le type si tu l'avais précisé au bind

Mousetrap.reset();                     // retire TOUT
```

`Mousetrap.reset()` est pratique quand on change d'écran : on remet à zéro, puis on rebind les raccourcis du nouvel écran.

```js
function activerRaccourcisCombat() {
  Mousetrap.reset();
  Mousetrap.bind('space', finirTour);
  Mousetrap.bind(['1','2','3','4','5'], (e, combo) => jouerCarte(Number(combo) - 1));
  Mousetrap.bind('esc', ouvrirMenu);
}
```

---

## 7. Champs de saisie — le comportement par défaut

Mousetrap **ignore volontairement** les raccourcis quand le focus est dans un `<input>`, `<select>`, `<textarea>` ou un élément `contenteditable`. C'est ce que tu veux dans 95 % des cas : taper "1" dans un champ ne doit pas jouer une carte.

Pour qu'un raccourci marche **même dans un champ**, ajoute la classe `mousetrap` à l'élément :

```html
<input type="text" class="mousetrap">
```

Ou surcharge la règle globalement :

```js
Mousetrap.stopCallback = function (e, element, combo) {
  if (combo === 'esc') return false;       // esc marche toujours, même dans un champ
  return element.tagName === 'INPUT'
      || element.tagName === 'SELECT'
      || element.tagName === 'TEXTAREA'
      || element.isContentEditable;
};
```

Retourner `true` = on ignore le raccourci. Retourner `false` = on le déclenche.

---

## 8. Instances liées à un élément

Par défaut Mousetrap écoute le `document` entier. Pour limiter l'écoute à un élément précis :

```js
const zone = document.getElementById('editeur');
const mt = new Mousetrap(zone);
mt.bind('mod+b', () => mettreEnGras());
```

Chaque instance a les mêmes méthodes (`bind`, `unbind`, `reset`, `trigger`).

---

## 9. Déclencher un raccourci par code

```js
Mousetrap.trigger('mod+s');
```

Pratique pour qu'un bouton de l'interface et un raccourci passent exactement par le même chemin.

---

## 10. Recettes

### Barre de raccourcis pour un jeu de cartes

```js
// Jouer les cartes 1 à 9
for (let i = 1; i <= 9; i++) {
  Mousetrap.bind(String(i), () => jouerCarte(i - 1));
}

Mousetrap.bind(['space', 'enter'], () => { finirLeTour(); return false; });
Mousetrap.bind('esc',  () => fermerModale());
Mousetrap.bind('?',    () => basculerAide());
Mousetrap.bind('m',    () => basculerSon());
```

### Navigation au clavier dans une liste

```js
let index = 0;
Mousetrap.bind('down',  () => { index = Math.min(index + 1, items.length - 1); surligner(); return false; });
Mousetrap.bind('up',    () => { index = Math.max(index - 1, 0); surligner(); return false; });
Mousetrap.bind('enter', () => choisir(items[index]));
```

Le `return false` sur les flèches empêche la page de défiler.

### Annuler / rétablir

```js
Mousetrap.bind('mod+z',       () => { annuler();  return false; });
Mousetrap.bind('mod+shift+z', () => { retablir(); return false; });
```

### Mode debug caché

```js
Mousetrap.bind('d e b u g', () => document.body.classList.toggle('debug'));
```

---

## 11. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Le navigateur fait son action (Ctrl+S ouvre la sauvegarde) | Pas de `return false` | Retourner `false` dans le handler |
| Le raccourci ne marche pas dans un champ | Comportement voulu par défaut | Classe `mousetrap` sur le champ, ou `stopCallback` |
| Ctrl marche sur PC mais pas sur Mac | `ctrl` codé en dur | Utiliser `mod` |
| Raccourcis d'un ancien écran encore actifs | Pas de nettoyage | `Mousetrap.reset()` au changement d'écran |
| Flèches qui font défiler la page | Comportement natif | `return false` |
| Séquence jamais reconnue | Plus d'une seconde entre deux touches | C'est la limite, non configurable |
