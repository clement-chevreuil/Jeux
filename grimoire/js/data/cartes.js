/**
 * Catalogue des cartes du jeu. Chaque carte a un coût en énergie et une liste
 * d'effets. Le moteur de combat (moteur/combat.js) sait lire ces effets un par un,
 * il n'y a pas de logique cachée ici — juste des données.
 *
 * Types d'effets possibles :
 *   degats(valeur)        dégâts sur l'ennemi ciblé, augmentés par la Force
 *   degats_zone(valeur)   dégâts sur tous les ennemis
 *   degats_multi(valeur, fois)  plusieurs petits coups sur l'ennemi ciblé
 *   bloc(valeur)          bouclier gagné, augmenté par la Dextérité
 *   poison(valeur)        stacks de poison posés sur l'ennemi ciblé
 *   faible(valeur)        l'ennemi ciblé inflige 25% de dégâts en moins
 *   vulnerable(valeur)    l'ennemi ciblé reçoit 50% de dégâts en plus
 *   force(valeur)         +dégâts permanent pour le reste du combat
 *   dexterite(valeur)     +bloc permanent pour le reste du combat
 *   pioche(valeur)        cartes piochées immédiatement
 *   energie(valeur)       énergie gagnée immédiatement
 *   soin(valeur)          PV rendus au joueur
 *   pv_perdus(valeur)     PV perdus par le joueur (prix à payer d'une carte forte)
 *   pouvoir(cle)          active un pouvoir permanent (voir combat.js)
 */

const DECK_DEPART = ['frappe', 'frappe', 'frappe', 'frappe', 'garde', 'garde', 'garde', 'garde', 'eclat_astral', 'eclat_astral'];

const CARTES = {

  // --------------------------- deck de départ ---------------------------

  frappe: {
    nom: 'Frappe', type: 'attaque', cout: 1, rarete: 'depart',
    description: 'Inflige 6 dégâts.',
    effets: [{ type: 'degats', valeur: 6 }]
  },
  garde: {
    nom: 'Garde', type: 'competence', cout: 1, rarete: 'depart',
    description: 'Gagne 5 bloc.',
    effets: [{ type: 'bloc', valeur: 5 }]
  },
  eclat_astral: {
    nom: 'Éclat Astral', type: 'attaque', cout: 2, rarete: 'depart',
    description: 'Inflige 10 dégâts.',
    effets: [{ type: 'degats', valeur: 10 }]
  },

  // ------------------------------ attaques -------------------------------

  frappe_lourde: {
    nom: 'Frappe Lourde', type: 'attaque', cout: 2, rarete: 'commun',
    description: 'Inflige 14 dégâts.',
    effets: [{ type: 'degats', valeur: 14 }]
  },
  lame_gemellee: {
    nom: 'Lame Gémellée', type: 'attaque', cout: 1, rarete: 'commun',
    description: 'Frappe 2 fois, 4 dégâts chaque fois.',
    effets: [{ type: 'degats_multi', valeur: 4, fois: 2 }]
  },
  rafale_arcanique: {
    nom: 'Rafale Arcanique', type: 'attaque', cout: 1, rarete: 'commun',
    description: 'Inflige 5 dégâts. Pioche 1 carte.',
    effets: [{ type: 'degats', valeur: 5 }, { type: 'pioche', valeur: 1 }]
  },
  coup_de_grace: {
    nom: 'Coup de Grâce', type: 'attaque', cout: 2, rarete: 'commun',
    description: 'Inflige 8 dégâts. Rend la cible vulnérable (2 tours).',
    effets: [{ type: 'degats', valeur: 8 }, { type: 'vulnerable', valeur: 2 }]
  },
  brasier: {
    nom: 'Brasier', type: 'attaque', cout: 2, rarete: 'rare',
    description: 'Inflige 9 dégâts à tous les ennemis.',
    effets: [{ type: 'degats_zone', valeur: 9 }]
  },
  estoc_empoisonne: {
    nom: 'Estoc Empoisonné', type: 'attaque', cout: 1, rarete: 'rare',
    description: 'Inflige 4 dégâts. Empoisonne (3 tours).',
    effets: [{ type: 'degats', valeur: 4 }, { type: 'poison', valeur: 3 }]
  },

  // ----------------------------- compétences ------------------------------

  bouclier_de_fer: {
    nom: 'Bouclier de Fer', type: 'competence', cout: 1, rarete: 'commun',
    description: 'Gagne 9 bloc.',
    effets: [{ type: 'bloc', valeur: 9 }]
  },
  pas_de_cote: {
    nom: 'Pas de Côté', type: 'competence', cout: 0, rarete: 'commun',
    description: 'Gagne 4 bloc. Pioche 1 carte.',
    effets: [{ type: 'bloc', valeur: 4 }, { type: 'pioche', valeur: 1 }]
  },
  mot_affaiblissant: {
    nom: 'Mot Affaiblissant', type: 'competence', cout: 1, rarete: 'commun',
    description: 'Rend la cible faible (2 tours).',
    effets: [{ type: 'faible', valeur: 2 }]
  },
  sceau_de_vulnerabilite: {
    nom: 'Sceau de Vulnérabilité', type: 'competence', cout: 1, rarete: 'commun',
    description: 'Rend la cible vulnérable (2 tours).',
    effets: [{ type: 'vulnerable', valeur: 2 }]
  },
  seconde_pioche: {
    nom: 'Seconde Pioche', type: 'competence', cout: 1, rarete: 'commun',
    description: 'Pioche 3 cartes.',
    effets: [{ type: 'pioche', valeur: 3 }]
  },
  cri_de_guerre: {
    nom: 'Cri de Guerre', type: 'competence', cout: 1, rarete: 'rare',
    description: 'Gagne 2 Force pour le reste du combat.',
    effets: [{ type: 'force', valeur: 2 }]
  },
  concentration: {
    nom: 'Concentration', type: 'competence', cout: 1, rarete: 'rare',
    description: 'Gagne 2 Dextérité pour le reste du combat.',
    effets: [{ type: 'dexterite', valeur: 2 }]
  },
  rituel_de_sang: {
    nom: 'Rituel de Sang', type: 'competence', cout: 0, rarete: 'rare',
    description: 'Perd 3 PV. Gagne 2 énergie.',
    effets: [{ type: 'pv_perdus', valeur: 3 }, { type: 'energie', valeur: 2 }]
  },
  sursaut: {
    nom: 'Sursaut', type: 'competence', cout: 0, rarete: 'rare',
    description: 'Gagne 1 énergie.',
    effets: [{ type: 'energie', valeur: 1 }]
  },
  armure_de_pages: {
    nom: 'Armure de Pages', type: 'competence', cout: 2, rarete: 'rare',
    description: 'Gagne 12 bloc et 1 Dextérité pour le reste du combat.',
    effets: [{ type: 'bloc', valeur: 12 }, { type: 'dexterite', valeur: 1 }]
  },

  // ------------------------------- pouvoirs -------------------------------
  // Effet posé une fois, actif ensuite jusqu'à la fin du combat.

  focalisation: {
    nom: 'Focalisation', type: 'pouvoir', cout: 1, rarete: 'rare',
    description: '+1 énergie au début de chaque tour.',
    effets: [{ type: 'pouvoir', cle: 'energie_par_tour', valeur: 1 }]
  },
  peau_de_pierre: {
    nom: 'Peau de Pierre', type: 'pouvoir', cout: 1, rarete: 'rare',
    description: '+3 bloc au début de chaque tour.',
    effets: [{ type: 'pouvoir', cle: 'bloc_par_tour', valeur: 3 }]
  },
  sang_bouillant: {
    nom: 'Sang Bouillant', type: 'pouvoir', cout: 2, rarete: 'epique',
    description: 'Chaque attaque jouée empoisonne aussi sa cible (1 tour).',
    effets: [{ type: 'pouvoir', cle: 'poison_sur_attaque', valeur: 1 }]
  },
  malediction_partagee: {
    nom: 'Malédiction Partagée', type: 'pouvoir', cout: 1, rarete: 'epique',
    description: 'Chaque attaque jouée rend aussi sa cible faible (1 tour).',
    effets: [{ type: 'pouvoir', cle: 'faible_sur_attaque', valeur: 1 }]
  }
};

/** Renvoie la liste des identifiants de cartes piochables en récompense (jamais le deck de départ). */
function cartesDeRecompense() {
  return Object.keys(CARTES).filter(id => CARTES[id].rarete !== 'depart');
}
