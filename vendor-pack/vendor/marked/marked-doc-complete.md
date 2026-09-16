# Documentation complète marked (hors-ligne)

Version couverte : 12.0.2 — `vendor/marked/marked.min.js`

```html
<script src="vendor/marked/marked.min.js"></script>
```

Expose le global `marked`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**marked convertit du Markdown en HTML.** Tu lui donnes du texte balisé, il rend des balises prêtes à afficher.

Le problème qu'il résout : le Markdown est le format idéal pour écrire du texte structuré à la main — titres, listes, gras, liens, code — sans balises. Mais un navigateur ne sait pas l'afficher. marked fait la traduction, en une ligne.

Concrètement, ça permet d'écrire le contenu d'un logiciel dans des fichiers `.md` lisibles et versionnables (une aide, des règles, un journal de version, des notes) plutôt que dans du HTML noyé de balises.

### Quand l'utiliser

- Afficher une aide ou des règles écrites en Markdown
- Un éditeur de notes avec aperçu en direct
- Un journal des modifications affiché dans l'application
- Tout contenu long que tu préfères écrire en texte plutôt qu'en HTML

### Quand s'en passer

- Trois lignes de texte fixe → écris-les en HTML, c'est plus direct
- Du texte sans aucune mise en forme → `textContent` suffit

Poids : 35 Ko minifié.

> ⚠️ **Sécurité** — marked ne nettoie rien. Si le Markdown vient de l'utilisateur ou d'une source extérieure, il peut contenir du HTML et du JavaScript qui s'exécuteront. Passe systématiquement le résultat dans DOMPurify (section 6).

---

## 1. Usage de base

```js
const html = marked.parse('# Titre\n\nUn paragraphe avec du **gras**.');
document.getElementById('contenu').innerHTML = html;
// <h1>Titre</h1><p>Un paragraphe avec du <strong>gras</strong>.</p>
```

Pour un fragment sans balise de paragraphe autour :

```js
marked.parseInline('du **gras** et du `code`');
// 'du <strong>gras</strong> et du <code>code</code>'
```

---

## 2. Options

```js
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown : tableaux, ~~barré~~, listes de tâches (défaut true)
  breaks: false,    // true = un simple retour à la ligne devient <br> (défaut false)
  pedantic: false,  // conformité stricte au Markdown original (défaut false)
  silent: false     // true = ne pas lever d'exception en cas d'erreur de parsing
});
```

`breaks: true` est presque toujours ce que tu veux pour du texte saisi par un humain : sans lui, il faut deux espaces en fin de ligne ou une ligne vide pour obtenir un retour à la ligne, ce qui surprend tout le monde.

Options ponctuelles, sans changer la configuration globale :

```js
marked.parse(texte, { breaks: true });
```

---

## 3. Ce que marked comprend

```markdown
# Titre 1
## Titre 2

**gras**, *italique*, ~~barré~~, `code`

- liste à puces
- deuxième élément
  - imbriquée

1. liste numérotée
2. deuxième

> citation

[lien](https://exemple.fr)
![image](chemin/img.png)

| Colonne A | Colonne B |
| --- | --- |
| valeur 1 | valeur 2 |

- [ ] tâche à faire
- [x] tâche faite

---

​```js
const code = 'bloc de code';
​```
```

---

## 4. Personnaliser le rendu

Pour changer la façon dont un élément est généré :

```js
const renderer = new marked.Renderer();

renderer.link = ({ href, text }) =>
  `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

renderer.heading = ({ text, depth }) => {
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

marked.use({ renderer });
```

Ajouter des classes CSS (par exemple celles de Bootstrap) :

```js
marked.use({
  renderer: {
    table(header, body) {
      return `<table class="table table-striped"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    },
    blockquote(quote) {
      return `<blockquote class="blockquote border-start ps-3">${quote}</blockquote>`;
    }
  }
});
```

`marked.use()` s'applique globalement et se cumule d'un appel à l'autre.

---

## 5. Charger un fichier `.md` — la contrainte `file://`

`fetch('aide.md')` **est bloqué** quand la page est ouverte par double-clic. Trois options :

### Option A — le Markdown dans un `.js` (recommandé)

```js
// contenu/aide.js
const AIDE_MD = `
# Comment jouer

Chaque tour, tu pioches **5 cartes**.

- Clique une carte pour la jouer
- Le bloc retombe à zéro au tour suivant
`;
```

```html
<script src="contenu/aide.js"></script>
<script>
  document.getElementById('aide').innerHTML = marked.parse(AIDE_MD);
</script>
```

Les gabarits (backticks) conservent les retours à la ligne. Attention : si ton Markdown contient des blocs de code (donc des backticks), échappe-les avec `\``.

### Option B — dans une balise `<script>` typée

```html
<script id="aide-md" type="text/markdown">
# Comment jouer

Chaque tour, tu pioches **5 cartes**.
</script>

<script>
  const md = document.getElementById('aide-md').textContent;
  document.getElementById('aide').innerHTML = marked.parse(md);
</script>
```

Le navigateur n'exécute pas un `<script>` dont le `type` est inconnu : il sert juste de conteneur de texte. Avantage : le Markdown reste lisible dans le HTML, sans échappement de backticks.

### Option C — fichier choisi par l'utilisateur

```js
input.addEventListener('change', async (e) => {
  const texte = await e.target.files[0].text();
  apercu.innerHTML = marked.parse(texte);
});
```

Là, pas de blocage : c'est l'utilisateur qui donne le fichier explicitement.

---

## 6. Nettoyer le résultat avec DOMPurify

Dès que le Markdown ne vient pas de toi, c'est obligatoire :

```html
<script src="vendor/marked/marked.min.js"></script>
<script src="vendor/dompurify/purify.min.js"></script>
```

```js
const brut = marked.parse(texteUtilisateur);
element.innerHTML = DOMPurify.sanitize(brut);
```

Sans ça, un utilisateur peut écrire `<img src=x onerror="...">` dans sa note et exécuter du code dans ta page. Voir `vendor/dompurify/dompurify-doc-complete.md`.

---

## 7. Recettes

### Éditeur avec aperçu en direct

```html
<textarea id="editeur"></textarea>
<div id="apercu"></div>
```

```js
const editeur = document.getElementById('editeur');
const apercu  = document.getElementById('apercu');

marked.setOptions({ breaks: true });

function rafraichir() {
  apercu.innerHTML = DOMPurify.sanitize(marked.parse(editeur.value));
}

editeur.addEventListener('input', rafraichir);
rafraichir();
```

Sur un gros document, évite de re-parser à chaque frappe :

```js
let minuteur;
editeur.addEventListener('input', () => {
  clearTimeout(minuteur);
  minuteur = setTimeout(rafraichir, 150);
});
```

### Sommaire automatique

```js
const html = marked.parse(texte);
const conteneur = document.createElement('div');
conteneur.innerHTML = html;

const sommaire = [...conteneur.querySelectorAll('h2, h3')].map(h => {
  const id = h.textContent.toLowerCase().replace(/[^\w]+/g, '-');
  h.id = id;
  return `<li class="niveau-${h.tagName}"><a href="#${id}">${h.textContent}</a></li>`;
}).join('');

document.getElementById('sommaire').innerHTML = `<ul>${sommaire}</ul>`;
document.getElementById('contenu').innerHTML = conteneur.innerHTML;
```

### Journal de version affiché dans le jeu

```js
const CHANGELOG_MD = `
## 1.2.0
- Nouveau sprite du chevalier
- Correction de la barre de vie

## 1.1.0
- Ajout du feu de camp
`;

document.getElementById('journal').innerHTML = marked.parse(CHANGELOG_MD);
```

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Les retours à la ligne sont ignorés | Comportement standard du Markdown | `breaks: true` |
| `fetch('aide.md')` échoue | Bloqué en `file://` | Embarquer le texte (section 5) |
| Du HTML de l'utilisateur s'exécute | marked ne nettoie rien | DOMPurify (section 6) |
| Backticks cassés dans un gabarit JS | Conflit avec la syntaxe JS | Les échapper `\`` ou utiliser l'option B |
| Le rendu ignore mes classes CSS | Renderer non appliqué | `marked.use({ renderer })` avant le parse |
| Aperçu qui rame en tapant | Re-parse à chaque frappe | Temporiser avec `setTimeout` |
