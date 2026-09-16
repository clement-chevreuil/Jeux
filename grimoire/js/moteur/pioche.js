/**
 * Gère les 3 tas de cartes d'un combat : la pioche, la main, et la défausse.
 * Quand la pioche est vide, on remélange la défausse dedans (comme un vrai jeu de cartes).
 */

function creerPioche(idsDeck) {
  return {
    pioche: melanger(idsDeck.slice()),
    main: [],
    defausse: []
  };
}

/** Mélange un tableau sans le modifier (copie), méthode Fisher-Yates. */
function melanger(tableau) {
  const t = tableau.slice();
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Pioche `n` cartes vers la main. Remélange la défausse si la pioche manque. */
function piocherCartes(etat, n) {
  for (let i = 0; i < n; i++) {
    if (etat.pioche.length === 0) {
      if (etat.defausse.length === 0) return;
      etat.pioche = melanger(etat.defausse);
      etat.defausse = [];
    }
    etat.main.push(etat.pioche.pop());
  }
}

/** Envoie toute la main à la défausse (fin de tour). */
function defausserMain(etat) {
  etat.defausse = etat.defausse.concat(etat.main);
  etat.main = [];
}
