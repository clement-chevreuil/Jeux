# Documentation complète JSZip (hors-ligne)

Version couverte : 3.10.1 — `vendor/jszip/jszip.min.js`

```html
<script src="vendor/jszip/jszip.min.js"></script>
```

Expose le global `JSZip`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**JSZip crée et lit des fichiers `.zip` directement dans le navigateur**, sans serveur.

Le problème qu'il résout : un logiciel local qui exporte ses données produit souvent plusieurs fichiers (une base `.db`, des images, un `.json` de configuration, un `README`). Demander à l'utilisateur d'en télécharger six à la suite est pénible, et il en perdra un. Un `.zip` unique règle la question — et normalement, fabriquer un zip demande un serveur.

Avec JSZip, la compression se fait dans la page. Aucun serveur, aucun envoi de données : le fichier ne quitte jamais la machine de l'utilisateur.

### Quand l'utiliser

- Exporter une sauvegarde complète en un seul fichier
- Regrouper plusieurs exports (données + images + notes)
- Lire une archive fournie par l'utilisateur pour la réimporter
- Créer une sauvegarde datée transférable d'un appareil à l'autre

### Quand s'en passer

- Un seul fichier à exporter → un `Blob` et un lien de téléchargement suffisent
- Des données déjà compactes (du JSON de quelques kilo-octets) → la compression n'apporte rien

Poids : 98 Ko minifié.

---

## 1. Créer une archive

```js
const zip = new JSZip();

zip.file('notes.txt', 'Contenu du fichier');
zip.file('donnees.json', JSON.stringify(donnees, null, 2));

const blob = await zip.generateAsync({ type: 'blob' });
telecharger(blob, 'export.zip');
```

Avec une fonction de téléchargement :

```js
function telecharger(blob, nom) {
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nom;
  lien.click();
  URL.revokeObjectURL(lien.href);
}
```

---

## 2. Ajouter des fichiers

```js
zip.file('texte.txt', 'du texte');                    // chaîne
zip.file('donnees.bin', uint8Array);                   // binaire
zip.file('image.png', blob);                            // Blob
zip.file('base.db', arrayBuffer);                       // ArrayBuffer
zip.file('image.png', base64String, { base64: true });  // base64
```

Dossiers — deux écritures équivalentes :

```js
zip.file('images/sprite.png', blob);       // le dossier est créé implicitement

const dossier = zip.folder('images');
dossier.file('sprite.png', blob);
```

Options par fichier :

```js
zip.file('gros.txt', contenu, {
  compression: 'DEFLATE',      // 'STORE' = pas de compression
  compressionOptions: { level: 9 },   // 1 (rapide) à 9 (compact)
  date: new Date(),
  comment: 'un commentaire',
  binary: false
});
```

---

## 3. Générer l'archive

```js
const blob = await zip.generateAsync({
  type: 'blob',                 // 'blob' | 'uint8array' | 'arraybuffer' | 'base64' | 'string'
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
  comment: 'Export Grimoire'
});
```

Avec une barre de progression :

```js
const blob = await zip.generateAsync(
  { type: 'blob', compression: 'DEFLATE' },
  (meta) => {
    barre.style.width = meta.percent.toFixed(0) + '%';
    // meta.currentFile donne le fichier en cours
  }
);
```

`DEFLATE` niveau 6 est le bon compromis. Le niveau 9 est nettement plus lent pour quelques pour cent gagnés. Pour des fichiers déjà compressés (PNG, JPEG, MP3), utilise `STORE` : les recompresser ne gagne rien et coûte du temps.

---

## 4. Lire une archive

```js
input.addEventListener('change', async (e) => {
  const fichier = e.target.files[0];
  const zip = await JSZip.loadAsync(fichier);

  const texte = await zip.file('notes.txt').async('string');
  const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
  const image = await zip.file('images/sprite.png').async('blob');
});
```

Formats de sortie de `async()` : `'string'`, `'text'`, `'blob'`, `'arraybuffer'`, `'uint8array'`, `'base64'`.

Parcourir le contenu :

```js
zip.forEach((chemin, fichier) => {
  if (fichier.dir) return;                  // ignorer les dossiers
  console.log(chemin, fichier.date);
});
```

Filtrer :

```js
const images = zip.file(/\.png$/);           // tous les PNG
for (const img of images) {
  const blob = await img.async('blob');
}
```

Vérifier avant de lire — `zip.file()` renvoie `null` si le fichier n'existe pas :

```js
const f = zip.file('donnees.json');
if (!f) return alert('Archive invalide : donnees.json manquant');
const donnees = JSON.parse(await f.async('string'));
```

---

## 5. Afficher une image extraite

```js
const blob = await zip.file('images/sprite.png').async('blob');
const url = URL.createObjectURL(blob);
img.src = url;
img.onload = () => URL.revokeObjectURL(url);
```

Pense à libérer l'URL après usage, sinon le blob reste en mémoire.

---

## 6. Recettes

### Sauvegarde complète d'un jeu

```js
async function exporterSauvegarde() {
  const zip = new JSZip();

  zip.file('sauvegarde.json', JSON.stringify(etatDuJeu, null, 2));
  zip.file('statistiques.csv', Papa.unparse(historiqueRuns));
  zip.file('LISEZMOI.txt',
    'Sauvegarde du Grimoire\n' +
    'Exportée le ' + dayjs().format('DD/MM/YYYY à HH:mm') + '\n\n' +
    'Pour restaurer : menu principal → Importer une sauvegarde.'
  );

  const base = exporterBaseSQLite();          // Uint8Array
  if (base) zip.file('grimoire.db', base);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  telecharger(blob, `grimoire-${dayjs().format('YYYY-MM-DD-HHmm')}.zip`);
}
```

Le `LISEZMOI.txt` compte : dans six mois, l'utilisateur (ou toi) retrouvera ce zip sans se souvenir de ce qu'il contient.

### Restauration avec vérification

```js
async function importerSauvegarde(fichier) {
  let zip;
  try {
    zip = await JSZip.loadAsync(fichier);
  } catch {
    return alert("Ce fichier n'est pas une archive zip valide.");
  }

  const f = zip.file('sauvegarde.json');
  if (!f) return alert('Archive invalide : sauvegarde.json est absent.');

  const etat = JSON.parse(await f.async('string'));
  if (!etat.version) return alert('Format de sauvegarde non reconnu.');

  const base = zip.file('grimoire.db');
  if (base) restaurerBase(await base.async('uint8array'));

  restaurerEtat(etat);
  alert('Sauvegarde restaurée.');
}
```

### Exporter les sprites générés en images

```js
async function exporterSprites() {
  const zip = new JSZip();
  const dossier = zip.folder('sprites');

  for (const [nom, forme] of Object.entries(FORMES)) {
    const canvas = canvasAspect({ forme: nom, pal: paletteDe(nom) }, 4);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    dossier.file(nom + '.png', blob, { compression: 'STORE' });   // PNG déjà compressé
  }

  telecharger(await zip.generateAsync({ type: 'blob' }), 'sprites.zip');
}
```

---

## 7. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `zip.file(...)` est `null` | Le fichier n'existe pas dans l'archive | Tester avant d'appeler `.async()` |
| Erreur « corrupted zip » | Fichier qui n'est pas un zip | `try/catch` autour de `loadAsync` |
| Le zip est plus gros que prévu | Recompression de PNG/JPEG/MP3 | `compression: 'STORE'` pour ces fichiers |
| Génération très lente | Niveau de compression 9 | Descendre à 6 |
| L'onglet se fige | Grosse archive sur le thread principal | Utiliser le callback de progression, prévenir l'utilisateur |
| Mémoire qui grimpe | URLs d'objets jamais libérées | `URL.revokeObjectURL()` après usage |
| Accents cassés dans les noms de fichiers | Encodage des noms dans le format zip | Éviter les accents dans les noms de fichiers |
