# Documentation complète Fuse.js (hors-ligne)

Version couverte : 7.0.0 — `vendor/fuse/fuse.min.js`

```html
<script src="vendor/fuse/fuse.min.js"></script>
```

Expose le global `Fuse`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Fuse.js fait de la recherche floue** : trouver des résultats pertinents même quand la saisie est approximative.

Le problème qu'il résout : une recherche avec `includes()` est binaire — soit la chaîne correspond exactement, soit rien. L'utilisateur qui tape « gobelen » ou « griffe gob » ne trouve pas « Gobelin Griffu ». Il faudrait gérer les fautes de frappe, les mots dans le désordre, les accents, les correspondances partielles, et classer les résultats par pertinence.

Fuse fait tout ça côté client, sans serveur ni index à construire : tu lui donnes un tableau d'objets, il répond à des requêtes.

### Quand l'utiliser

- Une barre de recherche sur une liste de plus de quelques dizaines d'éléments
- Chercher dans plusieurs champs à la fois (nom + description + type)
- Une palette de commandes (à la Ctrl+K)
- Tolérer les fautes de frappe et les accents

### Quand s'en passer

- Moins de 20 éléments → un `filter()` avec `toLowerCase().includes()` suffit
- Une correspondance exacte est requise (un code, une référence) → la recherche floue nuirait

Poids : 24 Ko minifié.

---

## 1. Usage de base

```js
const cartes = [
  { nom: 'Frappe',      type: 'attaque', texte: 'Inflige 6 dégâts.' },
  { nom: 'Défense',     type: 'competence', texte: 'Gagne 5 blocs.' },
  { nom: 'Frappe lourde', type: 'attaque', texte: 'Inflige 14 dégâts.' }
];

const fuse = new Fuse(cartes, { keys: ['nom', 'texte'] });

fuse.search('frap');
// [ { item: { nom: 'Frappe', ... }, refIndex: 0 },
//   { item: { nom: 'Frappe lourde', ... }, refIndex: 2 } ]
```

Chaque résultat contient `item` (l'objet d'origine) et `refIndex` (sa position dans le tableau de départ). Pour récupérer les objets :

```js
const resultats = fuse.search('frap').map(r => r.item);
```

Sur un tableau de chaînes, `keys` est inutile :

```js
const fuse = new Fuse(['Frappe', 'Défense', 'Garde'], {});
fuse.search('def');
```

---

## 2. Les options

```js
const fuse = new Fuse(liste, {
  keys: ['nom', 'texte'],       // champs à fouiller
  threshold: 0.4,               // tolérance : 0 = exact, 1 = tout passe (défaut 0.6)
  distance: 100,                // à quelle distance du début chercher (défaut 100)
  ignoreLocation: false,        // true = la position dans le texte n'importe pas
  minMatchCharLength: 1,        // longueur minimale d'une correspondance
  includeScore: false,          // ajouter le score aux résultats
  includeMatches: false,        // ajouter les positions des correspondances
  findAllMatches: false,
  shouldSort: true,             // trier par pertinence (défaut true)
  isCaseSensitive: false,
  useExtendedSearch: false,     // active la syntaxe avancée (section 5)
  isDiacriticsSensitive: false  // false = « cafe » trouve « café »
});
```

### Les deux réglages qui comptent vraiment

**`threshold`** — la tolérance aux fautes.

- `0.2` : strict, quasiment la correspondance exacte
- `0.4` : bon compromis, tolère une faute de frappe
- `0.6` (défaut) : souvent trop permissif, ramène du bruit
- `0.8+` : tout ressort, inutilisable

**`ignoreLocation: true`** — par défaut, Fuse privilégie fortement les correspondances en **début** de texte, et `distance` limite la portée. Pour chercher dans des descriptions longues, un mot en fin de phrase ne sera jamais trouvé. Mets `ignoreLocation: true` dès que tu fouilles autre chose que des titres courts.

Configuration de départ recommandée :

```js
const fuse = new Fuse(liste, {
  keys: ['nom', 'texte'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2
});
```

---

## 3. Pondérer les champs

Un mot trouvé dans le nom doit compter plus que dans la description :

```js
keys: [
  { name: 'nom',   weight: 3 },
  { name: 'type',  weight: 2 },
  { name: 'texte', weight: 1 }
]
```

Champs imbriqués, avec la notation pointée :

```js
keys: ['auteur.nom', 'meta.tags']
```

Champ calculé, si la donnée n'est pas directement dans l'objet :

```js
keys: [{
  name: 'recherche',
  getFn: (carte) => `${carte.nom} ${carte.type} ${carte.cout} énergie`
}]
```

---

## 4. Score et surlignage

```js
const fuse = new Fuse(cartes, {
  keys: ['nom'],
  includeScore: true,
  includeMatches: true
});

const res = fuse.search('frap');
res[0].score;     // 0 = parfait, 1 = mauvais
res[0].matches;   // [ { key: 'nom', value: 'Frappe', indices: [[0,3]] } ]
```

Filtrer sur le score :

```js
const bons = fuse.search(q).filter(r => r.score < 0.4).map(r => r.item);
```

Surligner les correspondances :

```js
function surligner(texte, indices) {
  let out = '', pos = 0;
  for (const [debut, fin] of indices) {
    out += texte.slice(pos, debut) + '<mark>' + texte.slice(debut, fin + 1) + '</mark>';
    pos = fin + 1;
  }
  return out + texte.slice(pos);
}

const r = fuse.search('frap')[0];
const m = r.matches[0];
element.innerHTML = surligner(m.value, m.indices);
```

Les `indices` sont **inclusifs** des deux côtés, d'où le `fin + 1`.

---

## 5. Recherche étendue

Avec `useExtendedSearch: true`, la requête accepte des opérateurs :

```js
const fuse = new Fuse(liste, { keys: ['nom'], useExtendedSearch: true });

fuse.search("'frappe");      // ' = contient exactement
fuse.search('^frappe');       // ^ = commence par
fuse.search('frappe$');       // $ = finit par
fuse.search('!frappe');       // ! = ne contient pas
fuse.search('frappe | garde');// | = ou
fuse.search("'attaque 'rare");// espace = et
```

Utile pour une recherche avancée ; inutile pour une barre de recherche grand public.

---

## 6. Modifier la collection

```js
fuse.add(nouvelObjet);
fuse.remove((item) => item.id === 42);
fuse.removeAt(3);
fuse.getIndex().size();

fuse.setCollection(nouvelleListe);     // remplace tout
```

Si la liste change souvent et complètement, recréer l'instance est aussi simple :

```js
fuse = new Fuse(nouvelleListe, options);
```

---

## 7. Recettes

### Barre de recherche

```js
const fuse = new Fuse(cartes, {
  keys: [{ name: 'nom', weight: 3 }, { name: 'texte', weight: 1 }],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2
});

champ.addEventListener('input', () => {
  const q = champ.value.trim();
  const resultats = q ? fuse.search(q).map(r => r.item) : cartes;
  afficher(resultats);
});
```

Le `q ? ... : cartes` est important : une recherche vide renvoie un tableau vide, alors qu'on veut afficher toute la liste.

### Limiter le nombre de résultats

```js
fuse.search(q, { limit: 10 });
```

### Palette de commandes (Ctrl+K)

```js
const commandes = [
  { nom: 'Nouvelle partie', action: nouvellePartie, raccourci: 'N' },
  { nom: 'Sauvegarder',     action: sauvegarder,    raccourci: 'Ctrl+S' },
  { nom: 'Voir les statistiques', action: ouvrirStats }
];

const fusePalette = new Fuse(commandes, {
  keys: ['nom'],
  threshold: 0.4,
  ignoreLocation: true
});

Mousetrap.bind('mod+k', () => { ouvrirPalette(); return false; });

champPalette.addEventListener('input', () => {
  const res = fusePalette.search(champPalette.value, { limit: 8 });
  afficherCommandes(res.map(r => r.item));
});
```

### Recherche insensible aux accents

C'est le comportement par défaut (`isDiacriticsSensitive: false`) : « defense » trouve « Défense ». Utile en français, où les utilisateurs tapent rarement les accents.

### Grosse liste : ne pas reconstruire l'index

```js
// ✅ créé une seule fois
const fuse = new Fuse(grandeListe, options);

// ❌ à ne pas faire dans un handler d'input
champ.addEventListener('input', () => {
  const fuse = new Fuse(grandeListe, options);   // reconstruit l'index à chaque frappe
});
```

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Liste vide quand le champ est vide | `search('')` ne renvoie rien | Afficher la liste complète si la requête est vide |
| Trop de résultats sans rapport | `threshold` par défaut (0.6) | Descendre à `0.3`–`0.4` |
| Un mot en fin de description n'est pas trouvé | Fuse privilégie le début | `ignoreLocation: true` |
| Rien n'est trouvé dans les objets | `keys` non renseigné | Indiquer les champs à fouiller |
| Ça rame en tapant | Index reconstruit à chaque frappe | Créer l'instance une seule fois |
| `indices` décalés au surlignage | Bornes inclusives | Utiliser `fin + 1` dans `slice` |
