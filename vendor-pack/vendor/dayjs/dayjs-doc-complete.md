# Documentation complète Day.js (hors-ligne)

Version couverte : 1.11.13 — `vendor/dayjs/dayjs.min.js`

```html
<script src="vendor/dayjs/dayjs.min.js"></script>
```

Expose le global `dayjs`. Aucune dépendance, fonctionne en `file://`.

---

## À quoi ça sert

**Day.js manipule et affiche des dates.** Formater, ajouter des jours, comparer, calculer une durée.

Le problème qu'il résout : l'objet `Date` natif de JavaScript est notoirement pénible. Les mois commencent à 0, il n'y a aucune fonction de formatage lisible (`toLocaleDateString` dépend de la machine), ajouter « 3 jours » demande de passer par des millisecondes, et comparer deux dates au jour près oblige à remettre les heures à zéro à la main. Day.js règle tout ça avec une API courte et chaînable, en 2 Ko.

C'est le remplaçant moderne de Moment.js (qui pesait 70 Ko et n'est plus maintenu), avec quasiment la même syntaxe.

### Quand l'utiliser

- Afficher une date proprement (`12/03/2026` ou `12 mars 2026`)
- Calculer une durée, une ancienneté, un temps restant
- Comparer des dates, grouper par jour / semaine / mois
- Horodater des sauvegardes, des runs, des entrées d'historique

### Quand s'en passer

- Un simple horodatage jamais affiché → `Date.now()` suffit
- Un seul affichage de date dans tout le projet → `toLocaleDateString('fr-FR')` fait le travail

Poids : 7 Ko minifié.

> Note : Day.js est **immuable**. Toutes les méthodes renvoient un nouvel objet, l'original n'est jamais modifié. C'est ce qui évite les bugs classiques de `Date`.

---

## 1. Créer une date

```js
dayjs();                          // maintenant
dayjs('2026-03-12');              // depuis une chaîne ISO
dayjs('2026-03-12 14:30');
dayjs(1700000000000);             // depuis un timestamp en ms
dayjs(new Date());                // depuis un objet Date natif
dayjs(autreDayjs);                // copie
```

Le format ISO (`AAAA-MM-JJ`) est le seul garanti partout. Pour parser un format français (`12/03/2026`), il faut le plugin `customParseFormat`, non inclus ici — le plus simple est de découper à la main :

```js
const [j, m, a] = '12/03/2026'.split('/');
const d = dayjs(`${a}-${m}-${j}`);
```

Vérifier qu'une date est valide :

```js
dayjs('n/importe quoi').isValid();   // false
```

---

## 2. Afficher (`format`)

```js
dayjs().format();                          // '2026-03-12T14:30:00+01:00' (ISO)
dayjs().format('DD/MM/YYYY');              // '12/03/2026'
dayjs().format('DD/MM/YYYY HH:mm');        // '12/03/2026 14:30'
dayjs().format('YYYY-MM-DD');              // '2026-03-12'
dayjs().format('HH:mm:ss');                // '14:30:00'
```

Jetons de formatage principaux :

| Jeton | Sortie | Description |
| --- | --- | --- |
| `YY` / `YYYY` | 26 / 2026 | Année |
| `M` / `MM` | 3 / 03 | Mois |
| `MMM` / `MMMM` | Mar / March | Nom du mois (anglais par défaut) |
| `D` / `DD` | 5 / 05 | Jour du mois |
| `d` / `ddd` / `dddd` | 0 / Sun / Sunday | Jour de la semaine |
| `H` / `HH` | 8 / 08 | Heure (24 h) |
| `h` / `hh` | 8 / 08 | Heure (12 h) |
| `m` / `mm` | 5 / 05 | Minutes |
| `s` / `ss` | 9 / 09 | Secondes |
| `SSS` | 001 | Millisecondes |
| `A` / `a` | AM / am | Méridien |

Pour insérer du texte littéral, mets-le entre crochets :

```js
dayjs().format('[Étage] DD/MM');     // 'Étage 12/03'
```

Les noms de mois et de jours sont en anglais par défaut (les locales sont des fichiers séparés, non inclus). Pour du français sans plugin :

```js
const MOIS = ['janvier','février','mars','avril','mai','juin',
              'juillet','août','septembre','octobre','novembre','décembre'];
const d = dayjs();
`${d.date()} ${MOIS[d.month()]} ${d.year()}`;   // '12 mars 2026'
```

---

## 3. Lire les composantes

```js
const d = dayjs();

d.year();          // 2026
d.month();         // 2  ⚠️ 0 = janvier, 11 = décembre
d.date();          // 12 (jour du mois)
d.day();           // 4  (jour de la semaine, 0 = dimanche)
d.hour();
d.minute();
d.second();
d.millisecond();

d.daysInMonth();   // 31
d.valueOf();       // timestamp en ms
d.unix();          // timestamp en secondes
d.toDate();        // objet Date natif
d.toISOString();
d.toJSON();
```

Attention au piège classique : `month()` est **0-indexé** (comme `Date`), mais `date()` ne l'est pas.

---

## 4. Modifier

Toutes ces méthodes renvoient une **nouvelle** date :

```js
dayjs().add(3, 'day');
dayjs().add(2, 'week');
dayjs().subtract(1, 'month');
dayjs().subtract(30, 'minute');

dayjs().set('hour', 0);
dayjs().year(2027);          // getter sans argument, setter avec
```

Unités acceptées : `millisecond`, `second`, `minute`, `hour`, `day`, `week`, `month`, `quarter`, `year` (et leurs abréviations `ms`, `s`, `m`, `h`, `d`, `w`, `M`, `Q`, `y` — attention, `M` majuscule = mois, `m` minuscule = minutes).

### Début et fin de période

```js
dayjs().startOf('day');      // aujourd'hui à 00:00:00.000
dayjs().endOf('day');        // aujourd'hui à 23:59:59.999
dayjs().startOf('month');
dayjs().startOf('week');
dayjs().endOf('year');
```

`startOf('day')` est l'outil pour comparer deux dates **au jour près**, en ignorant l'heure.

---

## 5. Comparer

```js
dayjs('2026-01-01').isBefore(dayjs());
dayjs().isAfter('2026-01-01');
dayjs().isSame('2026-03-12', 'day');    // même jour (ignore l'heure)
dayjs().isSame(autre, 'month');          // même mois
```

Sans le 2e argument, `isSame` compare à la milliseconde près — donc presque toujours `false`. Précise toujours l'unité.

Encadrement :

```js
const d = dayjs('2026-03-12');
d.isAfter(debut) && d.isBefore(fin);
```

---

## 6. Différences (`diff`)

```js
const a = dayjs('2026-03-12');
const b = dayjs('2026-01-01');

a.diff(b);             // différence en millisecondes
a.diff(b, 'day');      // 70
a.diff(b, 'month');    // 2  (tronqué)
a.diff(b, 'month', true);  // 2.35 (avec décimales)
```

L'ordre compte : `a.diff(b)` est positif si `a` est après `b`.

Durée écoulée lisible :

```js
function depuis(date) {
  const min = dayjs().diff(date, 'minute');
  if (min < 1)    return "à l'instant";
  if (min < 60)   return `il y a ${min} min`;
  const h = dayjs().diff(date, 'hour');
  if (h < 24)     return `il y a ${h} h`;
  const j = dayjs().diff(date, 'day');
  if (j < 31)     return `il y a ${j} j`;
  return dayjs(date).format('DD/MM/YYYY');
}
```

---

## 7. Recettes

### Horodater une sauvegarde

```js
const sauvegarde = {
  date: dayjs().toISOString(),     // stocker en ISO : trié et parsable partout
  donnees: { ... }
};

// à l'affichage
dayjs(sauvegarde.date).format('DD/MM/YYYY à HH:mm');
```

Stocke toujours en ISO ou en timestamp, **jamais** en format affiché — sinon tu ne pourras plus trier ni comparer.

### Chronomètre d'une partie

```js
const debut = dayjs();

function dureePartie() {
  const s = dayjs().diff(debut, 'second');
  const min = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${min}:${sec}`;
}
```

### Grouper un historique par jour

```js
const parJour = {};
for (const run of runs) {
  const cle = dayjs(run.date).format('YYYY-MM-DD');
  (parJour[cle] ||= []).push(run);
}
```

### Nom de fichier horodaté pour un export

```js
const nom = `grimoire-${dayjs().format('YYYY-MM-DD-HHmmss')}.db`;
```

Le format `YYYY-MM-DD` en premier garantit que les fichiers se trient chronologiquement dans l'explorateur.

### Savoir si c'est aujourd'hui

```js
dayjs(date).isSame(dayjs(), 'day');
```

---

## 8. Pièges courants

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `month()` renvoie 2 pour mars | 0-indexé, comme `Date` natif | Ajouter 1 pour l'affichage |
| `isSame()` toujours faux | Compare à la milliseconde | Préciser l'unité : `isSame(x, 'day')` |
| `add(1, 'm')` ajoute des minutes, pas un mois | `m` = minute, `M` = mois | Écrire `'month'` en toutes lettres |
| La date n'est pas modifiée | Day.js est immuable | Réaffecter : `d = d.add(1, 'day')` |
| Noms de mois en anglais | Les locales sont des fichiers séparés | Table de correspondance manuelle (section 2) |
| Date invalide après parsing | Format non ISO | Convertir en `AAAA-MM-JJ` avant |
