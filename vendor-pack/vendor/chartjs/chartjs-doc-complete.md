# Documentation complète Chart.js (hors-ligne)

Version couverte : 4.4.3 — `vendor/chartjs/chart.umd.min.js`

```html
<script src="vendor/chartjs/chart.umd.min.js"></script>
```

Expose le global `Chart`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Chart.js dessine des graphiques dans un canvas** : courbes, barres, camemberts, radars.

Le problème qu'il résout : afficher des chiffres dans un tableau, c'est facile ; les rendre compréhensibles d'un coup d'œil, non. Dessiner un graphique à la main dans un canvas demande de calculer les échelles, placer les axes, graduer, gérer le survol, redimensionner avec la fenêtre — plusieurs centaines de lignes pour un résultat médiocre. Chart.js fait tout ça, avec animations et infobulles, à partir d'un simple tableau de valeurs.

### Quand l'utiliser

- Écran de statistiques (progression, historique de parties, scores)
- Tableau de bord d'une application locale
- Visualiser des données importées d'un CSV
- Comparer des valeurs entre catégories

### Quand s'en passer

- Une seule barre de progression → une `<div>` et du CSS suffisent (c'est ce que fait déjà `composant-barre.js` dans Grimoire)
- Trois valeurs à comparer → un tableau HTML est plus lisible qu'un graphique
- Une jauge simple → CSS, ou un petit canvas maison

Poids : 200 Ko minifié — de loin le plus lourd du pack. À ne charger que sur les pages qui en ont besoin.

---

## 1. Premier graphique

```html
<canvas id="mon-graphique"></canvas>
```

```js
const ctx = document.getElementById('mon-graphique');

const graphique = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Étage 1', 'Étage 2', 'Étage 3'],
    datasets: [{
      label: 'Dégâts infligés',
      data: [120, 190, 300]
    }]
  }
});
```

Trois choses à fournir : le **type**, les **labels** (l'axe horizontal), et les **datasets** (les séries de valeurs).

---

## 2. Les types

```js
type: 'line'        // courbe — évolution dans le temps
type: 'bar'         // barres — comparaison entre catégories
type: 'pie'         // camembert — répartition d'un total
type: 'doughnut'    // anneau — idem, avec un trou au centre
type: 'radar'       // toile d'araignée — profil multi-critères
type: 'polarArea'   // secteurs de longueurs variables
type: 'scatter'     // nuage de points — corrélation
type: 'bubble'      // nuage avec une 3e dimension (taille)
```

Repères de choix : **line** pour une évolution, **bar** pour comparer, **doughnut** pour une répartition (max 5-6 parts), **radar** pour comparer des profils sur plusieurs axes (idéal pour les stats d'un personnage).

Barres horizontales : `type: 'bar'` + `options: { indexAxis: 'y' }`.

---

## 3. Les datasets

```js
datasets: [{
  label: 'Dégâts',                    // nom affiché dans la légende et l'infobulle
  data: [120, 190, 300],
  backgroundColor: '#4a86d0',         // ou un tableau, une couleur par barre
  borderColor: '#2b5596',
  borderWidth: 2,
  borderRadius: 4,                     // coins arrondis (barres)

  // courbes
  tension: 0.3,                        // 0 = angles droits, 0.4 = bien arrondi
  fill: true,                          // remplir sous la courbe
  pointRadius: 4,
  pointHoverRadius: 7,

  // camemberts
  hoverOffset: 8,                       // la part se détache au survol

  yAxisID: 'y'                          // pour plusieurs axes Y
}]
```

Plusieurs séries sur le même graphique :

```js
datasets: [
  { label: 'Dégâts infligés', data: [120, 190, 300], backgroundColor: '#4a86d0' },
  { label: 'Dégâts subis',    data: [80, 140, 260],  backgroundColor: '#d0402f' }
]
```

Une couleur par part (camembert) :

```js
backgroundColor: ['#4a86d0', '#f0c040', '#d0402f', '#7a9a5a']
```

---

## 4. Les options

```js
options: {
  responsive: true,               // s'adapte à la taille du conteneur (défaut true)
  maintainAspectRatio: true,      // false = remplit la hauteur du conteneur
  aspectRatio: 2,                  // largeur / hauteur

  plugins: {
    legend: {
      display: true,
      position: 'top',             // 'top' | 'bottom' | 'left' | 'right'
      labels: { color: '#e8e4f0', font: { size: 13 } }
    },
    title: {
      display: true,
      text: 'Progression des runs',
      color: '#e8e4f0',
      font: { size: 16 }
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label} : ${ctx.parsed.y} pts`
      }
    }
  },

  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 100,
      ticks: { color: '#9a94a8', stepSize: 10 },
      grid:  { color: 'rgba(255,255,255,.08)' },
      title: { display: true, text: 'Points de vie' }
    },
    x: {
      ticks: { color: '#9a94a8' },
      grid:  { display: false }
    }
  },

  animation: {
    duration: 700,
    easing: 'easeOutQuart'
  }
}
```

`beginAtZero: true` est important : sans lui, Chart.js cadre l'axe sur les valeurs, ce qui exagère visuellement les écarts.

---

## 5. Thème sombre

Chart.js utilise du gris foncé par défaut, illisible sur un fond sombre. Définis les couleurs globalement une fois pour toutes :

```js
Chart.defaults.color = '#c8c2d8';                         // textes
Chart.defaults.borderColor = 'rgba(255,255,255,.08)';      // grilles
Chart.defaults.font.family = 'inherit';                     // reprend la police de la page
```

Toutes les instances créées ensuite en héritent.

---

## 6. Mettre à jour un graphique

```js
graphique.data.labels.push('Étage 4');
graphique.data.datasets[0].data.push(410);
graphique.update();

graphique.update('none');     // sans animation
```

Remplacer toutes les données :

```js
graphique.data.datasets[0].data = nouvellesValeurs;
graphique.update();
```

Détruire avant de recréer :

```js
if (graphique) graphique.destroy();
graphique = new Chart(ctx, config);
```

**C'est le piège numéro un de Chart.js** : recréer un graphique sur un canvas déjà utilisé sans avoir appelé `destroy()` laisse l'ancienne instance vivante. Symptôme typique : l'infobulle affiche les données de l'ancien graphique, ou le graphique clignote au survol.

---

## 7. Dimensionner correctement

Ne mets **pas** de `width`/`height` sur le `<canvas>` : Chart.js les gère. Contrôle la taille par le conteneur :

```html
<div style="position: relative; height: 300px;">
  <canvas id="g"></canvas>
</div>
```

```js
options: { responsive: true, maintainAspectRatio: false }
```

Sans le conteneur en `position: relative` avec une hauteur fixe, un graphique en `maintainAspectRatio: false` grandit indéfiniment à chaque redimensionnement.

---

## 8. Exporter en image

```js
const url = graphique.toBase64Image();       // PNG en data URI

const lien = document.createElement('a');
lien.href = url;
lien.download = 'statistiques.png';
lien.click();
```

Fonctionne en `file://` : tout se passe dans le canvas, sans requête réseau.

---

## 9. Recettes

### Progression des runs (courbe)

```js
new Chart(ctx, {
  type: 'line',
  data: {
    labels: runs.map((r, i) => `Run ${i + 1}`),
    datasets: [{
      label: 'Étage atteint',
      data: runs.map(r => r.etage),
      borderColor: '#f0c040',
      backgroundColor: 'rgba(240,192,64,.15)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  }
});
```

### Répartition du deck par type (anneau)

```js
const parType = {};
for (const carte of deck) parType[carte.type] = (parType[carte.type] || 0) + 1;

new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: Object.keys(parType),
    datasets: [{
      data: Object.values(parType),
      backgroundColor: ['#d0402f', '#4a86d0', '#f0c040', '#7a9a5a'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  },
  options: { plugins: { legend: { position: 'bottom' } } }
});
```

### Profil d'un personnage (radar)

```js
new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Force', 'Défense', 'Vitesse', 'Magie', 'Chance'],
    datasets: [{
      label: 'Chevalier',
      data: [8, 9, 4, 2, 5],
      backgroundColor: 'rgba(74,134,208,.25)',
      borderColor: '#4a86d0',
      pointBackgroundColor: '#4a86d0'
    }]
  },
  options: { scales: { r: { beginAtZero: true, max: 10 } } }
});
```

### Infobulle personnalisée

```js
plugins: {
  tooltip: {
    callbacks: {
      title: (items) => 'Étage ' + items[0].label,
      label: (ctx)   => `${ctx.parsed.y} dégâts`,
      footer: (items) => {
        const total = items.reduce((s, i) => s + i.parsed.y, 0);
        return 'Total : ' + total;
      }
    }
  }
}
```

---

## 10. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Le graphique clignote au survol | Ancienne instance non détruite | `graphique.destroy()` avant de recréer |
| Le canvas grandit à l'infini | `maintainAspectRatio: false` sans conteneur fixe | Conteneur `position: relative` + hauteur |
| Textes invisibles sur fond sombre | Couleurs par défaut sombres | `Chart.defaults.color` (section 5) |
| Les écarts semblent énormes | L'axe ne part pas de zéro | `beginAtZero: true` |
| Graphique flou | `width`/`height` mis sur le canvas | Les retirer, dimensionner le conteneur |
| Rien ne s'affiche | Canvas de taille nulle (parent masqué) | Créer le graphique après l'affichage du conteneur |
| Page lente à charger | 200 Ko chargés partout | Ne charger le script que sur la page de stats |
