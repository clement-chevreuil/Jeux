# Documentation complète DOMPurify (hors-ligne)

Version couverte : 3.1.6 — `vendor/dompurify/purify.min.js`

```html
<script src="vendor/dompurify/purify.min.js"></script>
```

Expose le global `DOMPurify`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**DOMPurify nettoie du HTML pour le rendre sûr à afficher.** Il retire tout ce qui peut exécuter du code, et garde la mise en forme.

Le problème qu'il résout : dès que tu écris `element.innerHTML = quelqueChose` avec un contenu que tu n'as pas écrit toi-même, tu ouvres une faille. Un texte apparemment inoffensif comme `<img src=x onerror="alert(1)">` exécute du code dès l'affichage. Le danger n'est pas théorique : il suffit qu'un utilisateur colle du contenu, qu'une note importée contienne du HTML, ou qu'un fichier de sauvegarde ait été modifié.

DOMPurify prend du HTML et renvoie le même HTML débarrassé de tout ce qui peut exécuter du code, en gardant la mise en forme. C'est écrit et audité par des chercheurs en sécurité — ne tente jamais de le remplacer par une expression régulière maison, c'est un problème beaucoup plus subtil qu'il n'en a l'air.

### Quand l'utiliser

- Avant tout `innerHTML` avec du contenu que tu n'as pas écrit
- Systématiquement après `marked.parse()` sur du Markdown utilisateur
- À l'import d'un fichier (sauvegarde, notes, CSV) qui finit affiché en HTML
- Sur du contenu collé depuis le presse-papiers

### Quand s'en passer

- Du texte pur → `textContent` est déjà sûr, et plus rapide
- Du HTML entièrement écrit par toi, en dur dans ton code

Poids : 21 Ko minifié.

> Règle simple : **`textContent` par défaut, `innerHTML` + DOMPurify seulement quand tu as besoin de mise en forme.**

---

## 1. Usage de base

```js
const sale = '<p>Bonjour <b>toi</b><script>alert(1)<\/script></p>';
const propre = DOMPurify.sanitize(sale);
// '<p>Bonjour <b>toi</b></p>'

element.innerHTML = propre;
```

Le `<script>` disparaît, la mise en forme reste. Idem pour les attributs dangereux :

```js
DOMPurify.sanitize('<img src=x onerror="alert(1)">');
// '<img src="x">'      — l'attribut onerror a été retiré

DOMPurify.sanitize('<a href="javascript:alert(1)">clic</a>');
// '<a>clic</a>'        — l'URL dangereuse a été retirée
```

---

## 2. Restreindre les balises autorisées

Par défaut DOMPurify est permissif : il garde tout le HTML de mise en forme. Pour être plus strict, donne une liste blanche :

```js
DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title']
});
```

Ne garder que le texte, en supprimant toute balise :

```js
DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
// '<p>Bonjour <b>toi</b></p>' → 'Bonjour toi'
```

Interdire seulement certaines balises, en gardant le reste :

```js
DOMPurify.sanitize(html, { FORBID_TAGS: ['img', 'video'] });
DOMPurify.sanitize(html, { FORBID_ATTR: ['style'] });
```

---

## 3. Les autres options utiles

```js
DOMPurify.sanitize(html, {
  ALLOWED_TAGS: [...],
  ALLOWED_ATTR: [...],
  FORBID_TAGS: [...],
  FORBID_ATTR: [...],
  ALLOW_DATA_ATTR: true,    // autoriser data-* (défaut true)
  ALLOW_ARIA_ATTR: true,    // autoriser aria-* (défaut true)
  KEEP_CONTENT: true,       // garder le texte des balises retirées (défaut true)
  RETURN_DOM: false,        // true = renvoie un élément DOM au lieu d'une chaîne
  RETURN_DOM_FRAGMENT: false,
  WHOLE_DOCUMENT: false,    // true = traite un document complet avec <html>
  SANITIZE_DOM: true,       // protège contre l'écrasement de propriétés du DOM
  USE_PROFILES: { html: true, svg: false, mathMl: false }
});
```

`KEEP_CONTENT: false` supprime aussi le contenu des balises retirées :

```js
DOMPurify.sanitize('<script>du texte<\/script>', { KEEP_CONTENT: false });  // ''
```

`USE_PROFILES: { html: true }` désactive SVG et MathML — une bonne idée si tu n'en as pas besoin, ça réduit la surface d'attaque.

---

## 4. Savoir ce qui a été retiré

```js
const propre = DOMPurify.sanitize(html);

DOMPurify.removed;   // tableau de tout ce qui a été supprimé
if (DOMPurify.removed.length) {
  console.warn('Contenu retiré :', DOMPurify.removed);
}
```

Pratique pour prévenir l'utilisateur (« certains éléments de votre note n'ont pas pu être affichés ») ou pour du débogage.

---

## 5. Les hooks

Pour agir sur chaque nœud pendant le nettoyage :

```js
// Ouvrir tous les liens externes dans un nouvel onglet, en sécurité
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const propre = DOMPurify.sanitize(html);
```

`rel="noopener noreferrer"` est important avec `target="_blank"` : sans lui, la page ouverte peut manipuler la tienne.

Retirer les hooks :

```js
DOMPurify.removeHook('afterSanitizeAttributes');
DOMPurify.removeAllHooks();
```

Points d'accroche disponibles : `beforeSanitizeElements`, `uponSanitizeElement`, `afterSanitizeElements`, `beforeSanitizeAttributes`, `uponSanitizeAttribute`, `afterSanitizeAttributes`, `beforeSanitizeShadowDOM`, `uponSanitizeShadowNode`, `afterSanitizeShadowDOM`.

---

## 6. Configuration par défaut

Pour ne pas répéter les options à chaque appel :

```js
DOMPurify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href']
});

DOMPurify.sanitize(html);   // utilise cette configuration

DOMPurify.clearConfig();     // revient aux réglages d'origine
```

---

## 7. Recettes

### Markdown utilisateur affiché en sécurité

```js
function afficherMarkdown(element, texteMd) {
  const html = marked.parse(texteMd);
  element.innerHTML = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input']
  });
}
```

### Une fonction unique dans tout le projet

Centralise pour ne jamais oublier :

```js
// securite.js
function html(element, contenuHtml) {
  element.innerHTML = DOMPurify.sanitize(contenuHtml);
}
```

Et interdis-toi `innerHTML` direct ailleurs. Une règle qu'on applique à un seul endroit est une règle qui tient.

### Nettoyer un collage du presse-papiers

```js
zone.addEventListener('paste', (e) => {
  e.preventDefault();
  const colle = e.clipboardData.getData('text/html')
             || e.clipboardData.getData('text/plain');
  const propre = DOMPurify.sanitize(colle, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: []
  });
  document.execCommand('insertHTML', false, propre);
});
```

Sans ça, un collage depuis Word injecte des centaines de balises et de styles inline.

### Vérifier une sauvegarde importée

```js
function importerNotes(json) {
  const notes = JSON.parse(json);
  return notes.map(n => ({
    ...n,
    contenu: DOMPurify.sanitize(n.contenu)
  }));
}
```

Un fichier de sauvegarde peut avoir été édité à la main entre l'export et l'import.

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Du code s'exécute malgré tout | `sanitize()` appelé mais résultat non utilisé | Assigner la **valeur de retour**, pas l'original |
| Mes balises légitimes disparaissent | Liste blanche trop restrictive | Compléter `ALLOWED_TAGS` |
| Les styles inline sautent | `style` filtré dans certains cas | Passer par des classes CSS |
| `target="_blank"` retiré | Pas dans les attributs autorisés | L'ajouter via un hook (section 5) |
| Nettoyage lent sur gros document | Appelé à chaque frappe | Temporiser, ou ne nettoyer qu'à l'enregistrement |
| Du SVG légitime est supprimé | Profil SVG désactivé | `USE_PROFILES: { html: true, svg: true }` |
