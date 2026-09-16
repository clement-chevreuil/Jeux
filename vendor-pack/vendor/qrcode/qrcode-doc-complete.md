# Documentation complète QRCode.js (hors-ligne)

Version couverte : 1.0.0 (qrcodejs) — `vendor/qrcode/qrcode.min.js`

```html
<script src="vendor/qrcode/qrcode.min.js"></script>
```

Expose le global `QRCode`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**QRCode.js génère des QR codes dans la page**, dessinés dans un canvas.

Le problème qu'il résout : faire passer une information d'un écran à un autre sans réseau. Un QR code affiché sur l'ordinateur et scanné par un téléphone transfère un texte instantanément — sans compte, sans serveur, sans câble, sans Bluetooth.

Pour un logiciel qui refuse toute dépendance extérieure, c'est un pont utile : partager un lien, transmettre une petite sauvegarde, afficher un identifiant, imprimer une étiquette scannable.

### Quand l'utiliser

- Transférer une donnée courte de l'ordinateur au téléphone
- Partager l'adresse d'une page locale ou d'un fichier
- Imprimer des étiquettes scannables (inventaire, rangement)
- Afficher un code de partie, un identifiant, une référence

### Quand s'en passer

- Des données volumineuses → un QR code plafonne en pratique vers 1 à 2 Ko ; au-delà il devient illisible (voir section 5)
- Les deux appareils peuvent partager un fichier → c'est plus simple et sans limite de taille

Poids : 20 Ko minifié.

---

## 1. Usage de base

```html
<div id="qrcode"></div>
```

```js
new QRCode(document.getElementById('qrcode'), 'Bonjour');
```

La librairie insère un `<canvas>` (et une image de repli) dans le conteneur.

Avec des options :

```js
const qr = new QRCode(document.getElementById('qrcode'), {
  text: 'https://exemple.fr',
  width: 256,
  height: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  correctLevel: QRCode.CorrectLevel.H
});
```

---

## 2. Les options

| Option | Défaut | Description |
| --- | --- | --- |
| `text` | — | Le contenu à encoder |
| `width` | 256 | Largeur en pixels |
| `height` | 256 | Hauteur en pixels |
| `colorDark` | `#000000` | Couleur des modules |
| `colorLight` | `#ffffff` | Couleur du fond |
| `correctLevel` | `H` | Niveau de correction d'erreur |

Niveaux de correction :

```js
QRCode.CorrectLevel.L   // ~7 %  de tolérance — plus de données, plus fragile
QRCode.CorrectLevel.M   // ~15 %
QRCode.CorrectLevel.Q   // ~25 %
QRCode.CorrectLevel.H   // ~30 % — plus robuste, moins de données (défaut)
```

Plus la correction est élevée, plus le code résiste aux dégradations (impression médiocre, écran sale, code partiellement masqué) — mais moins il peut contenir de données. Garde `H` pour un code imprimé, descends à `M` ou `L` si tu dois faire tenir plus de texte.

---

## 3. Contrôler l'instance

```js
const qr = new QRCode(element, { text: 'v1', width: 200, height: 200 });

qr.clear();               // efface
qr.makeCode('nouveau contenu');   // regénère
```

`makeCode()` remplace le contenu sans recréer l'instance — c'est ce qu'il faut utiliser pour un QR code qui se met à jour.

```js
champ.addEventListener('input', () => {
  qr.makeCode(champ.value || ' ');   // un espace : une chaîne vide lève une erreur
});
```

---

## 4. Contraste et couleurs

Un QR code se lit par contraste. Deux règles :

- **`colorDark` doit être nettement plus sombre que `colorLight`.** Un code violet sur fond violet foncé ne sera jamais scanné.
- **Garde une marge claire autour** (la « quiet zone »), au moins l'équivalent de 4 modules. Sans elle, beaucoup de lecteurs échouent.

Sur un thème sombre, le réflexe est de mettre le QR code dans un cadre clair :

```css
.cadre-qr {
  background: #fff;
  padding: 16px;          /* la marge claire obligatoire */
  border-radius: 8px;
  display: inline-block;
}
```

L'inversion (clair sur fond sombre) fonctionne avec certains lecteurs et pas d'autres — à éviter si le code doit être fiable.

---

## 5. Combien de données peut-on encoder ?

Ordres de grandeur avec une correction `H` :

| Contenu | Capacité approximative |
| --- | --- |
| Chiffres uniquement | ~1 200 caractères |
| Texte alphanumérique majuscule | ~700 caractères |
| Texte libre (UTF-8, accents) | ~450 caractères |

Plus il y a de données, plus les modules sont fins — et plus il faut un grand affichage et un bon appareil photo pour les lire. **En pratique, vise moins de 300 caractères** pour un code confortablement scannable.

Pour une sauvegarde complète, le QR code n'est pas le bon outil : exporte un fichier (voir FileSaver / JSZip).

---

## 6. Récupérer l'image

La librairie dessine dans un `<canvas>` à l'intérieur du conteneur :

```js
const canvas = document.querySelector('#qrcode canvas');

canvas.toBlob(b => saveAs(b, 'qrcode.png'));
const dataUrl = canvas.toDataURL('image/png');
```

Aucun problème de canvas contaminé ici : tout est dessiné par la librairie, aucune image externe n'intervient. Ça marche donc parfaitement en `file://`.

Insérer dans un PDF :

```js
doc.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 40, 50, 50);
```

---

## 7. Recettes

### Partager un texte vers le téléphone

```js
function partagerVersTelephone(texte) {
  const conteneur = document.getElementById('qrcode');
  conteneur.innerHTML = '';

  if (texte.length > 300) {
    conteneur.textContent = 'Texte trop long pour un QR code.';
    return;
  }

  new QRCode(conteneur, {
    text: texte,
    width: 220,
    height: 220,
    correctLevel: QRCode.CorrectLevel.M
  });
}
```

Le `innerHTML = ''` avant de recréer est important : sans lui, les QR codes s'empilent dans le conteneur.

### Code de partie affiché

```js
const code = Math.random().toString(36).slice(2, 8).toUpperCase();   // 'K4X9PZ'
document.getElementById('code-texte').textContent = code;
new QRCode(document.getElementById('qrcode'), { text: code, width: 160, height: 160 });
```

Affiche toujours le texte **à côté** du QR code : si le scan échoue, l'utilisateur peut le recopier.

### QR code mis à jour en direct

```js
const qr = new QRCode(document.getElementById('qrcode'), {
  text: ' ', width: 200, height: 200
});

champ.addEventListener('input', () => {
  const v = champ.value.trim();
  qr.makeCode(v || ' ');
  compteur.textContent = `${v.length} / 300 caractères`;
});
```

### Étiquette imprimable

```js
function etiquette(reference, libelle) {
  const div = document.createElement('div');
  div.className = 'etiquette';
  div.innerHTML = `<div class="qr"></div><div class="libelle">${libelle}</div>`;
  document.getElementById('planche').appendChild(div);

  new QRCode(div.querySelector('.qr'), {
    text: reference,
    width: 120, height: 120,
    correctLevel: QRCode.CorrectLevel.H     // impression : correction maximale
  });
}
```

```css
@media print {
  .etiquette { break-inside: avoid; page-break-inside: avoid; }
  .qr { background: #fff; padding: 8px; }
}
```

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Les QR codes s'empilent | Conteneur non vidé | `conteneur.innerHTML = ''` avant |
| Erreur avec une chaîne vide | `text` vide non géré | Passer `' '` en repli |
| Illisible au scan | Trop de données, modules trop fins | Raccourcir, ou agrandir l'affichage |
| Illisible sur thème sombre | Contraste insuffisant | Cadre blanc avec marge (section 4) |
| Code coupé à l'impression | Pas de marge claire | `padding` sur le conteneur |
| Le scan échoue de près | Certains lecteurs ont besoin de recul | Réduire la taille affichée, ou reculer |
| Accents mal décodés | Encodage selon le lecteur | Se limiter à l'ASCII pour les données critiques |
