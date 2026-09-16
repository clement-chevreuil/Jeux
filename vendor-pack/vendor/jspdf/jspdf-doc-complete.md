# Documentation complète jsPDF (hors-ligne)

Version couverte : 2.5.1 — `vendor/jspdf/jspdf.umd.min.js`

```html
<script src="vendor/jspdf/jspdf.umd.min.js"></script>
```

Expose le global `jspdf`, qui contient la classe `jsPDF` :

```js
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
```

C'est le piège d'installation numéro un : le global est `jspdf` (minuscules), la classe est `jsPDF` (avec des majuscules). Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**jsPDF génère des fichiers PDF directement dans le navigateur**, sans serveur ni envoi de données.

Le problème qu'il résout : le PDF est le format universel pour ce qui doit être imprimé, archivé ou envoyé — une facture, une fiche, un rapport, une règle du jeu. Le produire demande normalement un serveur. jsPDF construit le fichier dans la page, sans qu'aucune donnée ne sorte de la machine.

C'est ce qui permet à un logiciel local de produire un document propre, imprimable, à partir de données que l'utilisateur est seul à posséder.

### Quand l'utiliser

- Un document destiné à être imprimé ou archivé
- Une fiche, un récapitulatif, une facture, un certificat
- Un export multi-pages avec une mise en page maîtrisée

### Quand s'en passer

- Le document est seulement destiné à être lu à l'écran → une page HTML est plus souple et plus légère
- Tu veux juste imprimer → `window.print()` avec une feuille de style `@media print` donne souvent un meilleur résultat, pour zéro octet
- Une image suffit → html2canvas + PNG est plus simple

Poids : 364 Ko minifié — le plus lourd du pack. À ne charger que sur la page qui génère le PDF.

---

## 1. Premier document

```js
const { jsPDF } = window.jspdf;

const doc = new jsPDF();
doc.text('Bonjour', 20, 30);        // texte, x, y (en mm depuis le coin haut-gauche)
doc.save('document.pdf');
```

Options du constructeur :

```js
const doc = new jsPDF({
  orientation: 'portrait',   // 'portrait' | 'landscape'
  unit: 'mm',                // 'mm' | 'cm' | 'in' | 'pt' | 'px'
  format: 'a4',              // 'a4' | 'a3' | 'letter' | [largeur, hauteur]
  compress: true
});
```

Repères en millimètres : une page A4 fait **210 × 297 mm**. Une marge de 20 mm laisse une zone utile de 170 mm de large.

---

## 2. Texte

```js
doc.setFont('helvetica', 'normal');   // 'helvetica' | 'times' | 'courier'
                                       // style : 'normal' | 'bold' | 'italic' | 'bolditalic'
doc.setFontSize(12);
doc.setTextColor(40, 40, 40);          // RVB, ou '#282828'

doc.text('Du texte', 20, 30);
doc.text('Centré',   105, 40, { align: 'center' });
doc.text('À droite', 190, 50, { align: 'right' });
doc.text('Incliné',   20, 60, { angle: 45 });
```

⚠️ **Les polices intégrées ne gèrent pas tous les caractères.** Helvetica, Times et Courier couvrent le latin de base et les accents français courants (é, è, à, ç, ù). En revanche : pas d'emoji, pas de caractères cyrilliques ou asiatiques. Pour ceux-là, il faut embarquer une police, ce qui alourdit nettement le fichier.

### Texte long : le découper

`text()` n'effectue **aucun retour à la ligne automatique** : un paragraphe long sortira de la page. Découpe-le :

```js
const lignes = doc.splitTextToSize(paragraphe, 170);   // 170 mm de large
doc.text(lignes, 20, 40);
```

Mesurer avant de placer :

```js
const largeur = doc.getTextWidth('Mon texte');
const hauteurLigne = doc.getFontSize() * 0.3528;       // points → mm
```

---

## 3. Formes et couleurs

```js
doc.setDrawColor(0, 0, 0);       // couleur du trait
doc.setFillColor(240, 192, 64);  // couleur de remplissage
doc.setLineWidth(0.5);

doc.line(20, 30, 190, 30);                  // ligne
doc.rect(20, 40, 170, 20);                   // rectangle (contour)
doc.rect(20, 40, 170, 20, 'F');              // rempli
doc.rect(20, 40, 170, 20, 'FD');             // rempli + contour
doc.roundedRect(20, 70, 80, 30, 3, 3, 'FD'); // coins arrondis
doc.circle(105, 120, 20, 'F');
doc.ellipse(105, 160, 40, 20, 'S');
doc.triangle(20, 200, 60, 200, 40, 170, 'F');
```

Le dernier argument : `'S'` = contour seul (défaut), `'F'` = rempli, `'FD'` = les deux.

---

## 4. Images

```js
doc.addImage(dataUrl, 'PNG', x, y, largeur, hauteur);
```

Depuis un canvas — c'est le cas le plus courant en local :

```js
const canvas = document.getElementById('graphique');
doc.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 40, 170, 100);
```

Depuis une capture html2canvas :

```js
const canvas = await html2canvas(element, { scale: 2 });
doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 0);
```

Une hauteur à `0` conserve les proportions… selon les versions. Plus sûr : calculer soi-même.

```js
const ratio = canvas.height / canvas.width;
const largeur = 190;
doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, largeur, largeur * ratio);
```

> En `file://`, une image chargée depuis un fichier voisin ne peut pas être exportée depuis un canvas (canvas contaminé). Voir la doc html2canvas, section 3.

---

## 5. Pages

```js
doc.addPage();
doc.addPage('a4', 'landscape');

doc.setPage(1);                        // revenir à une page
doc.getNumberOfPages();
doc.deletePage(2);
```

Saut de page automatique :

```js
const HAUTEUR_PAGE = 297, MARGE = 20;
let y = MARGE;

function ligne(texte) {
  if (y > HAUTEUR_PAGE - MARGE) {
    doc.addPage();
    y = MARGE;
  }
  doc.text(texte, MARGE, y);
  y += 7;
}
```

Numéroter toutes les pages **à la fin**, quand on connaît le total :

```js
const total = doc.getNumberOfPages();
for (let i = 1; i <= total; i++) {
  doc.setPage(i);
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`${i} / ${total}`, 105, 290, { align: 'center' });
}
```

---

## 6. Sortie

```js
doc.save('document.pdf');              // télécharge

doc.output('blob');                     // Blob
doc.output('datauristring');            // data URI
doc.output('bloburl');                  // URL affichable dans un iframe
```

Aperçu avant enregistrement :

```js
const url = doc.output('bloburl');
document.getElementById('apercu').src = url;   // dans un <iframe>
```

Métadonnées :

```js
doc.setProperties({
  title: 'Récapitulatif de partie',
  subject: 'Le Grimoire',
  author: 'Le Grimoire',
  creator: 'Le Grimoire'
});
```

---

## 7. Recettes

### Fiche récapitulative

```js
function genererFiche(run) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const M = 20;
  let y = M;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Le Grimoire', M, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('Partie du ' + dayjs(run.date).format('DD/MM/YYYY à HH:mm'), M, y);
  doc.setTextColor(40);
  y += 6;

  doc.setDrawColor(200);
  doc.line(M, y, 190, y);
  y += 10;

  const infos = [
    ['Étage atteint', run.etage],
    ['Ennemis vaincus', run.victoires],
    ['Cartes du deck', run.deck.length],
    ['Résultat', run.gagne ? 'Victoire' : 'Défaite']
  ];

  doc.setFontSize(12);
  for (const [libelle, valeur] of infos) {
    doc.setFont('helvetica', 'bold');
    doc.text(libelle, M, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(valeur), 90, y);
    y += 8;
  }

  doc.save(`grimoire-${dayjs(run.date).format('YYYY-MM-DD')}.pdf`);
}
```

### Tableau simple

```js
function tableau(doc, entetes, lignes, x, y, largeurs) {
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 245);
  doc.rect(x, y - 5, largeurs.reduce((a, b) => a + b), 8, 'F');
  entetes.forEach((e, i) => {
    doc.text(e, x + largeurs.slice(0, i).reduce((a, b) => a + b, 0) + 2, y);
  });
  y += 8;

  doc.setFont('helvetica', 'normal');
  for (const ligne of lignes) {
    ligne.forEach((cellule, i) => {
      doc.text(String(cellule), x + largeurs.slice(0, i).reduce((a, b) => a + b, 0) + 2, y);
    });
    y += 7;
  }
  return y;
}

tableau(doc, ['Carte', 'Coût', 'Type'], donnees, 20, 40, [80, 30, 60]);
```

### Page entière capturée depuis le HTML

```js
async function pageEnPdf(element) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const largeur = 190;
  const hauteur = (canvas.height / canvas.width) * largeur;

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, largeur, hauteur);
  doc.save('page.pdf');
}
```

Attention : cette méthode produit une **image**, donc un texte non sélectionnable et un fichier lourd. Pour un vrai document, construis-le avec `text()`.

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `jsPDF is not defined` | Mauvais nom de global | `const { jsPDF } = window.jspdf;` |
| Le texte sort de la page | Pas de retour à la ligne automatique | `doc.splitTextToSize(texte, largeur)` |
| Caractères manquants ou carrés | Police intégrée limitée | Éviter emoji et alphabets non latins |
| PDF énorme | Pages capturées en image | Construire avec `text()` plutôt qu'avec `addImage` |
| Image déformée | Proportions non respectées | Calculer la hauteur depuis le ratio |
| Numéros de page faux | Écrits avant de connaître le total | Numéroter à la fin avec `setPage` |
| `SecurityError` sur `toDataURL` | Canvas contaminé en `file://` | Voir la doc html2canvas, section 3 |
| Page blanche | Coordonnées hors page | Vérifier que x/y tiennent dans 210 × 297 |
