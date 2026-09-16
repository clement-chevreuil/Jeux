# Documentation complète Sortable.js (hors-ligne)

Version couverte : 1.15.2 — `vendor/sortable/Sortable.min.js`

```html
<script src="vendor/sortable/Sortable.min.js"></script>
```

Expose le global `Sortable`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Sortable.js rend une liste réorganisable au glisser-déposer**, à la souris comme au doigt.

Le problème qu'il résout : l'API HTML native de drag & drop existe, mais elle est ancienne, capricieuse, incohérente d'un navigateur à l'autre, et surtout **elle ne fonctionne pas au doigt sur mobile**. Sortable réimplémente tout par-dessus les événements souris et tactiles, avec les animations de réorganisation, l'auto-défilement quand on approche du bord, et le déplacement entre plusieurs listes.

C'est ce qui permet à l'utilisateur d'organiser ses données lui-même plutôt que de subir un ordre imposé.

### Quand l'utiliser

- Réordonner une liste (tâches, favoris, priorités)
- Déplacer des éléments entre plusieurs colonnes (kanban)
- Construire un deck, un inventaire, un ordre de passage
- Réorganiser des blocs dans un éditeur

### Quand s'en passer

- Une liste que l'utilisateur ne réordonne jamais
- Deux ou trois éléments → des boutons ↑ ↓ sont plus simples, plus accessibles, et marchent au clavier

Poids : 45 Ko minifié.

---

## 1. Usage de base

```html
<ul id="liste">
  <li>Premier</li>
  <li>Deuxième</li>
  <li>Troisième</li>
</ul>
```

```js
const liste = document.getElementById('liste');
Sortable.create(liste, { animation: 150 });
```

Deux lignes, et la liste est réorganisable à la souris **et** au doigt. `animation: 150` fait glisser les éléments au lieu de les faire sauter — mets-le toujours, sans lui l'effet est brutal.

---

## 2. Les options

```js
Sortable.create(liste, {
  animation: 150,              // durée de l'animation en ms (0 = aucune)
  easing: 'cubic-bezier(1, 0, 0, 1)',

  handle: '.poignee',          // seule cette zone permet de saisir
  filter: '.non-deplacable',   // ces éléments ne bougent pas
  draggable: '.item',          // seuls ces éléments sont déplaçables

  ghostClass: 'fantome',       // classe de l'emplacement de dépôt
  chosenClass: 'choisi',       // classe de l'élément sélectionné
  dragClass: 'en-cours',       // classe de l'élément pendant le déplacement

  disabled: false,             // désactiver temporairement
  sort: true,                  // false = on peut sortir les éléments mais pas réordonner

  delay: 0,                    // délai avant que le glisser démarre (ms)
  delayOnTouchOnly: true,      // ce délai ne s'applique qu'au tactile
  touchStartThreshold: 3,      // tolérance de mouvement du doigt

  swapThreshold: 1,            // sensibilité de l'échange (0.5 = plus réactif)
  invertSwap: false,
  direction: 'vertical',       // 'vertical' | 'horizontal'

  forceFallback: false,        // ignorer le drag natif (utile si rendu bizarre)
  scroll: true,                // auto-défilement près des bords
  scrollSensitivity: 30,
  scrollSpeed: 10
});
```

### `delay` sur mobile — important

Sans délai, glisser le doigt pour **faire défiler** la page attrape un élément de la liste. Résultat : impossible de scroller.

```js
Sortable.create(liste, {
  animation: 150,
  delay: 200,
  delayOnTouchOnly: true    // la souris reste immédiate, le doigt attend 200ms
});
```

Alternative plus explicite : une poignée dédiée.

```js
Sortable.create(liste, { handle: '.poignee' });
```

```html
<li><span class="poignee">⠿</span> Mon élément</li>
```

---

## 3. Les événements

```js
Sortable.create(liste, {
  onStart:  (evt) => {},   // début du déplacement
  onEnd:    (evt) => {},   // fin — le plus utile
  onAdd:    (evt) => {},   // élément venu d'une autre liste
  onRemove: (evt) => {},   // élément parti vers une autre liste
  onUpdate: (evt) => {},   // ordre changé DANS cette liste
  onSort:   (evt) => {},   // onUpdate + onAdd + onRemove
  onChoose: (evt) => {},
  onUnchoose: (evt) => {},
  onMove:   (evt) => {},   // pendant le survol ; retourner false pour interdire
  onClone:  (evt) => {}
});
```

L'objet `evt` :

```js
evt.item;       // l'élément déplacé
evt.from;       // liste d'origine
evt.to;         // liste d'arrivée
evt.oldIndex;   // index avant
evt.newIndex;   // index après
evt.clone;
```

Enregistrer le nouvel ordre :

```js
Sortable.create(liste, {
  animation: 150,
  onEnd: (evt) => {
    if (evt.oldIndex === evt.newIndex) return;       // rien n'a bougé
    const item = donnees.splice(evt.oldIndex, 1)[0];
    donnees.splice(evt.newIndex, 0, item);
    sauvegarder(donnees);
  }
});
```

Réordonne **toujours** ton tableau de données, pas seulement le DOM. Sinon le prochain rendu remettra l'ordre d'origine.

---

## 4. Plusieurs listes

Des listes qui partagent le même `group` échangent leurs éléments :

```js
Sortable.create(document.getElementById('a-faire'),  { group: 'taches', animation: 150 });
Sortable.create(document.getElementById('en-cours'), { group: 'taches', animation: 150 });
Sortable.create(document.getElementById('termine'),  { group: 'taches', animation: 150 });
```

Contrôle fin avec un objet :

```js
group: {
  name: 'taches',
  pull: true,       // true | false | 'clone' | fonction
  put: true         // true | false | ['autre-groupe'] | fonction
}
```

Une source qui se **copie** au lieu de se vider (palette d'outils, catalogue de cartes) :

```js
// catalogue : on copie, on ne retire jamais
Sortable.create(catalogue, { group: { name: 'cartes', pull: 'clone', put: false }, sort: false });

// deck : on accepte, on réordonne
Sortable.create(deck, { group: 'cartes', animation: 150 });
```

Interdire un dépôt selon une règle :

```js
Sortable.create(deck, {
  group: {
    name: 'cartes',
    put: (to) => to.el.children.length < 10     // 10 cartes maximum
  }
});
```

---

## 5. Lire et écrire l'ordre

```js
const s = Sortable.create(liste);

s.toArray();                    // ['id1', 'id3', 'id2'] — d'après data-id
s.sort(['id2', 'id1', 'id3']);  // applique cet ordre
s.save();
```

`toArray()` lit l'attribut `data-id` de chaque élément :

```html
<li data-id="carte-7">Frappe</li>
```

Pour changer l'attribut lu : `dataIdAttr: 'data-carte'`.

---

## 6. Contrôler l'instance

```js
const s = Sortable.create(liste, { animation: 150 });

s.option('disabled', true);     // désactiver
s.option('disabled', false);
s.option('animation');           // lire une option

s.destroy();                     // nettoyer (avant de retirer la liste du DOM)

Sortable.get(liste);             // récupérer l'instance d'un élément
```

`destroy()` est à appeler si tu recrées souvent tes listes, sinon les écouteurs s'accumulent.

---

## 7. Styliser le déplacement

```css
.fantome {                /* l'emplacement de dépôt */
  opacity: .4;
  background: var(--fond-clair);
  border: 2px dashed var(--bordure);
}

.choisi {                  /* l'élément saisi */
  background: var(--fond-clair);
}

.en-cours {                /* l'élément qui suit le curseur */
  opacity: .9;
  transform: rotate(2deg);
}

.poignee {
  cursor: grab;
  touch-action: none;      /* évite que le navigateur prenne le geste */
}
```

---

## 8. Recettes

### Liste de tâches réordonnable et persistée

```js
Sortable.create(document.getElementById('taches'), {
  animation: 150,
  handle: '.poignee',
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: 'fantome',
  onEnd: () => {
    const ordre = [...document.querySelectorAll('#taches li')].map(li => li.dataset.id);
    localStorage.setItem('ordre-taches', JSON.stringify(ordre));
  }
});
```

Au chargement :

```js
const ordre = JSON.parse(localStorage.getItem('ordre-taches') || '[]');
if (ordre.length) Sortable.get(document.getElementById('taches')).sort(ordre);
```

### Kanban à trois colonnes

```js
['a-faire', 'en-cours', 'termine'].forEach(id => {
  Sortable.create(document.getElementById(id), {
    group: 'kanban',
    animation: 150,
    ghostClass: 'fantome',
    onEnd: (evt) => {
      const tache = evt.item.dataset.id;
      const colonne = evt.to.id;
      majStatut(tache, colonne);
    }
  });
});
```

### Constructeur de deck

```js
// catalogue : source infinie
Sortable.create(catalogue, {
  group: { name: 'deck', pull: 'clone', put: false },
  sort: false,
  animation: 150
});

// deck : limité à 20 cartes, on peut retirer en glissant dehors
Sortable.create(deckEl, {
  group: { name: 'deck', put: (to) => to.el.children.length < 20 },
  animation: 150,
  onAdd: (evt) => ajouterAuDeck(evt.item.dataset.carte),
  onRemove: (evt) => retirerDuDeck(evt.item.dataset.carte)
});
```

---

## 9. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Impossible de scroller la page sur mobile | Le glisser démarre immédiatement | `delay: 200` + `delayOnTouchOnly: true` |
| L'ordre revient après un re-rendu | Seul le DOM a été modifié | Réordonner aussi le tableau de données |
| Les éléments sautent sans transition | Pas d'animation | `animation: 150` |
| Rendu bizarre pendant le glisser | Drag natif du navigateur | `forceFallback: true` |
| `toArray()` renvoie des vides | Pas de `data-id` sur les éléments | Ajouter `data-id`, ou `dataIdAttr` |
| Handlers en double | Instances jamais détruites | `s.destroy()` avant de recréer |
| L'échange se déclenche trop tôt | Seuil par défaut | `swapThreshold: 0.65` |
