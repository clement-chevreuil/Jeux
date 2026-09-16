# Documentation complète html2canvas (hors-ligne)

Version couverte : 1.4.1 — `vendor/html2canvas/html2canvas.min.js`

```html
<script src="vendor/html2canvas/html2canvas.min.js"></script>
```

Expose le global `html2canvas`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**html2canvas transforme une partie de ta page en image.** Tu lui donnes un élément HTML, il rend un canvas.

Le problème qu'il résout : le navigateur n'offre aucune API pour « prendre une photo » d'un élément HTML. html2canvas contourne ça en relisant le DOM et les styles calculés, puis en **redessinant** tout dans un canvas — textes, fonds, bordures, images, ombres.

Concrètement, ça permet de fabriquer une image partageable à partir de ce que l'utilisateur voit déjà : un écran de fin de partie, une fiche, un ticket, un récapitulatif.

### Quand l'utiliser

- Générer une image de résultat à partager
- Capturer un récapitulatif visuel (fiche de personnage, tableau de bord)
- Fabriquer l'image d'un PDF (avec jsPDF)

### Quand s'en passer

- Le contenu est déjà dans un canvas → `canvas.toBlob()` est instantané et parfaitement fidèle
- Tu veux une capture pixel-perfect → html2canvas **redessine**, il ne photographie pas ; certains effets CSS ne seront pas reproduits à l'identique
- Tu peux dessiner l'image directement dans un canvas → toujours plus rapide et plus fidèle

Poids : 199 Ko minifié.

> ⚠️ **Ce n'est pas une capture d'écran.** html2canvas réimplémente le rendu CSS en JavaScript. Ce qu'il ne gère pas (ou mal) : `filter`, `backdrop-filter`, `background-blend-mode`, `mask`, certains dégradés complexes, les `iframe`, les polices non chargées, et les images d'origine externe. Teste toujours le résultat.

---

## 1. Usage de base

```js
const element = document.getElementById('resultat');
const canvas = await html2canvas(element);

document.body.appendChild(canvas);          // afficher
canvas.toBlob(b => saveAs(b, 'resultat.png'));   // ou enregistrer
```

Version avec `.then()` :

```js
html2canvas(element).then((canvas) => {
  canvas.toBlob(b => saveAs(b, 'resultat.png'));
});
```

---

## 2. Les options

```js
const canvas = await html2canvas(element, {
  scale: 2,                    // facteur de résolution (défaut : densité de l'écran)
  backgroundColor: '#221934',  // null = fond transparent (défaut : blanc)
  width: 800,                  // largeur de capture
  height: 600,
  x: 0, y: 0,                   // décalage de départ
  scrollX: 0, scrollY: 0,
  windowWidth: 1200,            // largeur de fenêtre simulée
  logging: false,               // true = journal détaillé, utile pour déboguer
  useCORS: true,                // charger les images externes autorisées
  allowTaint: false,            // laisser passer les images non autorisées (canvas non exportable)
  imageTimeout: 15000,
  removeContainer: true,
  foreignObjectRendering: false,
  ignoreElements: (el) => el.classList.contains('sans-capture'),
  onclone: (doc) => {}          // modifier le clone avant le rendu
});
```

### `scale` — le réglage à ne pas oublier

Par défaut html2canvas suit la densité de l'écran, ce qui donne une image floue sur un écran standard. Mets `scale: 2` (ou 3) pour une image nette, notamment si elle sera partagée ou imprimée.

### `backgroundColor`

Le défaut est **blanc**, pas transparent. Sur un thème sombre, précise ta couleur de fond — ou `null` pour du transparent.

### `onclone` — préparer le rendu

html2canvas travaille sur un clone invisible du DOM. `onclone` permet de le modifier juste avant la capture, sans toucher à la page visible :

```js
await html2canvas(element, {
  onclone: (doc) => {
    doc.querySelectorAll('.bouton, .tooltip').forEach(el => el.remove());
    doc.getElementById('titre').textContent = 'Partie terminée';
  }
});
```

C'est le bon endroit pour retirer les boutons, dérouler un contenu tronqué, ou ajouter un filigrane.

---

## 3. La contrainte `file://` sur les images

C'est le principal point de friction en local.

Quand la page est ouverte par double-clic, toute image chargée depuis un fichier voisin **contamine** le canvas (le navigateur la considère d'origine différente). Le canvas devient alors « tainted » : il s'affiche correctement, mais `toBlob()` et `toDataURL()` lèvent une `SecurityError`.

```text
Uncaught SecurityError: Failed to execute 'toBlob' on 'HTMLCanvasElement':
Tainted canvases may not be exported.
```

### Solutions

**A — Pas d'image du tout dans la zone capturée.** Textes, fonds, bordures, dégradés CSS passent sans problème. C'est le cas le plus simple.

**B — Images en base64.** Une image en `data:` n'a pas d'origine, donc ne contamine rien :

```html
<img src="data:image/png;base64,iVBORw0KG...">
```

**C — Sprites dessinés en canvas.** Un canvas rempli par `fillRect` (comme le système de sprites de Grimoire) n'est jamais contaminé : aucune image externe n'intervient. C'est la raison de plus d'aimer cette approche.

**D — Servir la page en HTTP.** Fonctionne, mais sort du cadre « double-clic ».

---

## 4. Ce que fait la capture

```js
const canvas = await html2canvas(element, { scale: 2 });

canvas.width;                       // largeur en pixels (taille CSS × scale)
canvas.toDataURL('image/png');      // data URI
canvas.toDataURL('image/jpeg', .9); // JPEG, qualité 0–1
canvas.toBlob(cb, 'image/png');     // Blob (préférable pour un téléchargement)
```

Un `Blob` est plus efficace qu'un data URI pour un gros export : pas de conversion en base64, donc moins de mémoire.

---

## 5. Recettes

### Bouton « partager mon résultat »

```js
async function exporterResultat() {
  const canvas = await html2canvas(document.getElementById('ecran-fin'), {
    scale: 2,
    backgroundColor: '#181022',
    onclone: (doc) => {
      doc.querySelectorAll('button').forEach(b => b.remove());
    }
  });

  canvas.toBlob((blob) => {
    saveAs(blob, `grimoire-${dayjs().format('YYYY-MM-DD')}.png`);
  }, 'image/png');
}
```

### Aperçu avant enregistrement

```js
const canvas = await html2canvas(element, { scale: 2 });
apercu.innerHTML = '';
canvas.style.maxWidth = '100%';
apercu.appendChild(canvas);

boutonEnregistrer.onclick = () =>
  canvas.toBlob(b => saveAs(b, 'capture.png'));
```

Laisser voir le résultat avant de l'enregistrer évite les mauvaises surprises de rendu.

### Exclure des éléments

```html
<div class="sans-capture">Ceci n'apparaîtra pas</div>
```

```js
html2canvas(element, {
  ignoreElements: (el) => el.classList.contains('sans-capture')
});
```

### Copier dans le presse-papiers

```js
const canvas = await html2canvas(element, { scale: 2 });
canvas.toBlob(async (blob) => {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  alert('Image copiée.');
});
```

L'accès au presse-papiers exige un contexte sécurisé : ça marche en `https://` et sur `localhost`, mais **pas en `file://`**. Prévois le téléchargement comme repli.

### Ajouter un filigrane

```js
await html2canvas(element, {
  onclone: (doc) => {
    const marque = doc.createElement('div');
    marque.textContent = 'Le Grimoire';
    marque.style.cssText = 'position:absolute;bottom:8px;right:12px;opacity:.5;font-size:12px';
    doc.getElementById('ecran-fin').appendChild(marque);
  }
});
```

---

## 6. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `SecurityError` sur `toBlob` | Canvas contaminé par une image locale | Images en base64, ou pas d'image (section 3) |
| Image floue | `scale` trop bas | `scale: 2` ou `3` |
| Fond blanc inattendu | Valeur par défaut | `backgroundColor: '#...'` ou `null` |
| Les boutons apparaissent dans l'image | Rien n'a été exclu | `ignoreElements` ou `onclone` |
| Rendu différent de l'écran | Effets CSS non supportés | Simplifier le CSS de la zone capturée |
| Mauvaise police | Police pas encore chargée | `await document.fonts.ready` avant la capture |
| Contenu coupé | Élément plus grand que la fenêtre | Préciser `width`/`height`/`windowWidth` |
| Très lent | DOM volumineux | Capturer une zone plus restreinte |
