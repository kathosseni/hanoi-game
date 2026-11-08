
/* ==============================
   VARIABLES DU JEU
============================== */

// Chaque tableau représente une tour.
// Le dernier élément est l'anneau situé au sommet.

let etatJeu = [[], [], []];

let tourSelectionnee = null;
let anneauSelectionne = null;
let tourInvalide = null;

let nombreAnneaux = 0;

// Gestion de la démonstration
let demoEnCours = false;
let jetonDemo = 0;

let nombreCoups = 0;

// Éléments HTML
const tours = document.querySelectorAll(".tour");
const champNbAnneaux = document.querySelector("#nb-anneaux");
const boutonDemarrer = document.querySelector("#btn-demarrer");
const boutonDemo = document.querySelector("#btn-demo");
const message = document.querySelector("#message");
const compteurCoups = document.getElementById("compteur-coups");


/* ==============================
   VÉRIFICATION DES DÉPLACEMENTS
============================== */

function deplacementValide(de, vers) {

    // Vérification des indices
    if (de < 0 || de > 2 || vers < 0 || vers > 2) {
        return false;
    }

    // Une tour ne peut pas être sa propre destination
    if (de === vers) {
        return false;
    }

    const pileDepart = etatJeu[de];
    const pileDestination = etatJeu[vers];

    // La tour de départ doit contenir un anneau
    if (pileDepart.length === 0) {
        return false;
    }

    const anneauDeplace =
        pileDepart[pileDepart.length - 1];

    // Une tour vide accepte n'importe quel anneau
    if (pileDestination.length === 0) {
        return true;
    }

    const anneauDestination =
        pileDestination[pileDestination.length - 1];

    // Un grand anneau ne peut pas être posé sur un petit
    return anneauDeplace < anneauDestination;
}


/* ==============================
   AFFICHAGE DU JEU
============================== */

function rendre() {

    tours.forEach((tour, index) => {

        // L'affichage est reconstruit depuis l'état du jeu
        tour.innerHTML = "";

        tour.classList.toggle(
            "selectionnee",
            tourSelectionnee === index
        );

        tour.classList.toggle(
            "invalide",
            tourInvalide === index
        );

        // Création des anneaux de la tour
        etatJeu[index].forEach((taille) => {

            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // Largeur proportionnelle à la taille
            anneau.style.width =
                (40 + taille * 20) + "px";

            // Couleur différente selon la taille
            const teinte = (taille * 38 + 180) % 360;

            anneau.style.backgroundColor =
                `hsl(${teinte}, 70%, 60%)`;

            // Mise en évidence de l'anneau sélectionné
            if (
                tourSelectionnee === index &&
                taille === anneauSelectionne
            ) {
                anneau.classList.add("selectionne");
            }

            tour.appendChild(anneau);
        });
    });
}


/* ==============================
   DÉMARRAGE / RÉINITIALISATION
============================== */

function demarrer() {

    // Invalidation d'une éventuelle démonstration en cours
    jetonDemo++;

    demoEnCours = false;
    boutonDemo.disabled = false;

    // Réinitialisation du compteur de coups
    nombreCoups = 0;
    compteurCoups.textContent = nombreCoups;

    // Lecture du nombre d'anneaux
    let valeur = parseInt(champNbAnneaux.value, 10);

    if (Number.isNaN(valeur)) {
        valeur = 3;
    }

    // Limitation entre 1 et 8
    nombreAnneaux = Math.max(1, Math.min(8, valeur));

    champNbAnneaux.value = nombreAnneaux;

    // Réinitialisation des trois tours
    etatJeu = [[], [], []];

    // Tous les anneaux sont placés sur la première tour
    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    // Réinitialisation des sélections
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    message.textContent =
        "Partie démarrée ! Déplacez les anneaux vers la troisième tour.";

    rendre();
}


/* ==============================
   DÉPLACEMENTS MANUELS
============================== */

function cliquerTour(index) {

    // Les clics sont ignorés pendant la démonstration
    if (demoEnCours) {
        return;
    }

    tourInvalide = null;

    const pile = etatJeu[index];

    // Aucun anneau n'est sélectionné
    if (tourSelectionnee === null) {

        // La tour est vide
        if (pile.length === 0) {

            if (nombreAnneaux === 0) {
                message.textContent =
                    "Cette tour est vide. Cliquez sur Démarrer pour jouer.";
            } else {
                message.textContent =
                    "Cette tour est vide.";
            }

            rendre();
            return;
        }

        // Sélection du dernier anneau de la pile
        tourSelectionnee = index;
        anneauSelectionne = pile[pile.length - 1];

        message.textContent =
            "Anneau sélectionné. Choisissez une tour de destination.";

        rendre();
        return;
    }

    // Un clic sur la même tour annule la sélection
    if (tourSelectionnee === index) {

        tourSelectionnee = null;
        anneauSelectionne = null;

        message.textContent = "Sélection annulée.";

        rendre();
        return;
    }

    // Vérification de la validité du déplacement
    if (!deplacementValide(tourSelectionnee, index)) {

        tourInvalide = index;

        message.textContent =
            "Déplacement impossible ! Un grand anneau ne peut pas être posé sur un plus petit.";

        rendre();
        return;
    }

    // Déplacement de l'anneau
    const anneau = etatJeu[tourSelectionnee].pop();

    etatJeu[index].push(anneau);

    // Increment du compteur de coups
    nombreCoups++;
    compteurCoups.textContent = nombreCoups;
    

    // Réinitialisation de la sélection
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    message.textContent = "Déplacement effectué !";

    rendre();

    verifierVictoire();
}


/* ==============================
   VÉRIFICATION DE LA VICTOIRE
============================== */

function verifierVictoire() {

    if (
        nombreAnneaux > 0 &&
        etatJeu[2].length === nombreAnneaux
    ) {

        message.textContent =
            "🎉 Félicitations ! Vous avez résolu les Tours de Hanoï !";

        tourSelectionnee = null;
        anneauSelectionne = null;

        rendre();
    }
}


/* ==============================
   CALCUL DE LA SOLUTION
============================== */

// Cette fonction calcule uniquement la liste des coups.
// Elle ne modifie ni etatJeu ni le DOM.
//
// Chaque coup est un tableau : [tourDepart, tourArrivee].

function resoudre(n, de, vers, via) {

    const coups = [];

    function deplacer(nombre, depart, arrivee, intermediaire) {

        // Cas de base : un seul anneau
        if (nombre === 1) {

            coups.push([depart, arrivee]);

            return;
        }

        // Étape 1 : déplacer les anneaux supérieurs vers la tour intermédiaire
        deplacer(
            nombre - 1,
            depart,
            intermediaire,
            arrivee
        );

        // Étape 2 : déplacer le plus grand anneau vers la destination
        coups.push([depart, arrivee]);

        // Étape 3 : déplacer les anneaux intermédiaires vers la destination
        deplacer(
            nombre - 1,
            intermediaire,
            arrivee,
            depart
        );
    }

    // Calcul de la solution
    deplacer(n, de, vers, via);

    return coups;
}


/* ==============================
   FONCTION D'ATTENTE
============================== */

function attendre(delai) {

    return new Promise(resolve => {
        setTimeout(resolve, delai);
    });
}


/* ==============================
   REJEU DES COUPS
============================== */

// Cette fonction reçoit une liste de coups déjà calculée.
// Elle les exécute un par un avec un délai.

async function rejouer(coups) {

    const monJeton = jetonDemo;

    for (let i = 0; i < coups.length; i++) {

        // Pause entre deux déplacements
        await attendre(650);

        // Arrêt si la démonstration a été annulée
        if (monJeton !== jetonDemo) {
            return false;
        }

        const [de, vers] = coups[i];

        // Vérification de la règle du jeu
        if (!deplacementValide(de, vers)) {
            return false;
        }

        // Déplacement réel dans l'état du jeu
        const anneau = etatJeu[de].pop();

        etatJeu[vers].push(anneau);

        // Increment du compteur de coups
        nombreCoups++;
        compteurCoups.textContent = nombreCoups;

        // Affichage de la progression
        message.textContent =
            `Démonstration : coup ${i + 1} sur ${coups.length}`;

        // Actualisation visuelle
        rendre();
    }

    return true;
}


/* ==============================
   LANCEMENT DE LA DÉMONSTRATION
============================== */

async function lancerDemo() {

    // Empêche plusieurs démonstrations simultanées
    if (demoEnCours) {
        return;
    }

    // Démarre une nouvelle partie
    demarrer();

    demoEnCours = true;
    boutonDemo.disabled = true;

    // Calcule la liste des coups
    const coups = resoudre(
        nombreAnneaux,
        0,
        2,
        1
    );

    message.textContent =
        `Début de la démonstration : ${coups.length} coups à effectuer.`;

    // Rejoue les coups calculés
    const termine = await rejouer(coups);

    // Vérifie si la démonstration a été annulée
    if (!termine) {
        return;
    }

    demoEnCours = false;
    boutonDemo.disabled = false;

    // Vérification de la victoire
    verifierVictoire();
}


/* ==============================
   ÉCOUTEURS D'ÉVÉNEMENTS
============================== */

// Bouton de démarrage
boutonDemarrer.addEventListener("click", demarrer);

// Bouton de démonstration
boutonDemo.addEventListener("click", lancerDemo);

// Clics sur les trois tours
tours.forEach((tour, index) => {

    tour.addEventListener("click", () => {
        cliquerTour(index);
    });

});


/* ==============================
   INITIALISATION
============================== */

rendre();
