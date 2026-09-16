# Documentation complète PapaParse (hors-ligne)

Version couverte : 5.4.1 — `vendor/papaparse/papaparse.min.js`

```html
<script src="vendor/papaparse/papaparse.min.js"></script>
```

Expose le global `Papa`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**PapaParse lit et écrit des fichiers CSV**, dans les deux sens, y compris les cas tordus.

Le problème qu'il résout : un CSV a l'air simple (« il suffit de découper sur les virgules »), et c'est un piège. Un champ peut contenir une virgule s'il est entre guillemets, un guillemet s'il est doublé, un retour à la ligne à l'intérieur d'une cellule, un BOM en début de fichier, des fins de ligne Windows ou Unix, un séparateur point-virgule (comme Excel en français)... Un `split(',')` casse sur le premier cas réel. PapaParse gère tout ça, dans les deux sens.

C'est la pièce qui rend un logiciel local vraiment autonome : l'utilisateur importe ses données depuis Excel ou LibreOffice, et les réexporte, sans qu'aucun serveur n'intervienne.

### Quand l'utiliser

- Importer un fichier CSV choisi par l'utilisateur
- Exporter des données vers Excel / LibreOffice
- Lire un catalogue de données livré avec le logiciel
- Échanger des données entre deux de tes projets

### Quand s'en passer

- Des données internes à ton propre logiciel → JSON est plus fidèle (il conserve les types et les structures imbriquées)
- Un CSV que tu génères **et** relis toi-même, avec des données simples et garanties sans virgule ni guillemet

Poids : 19 Ko minifié.

---

## 1. Lire une chaîne CSV

```js
const csv = `nom,pv,type
Gobelin,12,normal
Golem,45,elite`;

const res = Papa.parse(csv, { header: true });
console.log(res.data);
// [ { nom: 'Gobelin', pv: '12', type: 'normal' },
//   { nom: 'Golem',   pv: '45', type: 'elite'  } ]
```

Sans `header: true`, tu obtiens des tableaux plutôt que des objets :

```js
Papa.parse(csv).data;
// [ ['nom','pv','type'], ['Gobelin','12','normal'], ['Golem','45','elite'] ]
```

---

## 2. Les options de lecture

```js
Papa.parse(source, {
  header: true,           // 1re ligne = noms de colonnes → objets (défaut false)
  dynamicTyping: true,    // convertit "12" en 12, "true" en true (défaut false)
  skipEmptyLines: true,   // ignore les lignes vides (défaut false)
  delimiter: '',          // '' = détection automatique ; sinon ',' ';' '\t'
  newline: '',            // détection automatique
  quoteChar: '"',
  escapeChar: '"',
  comments: false,        // ex: '#' pour ignorer les lignes de commentaire
  preview: 0,             // 0 = tout ; sinon nombre de lignes max
  encoding: '',           // ex: 'ISO-8859-1' pour un vieux fichier Excel français
  transformHeader: (h) => h.trim().toLowerCase(),
  transform: (valeur, colonne) => valeur.trim(),
  complete: (resultats) => {},
  error: (err) => {}
});
```

`dynamicTyping: true` est presque toujours souhaitable : sans lui, tous tes nombres arrivent en chaînes de caractères.

`skipEmptyLines: true` évite l'objet vide parasite en fin de fichier (quasiment tous les CSV se terminent par un retour à la ligne).

---

## 3. L'objet résultat

```js
const res = Papa.parse(csv, { header: true });

res.data;     // tableau des lignes
res.errors;   // tableau des erreurs rencontrées
res.meta;     // { delimiter, linebreak, aborted, truncated, fields }
```

Toujours vérifier `errors` avant d'utiliser les données :

```js
if (res.errors.length) {
  console.warn('Problèmes :', res.errors);
  // chaque erreur : { type, code, message, row }
}
```

Une erreur n'est pas forcément bloquante : PapaParse fait de son mieux et continue. `res.meta.fields` donne la liste des colonnes détectées.

---

## 4. Lire un fichier choisi par l'utilisateur

C'est le cas d'usage principal. Passe l'objet `File` directement — la lecture devient asynchrone :

```html
<input type="file" id="fichier" accept=".csv">
```

```js
document.getElementById('fichier').addEventListener('change', (e) => {
  const fichier = e.target.files[0];
  if (!fichier) return;

  Papa.parse(fichier, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (res) => {
      console.log(res.data);
      importerDonnees(res.data);
    },
    error: (err) => alert('Lecture impossible : ' + err.message)
  });
});
```

Avec un `File`, le résultat arrive **uniquement** dans `complete`, jamais en valeur de retour.

### Gros fichiers : traiter ligne par ligne

Pour ne pas charger 200 Mo en mémoire d'un coup :

```js
Papa.parse(fichier, {
  header: true,
  step: (ligne) => {          // appelé pour CHAQUE ligne
    traiter(ligne.data);
  },
  complete: () => console.log('fini')
});
```

Avec `step`, `res.data` reste vide à la fin — c'est voulu, tu as déjà tout traité au fil de l'eau.

---

## 5. Écrire du CSV (`unparse`)

```js
const donnees = [
  { nom: 'Gobelin', pv: 12, type: 'normal' },
  { nom: 'Golem',   pv: 45, type: 'elite'  }
];

const csv = Papa.unparse(donnees);
// nom,pv,type
// Gobelin,12,normal
// Golem,45,elite
```

Options d'écriture :

```js
Papa.unparse(donnees, {
  delimiter: ';',        // point-virgule : attendu par Excel en configuration française
  newline: '\r\n',       // fins de ligne Windows
  quotes: false,         // true = tout entre guillemets ; ou tableau par colonne
  quoteChar: '"',
  header: true,          // écrire la ligne d'en-têtes (défaut true)
  columns: ['nom', 'pv'] // choisir et ordonner les colonnes
});
```

À partir de tableaux plutôt que d'objets :

```js
Papa.unparse({
  fields: ['nom', 'pv'],
  data: [['Gobelin', 12], ['Golem', 45]]
});
```

---

## 6. Télécharger le CSV produit

```js
function exporterCSV(donnees, nomFichier = 'export.csv') {
  const csv = Papa.unparse(donnees);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });

  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(lien.href);
}
```

Le `'﻿'` en tête est un **BOM UTF-8**. Sans lui, Excel affiche `Ã©` au lieu de `é`. C'est le piège numéro un de l'export CSV en français — ne l'oublie pas.

---

## 7. Recettes

### Import avec validation

```js
function importer(fichier) {
  Papa.parse(fichier, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    complete: (res) => {
      const requises = ['nom', 'pv'];
      const manquantes = requises.filter(c => !res.meta.fields.includes(c));
      if (manquantes.length) {
        return alert('Colonnes manquantes : ' + manquantes.join(', '));
      }

      const valides = res.data.filter(l => l.nom && Number.isFinite(l.pv));
      const rejetees = res.data.length - valides.length;
      if (rejetees) console.warn(`${rejetees} ligne(s) ignorée(s)`);

      enregistrer(valides);
    }
  });
}
```

### Export compatible Excel français

```js
const csv = Papa.unparse(donnees, { delimiter: ';' });
const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
```

Excel en configuration française attend le point-virgule ; avec une virgule, tout atterrit dans une seule colonne.

### Catalogue livré avec le logiciel

Un CSV chargé par `fetch` est bloqué en `file://`. Deux solutions : coller le CSV dans une chaîne JavaScript…

```js
const CATALOGUE_CSV = `nom,pv
Gobelin,12
Golem,45`;

const cartes = Papa.parse(CATALOGUE_CSV, { header: true, dynamicTyping: true }).data;
```

…ou, mieux, écrire directement les données en JSON dans un `.js` — c'est plus simple et plus rapide. Réserve le CSV aux échanges avec l'extérieur.

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `é` s'affiche `Ã©` dans Excel | BOM UTF-8 absent | Préfixer le contenu par `'﻿'` |
| Tout arrive dans une seule colonne Excel | Excel FR attend `;` | `delimiter: ';'` à l'export |
| Les nombres sont des chaînes | Conversion désactivée | `dynamicTyping: true` |
| Un objet vide en fin de tableau | Ligne finale vide | `skipEmptyLines: true` |
| `res.data` vide alors qu'il y a des données | Source `File` (asynchrone) | Lire dans le callback `complete` |
| `res.data` vide avec `step` | Normal, tout passe par `step` | Accumuler soi-même dans `step` |
| Accents cassés à l'import | Fichier en ISO-8859-1 | `encoding: 'ISO-8859-1'` |
| `fetch('data.csv')` échoue | Bloqué en `file://` | Embarquer les données dans un `.js` |
