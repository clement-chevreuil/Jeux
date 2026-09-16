# Dossier `vendor/` — librairies universelles

À copier une seule fois à la racine de n'importe quel projet HTML/CSS/JS natif.
Aucune de ces librairies n'appelle de CDN — tout est en local, ça marche direct en `file://`.

Chaque dossier contient **la librairie et sa documentation complète en français**.

```text
vendor/
├── jquery/          jquery.min.js                 (v4.0.0)
├── bootstrap/       bootstrap.min.css             (v5.3.8)
│                    bootstrap.bundle.min.js       (v5.3.8, inclut Popper)
├── sqlite/          sql-wasm.js + sql-wasm-base64.js
│
│   ── interface & interaction ──
├── anime/           anime.min.js                  (v3.2.2)   animations
├── hammer/          hammer.min.js                 (v2.0.7)   gestes tactiles
├── mousetrap/       mousetrap.min.js              (v1.6.5)   raccourcis clavier
├── sortable/        Sortable.min.js               (v1.15.2)  glisser-déposer
├── confetti/        confetti.browser.js           (v1.9.3)   confettis
│
│   ── son ──
├── howler/          howler.min.js                 (v2.2.4)   audio
│
│   ── données & fichiers ──
├── papaparse/       papaparse.min.js              (v5.4.1)   CSV
├── jszip/           jszip.min.js                  (v3.10.1)  archives .zip
├── filesaver/       FileSaver.min.js              (v2.0.5)   téléchargement
├── dayjs/           dayjs.min.js                  (v1.11.13) dates
├── fuse/            fuse.min.js                   (v7.0.0)   recherche floue
│
│   ── contenu & export ──
├── marked/          marked.min.js                 (v12.0.2)  Markdown → HTML
├── dompurify/       purify.min.js                 (v3.1.6)   nettoyage HTML
├── chartjs/         chart.umd.min.js              (v4.4.3)   graphiques
├── html2canvas/     html2canvas.min.js            (v1.4.1)   HTML → image
├── jspdf/           jspdf.umd.min.js              (v2.5.1)   génération PDF
├── qrcode/          qrcode.min.js                 (v1.0.0)   QR codes
│
└── docs/            documentation de jquery, bootstrap et sqlite
```

## À quoi sert chaque librairie

| Librairie | Sert à | Poids | Global |
| --- | --- | --- | --- |
| **jquery** | Manipuler le DOM, les événements, les requêtes | 30 Ko | `$` |
| **bootstrap** | Mise en page et composants d'interface prêts à l'emploi | 230 Ko | `bootstrap` |
| **sqlite** | Une vraie base SQL dans le navigateur | 1,2 Mo | `initSqlJs` |
| **anime** | Animer des éléments : cartes, barres, transitions | 17 Ko | `anime` |
| **hammer** | Gestes au doigt : balayage, pincement, appui long | 21 Ko | `Hammer` |
| **mousetrap** | Raccourcis clavier, y compris séquences de touches | 5 Ko | `Mousetrap` |
| **sortable** | Réorganiser des listes au glisser-déposer | 45 Ko | `Sortable` |
| **confetti** | Confettis pour les écrans de réussite | 25 Ko | `confetti` |
| **howler** | Jouer des sons et de la musique | 36 Ko | `Howl`, `Howler` |
| **papaparse** | Lire et écrire du CSV (import/export Excel) | 19 Ko | `Papa` |
| **jszip** | Créer et lire des archives `.zip` | 98 Ko | `JSZip` |
| **filesaver** | Déclencher le téléchargement d'un fichier généré | 3 Ko | `saveAs` |
| **dayjs** | Formater et calculer des dates | 7 Ko | `dayjs` |
| **fuse** | Recherche tolérante aux fautes de frappe | 24 Ko | `Fuse` |
| **marked** | Convertir du Markdown en HTML | 35 Ko | `marked` |
| **dompurify** | Nettoyer du HTML avant de l'afficher (sécurité) | 21 Ko | `DOMPurify` |
| **chartjs** | Graphiques : courbes, barres, camemberts, radars | 200 Ko | `Chart` |
| **html2canvas** | Transformer une zone de la page en image | 199 Ko | `html2canvas` |
| **jspdf** | Générer des fichiers PDF | 364 Ko | `jspdf` |
| **qrcode** | Générer des QR codes | 20 Ko | `QRCode` |

Ne charge que ce dont la page a besoin. `chartjs`, `html2canvas` et `jspdf` sont lourds : réserve-les aux pages qui les utilisent vraiment.

## Utilisation dans une page

```html
<head>
  <link rel="stylesheet" href="vendor/bootstrap/bootstrap.min.css">
  <link rel="stylesheet" href="style.css"> <!-- ton style perso, après Bootstrap -->
</head>
<body>
  ...

  <script src="vendor/sqlite/sql-wasm-base64.js"></script>
  <script src="vendor/sqlite/sql-wasm.js"></script>
  <script src="vendor/jquery/jquery.min.js"></script>
  <script src="vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="vendor/anime/anime.min.js"></script>
  <script src="script.js"></script> <!-- ton code perso, après les librairies -->
</body>
```

Charge toujours ton propre CSS **après** `bootstrap.min.css` (pour pouvoir surcharger ses styles), et tes propres scripts **après** les librairies (pour pouvoir les utiliser).

## Trois pièges spécifiques au `file://`

Ces trois-là reviennent systématiquement quand la page s'ouvre par double-clic :

| Librairie | Problème | Solution |
| --- | --- | --- |
| **howler** | Les sons ne se chargent pas (XHR bloqué) | `html5: true`, ou sons en base64 |
| **confetti** | Erreur si `useWorker: true` | `useWorker: false` |
| **html2canvas** / **jspdf** | `SecurityError` à l'export si une image locale est présente | Images en base64, ou canvas dessiné en JS |

Chaque documentation détaille ces cas dans sa section dédiée.

## Si un projet vit dans des sous-dossiers (ex : `pages/ma-page/`)

Adapte le chemin relatif : `../../vendor/bootstrap/bootstrap.min.css` au lieu de `vendor/bootstrap/bootstrap.min.css`.

## Mise à jour des librairies

Pour changer de version un jour, remplace simplement le fichier dans le dossier concerné — rien d'autre à toucher, les noms de fichiers restent les mêmes. Pense à mettre à jour le numéro de version dans ce README et en tête de la documentation correspondante.
