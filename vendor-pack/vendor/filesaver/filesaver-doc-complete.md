# Documentation complète FileSaver.js (hors-ligne)

Version couverte : 2.0.5 — `vendor/filesaver/FileSaver.min.js`

```html
<script src="vendor/filesaver/FileSaver.min.js"></script>
```

Expose le global `saveAs`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**FileSaver.js déclenche le téléchargement d'un fichier généré dans la page.** Une fonction, un blob, un nom de fichier.

Le problème qu'il résout : un logiciel local ne peut pas écrire sur le disque de l'utilisateur — la seule voie autorisée par le navigateur est le téléchargement. L'astuce classique (créer un `<a download>`, simuler un clic, libérer l'URL) tient en cinq lignes, mais comporte des pièges : libérer l'URL trop tôt annule le téléchargement, certains navigateurs exigent que le lien soit dans le document, les gros fichiers demandent un traitement particulier. FileSaver encapsule tout ça derrière une fonction.

C'est la brique qui rend viable le principe « export/import manuel » du manifeste : sans écriture disque automatique, l'utilisateur récupère ses données par téléchargement.

### Quand l'utiliser

- Exporter une sauvegarde, un CSV, une archive zip, un PDF
- Enregistrer une image produite par un canvas
- Tout fichier fabriqué côté client que l'utilisateur doit conserver

### Quand s'en passer

- Franchement, la version maison suffit dans la plupart des cas (voir section 5) — cette librairie est surtout là pour les cas limites et pour ne plus y penser

Poids : 3 Ko minifié.

---

## 1. Usage de base

```js
const blob = new Blob(['Bonjour'], { type: 'text/plain;charset=utf-8' });
saveAs(blob, 'salut.txt');
```

Signature :

```js
saveAs(blob, nomFichier, options);
```

- `blob` — un `Blob`, un `File`, ou une URL (chaîne)
- `nomFichier` — le nom proposé à l'utilisateur
- `options` — `{ autoBom: true }` pour ajouter le BOM UTF-8

L'`autoBom` évite les accents cassés à l'ouverture dans Excel :

```js
saveAs(blob, 'export.csv', { autoBom: true });
```

---

## 2. Enregistrer différents contenus

### Texte

```js
saveAs(new Blob(['du texte'], { type: 'text/plain;charset=utf-8' }), 'notes.txt');
```

### JSON

```js
const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
saveAs(blob, 'sauvegarde.json');
```

Le `null, 2` indente le JSON — indispensable si l'utilisateur doit pouvoir le relire ou le corriger à la main.

### CSV

```js
const csv = Papa.unparse(donnees);
saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'donnees.csv', { autoBom: true });
```

### Canvas en PNG

```js
canvas.toBlob((blob) => saveAs(blob, 'sprite.png'), 'image/png');
```

`toBlob` est asynchrone — le `saveAs` va dans le callback.

### Binaire (base SQLite, par exemple)

```js
const octets = db.export();                       // Uint8Array
saveAs(new Blob([octets], { type: 'application/x-sqlite3' }), 'grimoire.db');
```

### Archive zip

```js
const blob = await zip.generateAsync({ type: 'blob' });
saveAs(blob, 'export.zip');
```

---

## 3. Types MIME courants

| Contenu | Type MIME |
| --- | --- |
| Texte | `text/plain;charset=utf-8` |
| JSON | `application/json` |
| CSV | `text/csv;charset=utf-8` |
| HTML | `text/html;charset=utf-8` |
| PNG | `image/png` |
| Zip | `application/zip` |
| PDF | `application/pdf` |
| SQLite | `application/x-sqlite3` |
| Inconnu / binaire | `application/octet-stream` |

Le `charset=utf-8` sur les formats texte est important : sans lui, les accents peuvent mal s'afficher selon l'application qui ouvre le fichier.

---

## 4. Ce que le navigateur contrôle (et pas toi)

- **Tu ne choisis pas le dossier.** Le fichier part dans le dossier de téléchargement configuré, ou le navigateur demande où l'enregistrer. C'est une limite de sécurité, aucune librairie ne la contourne.
- **Le nom peut être modifié.** Si `export.zip` existe déjà, tu obtiendras `export (1).zip`.
- **Tu ne sais pas si l'utilisateur a accepté.** Aucun retour, aucune promesse. Ne fais pas dépendre ta logique du succès du téléchargement.
- **Plusieurs téléchargements d'affilée** peuvent déclencher un avertissement du navigateur. Pour exporter plusieurs fichiers, regroupe-les dans un zip (voir JSZip).

---

## 5. La version sans librairie

Pour information — elle couvre 95 % des cas :

```js
function telecharger(blob, nom) {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

Le `setTimeout` avant `revokeObjectURL` est le détail qui manque souvent : libérer l'URL immédiatement après le clic annule le téléchargement dans certains navigateurs.

FileSaver apporte en plus : la gestion du BOM, les très gros fichiers, et les contournements pour les navigateurs anciens ou embarqués (dont certains navigateurs mobiles).

---

## 6. Recettes

### Bouton d'export générique

```js
function exporter(contenu, nom, type = 'application/json') {
  const blob = contenu instanceof Blob ? contenu : new Blob([contenu], { type });
  saveAs(blob, nom, { autoBom: type.startsWith('text/') });
}

exporter(JSON.stringify(etat, null, 2), 'sauvegarde.json');
exporter(Papa.unparse(runs), 'runs.csv', 'text/csv;charset=utf-8');
```

### Nom de fichier horodaté

```js
const nom = `grimoire-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
saveAs(blob, nom);
```

L'année en premier garantit un tri chronologique correct dans l'explorateur de fichiers.

### Exporter un sprite en PNG agrandi

```js
function exporterSprite(aspect, echelle = 8) {
  const canvas = portraitAspect(aspect, echelle);
  canvas.toBlob((blob) => saveAs(blob, `${aspect.forme}-x${echelle}.png`), 'image/png');
}
```

### Export complet (le bon réflexe : un seul fichier)

```js
async function toutExporter() {
  const zip = new JSZip();
  zip.file('sauvegarde.json', JSON.stringify(etat, null, 2));
  zip.file('runs.csv', Papa.unparse(runs));
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `export-${dayjs().format('YYYY-MM-DD')}.zip`);
}
```

---

## 7. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Rien ne se passe | Appel hors d'une interaction utilisateur | Déclencher depuis un vrai clic |
| Accents cassés dans Excel | Pas de BOM | `{ autoBom: true }` |
| Téléchargement vide ou interrompu | URL libérée trop tôt (version maison) | Attendre avant `revokeObjectURL` |
| Le 2e fichier ne part pas | Téléchargements multiples bloqués | Regrouper dans un zip |
| Fichier `.txt` au lieu de `.csv` | Type MIME générique | Préciser le bon type MIME |
| PNG vide depuis un canvas | `toBlob` est asynchrone | Appeler `saveAs` dans le callback |
