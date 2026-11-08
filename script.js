
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

// Gestion de la démonstration automatique
let demoEnCours = false;
let jetonDemo = 0;

// Éléments HTML
const tours = document.querySelectorAll(".tour");
const champNbAnneaux = document.querySelector("#nb-anneaux");
const boutonDemarrer = document.querySelector("#btn-demarrer");
const boutonDemo = document.querySelector("#btn-demo");
const message = document.querySelector("#message");


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

    // Vérification de la tour de départ
    if (pileDepart.length === 0) {
        return false;
    }

    const anneauDeplace = pileDepart[pileDepart.length - 1];

    // Une tour vide accepte n'importe quel anneau
    if (pileDestination.length === 0) {
        return true;
    }

    const anneauDestination =
        pileDestination[pileDestination.length - 1];

    // Un grand anneau ne peut pas aller sur un plus petit
    return anneauDeplace < anneauDestination;
}


/* ==============================
   AFFICHAGE DU JEU
============================== */

function rendre() {

    tours.forEach((tour, index) => {

        // On reconstruit l'affichage à partir de l'état du jeu
        tour.innerHTML = "";

        tour.classList.toggle(
            "selectionnee",
            tourSelectionnee === index
        );

        tour.classList.toggle(
            "invalide",
            tourInvalide === index
        );

        etatJeu[index].forEach((taille) => {

            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // Largeur proportionnelle à la taille de l'anneau
            anneau.style.width = (40 + taille * 20) + "px";

            // Couleur différente pour chaque taille
            const teinte = (taille * 38 + 180) % 360;

            anneau.style.backgroundColor =
                `hsl(${teinte}, 70%, 60%)`;

            // Seul le sommet de la tour sélectionnée est marqué
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

    // Annule une éventuelle démonstration en cours
    jetonDemo++;
    demoEnCours = false;
    boutonDemo.disabled = false;

    // Récupération du nombre d'anneaux
    let valeur = parseInt(champNbAnneaux.value, 10);

    if (Number.isNaN(valeur)) {
        valeur = 3;
    }

    // Limitation entre 1 et 8 anneaux
    nombreAnneaux = Math.max(1, Math.min(8, valeur));

    champNbAnneaux.value = nombreAnneaux;

    // Réinitialisation des trois tours
    etatJeu = [[], [], []];

    // Placement de tous les anneaux sur la première tour
    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    // Réinitialisation de la sélection
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

    // Empêche les déplacements manuels pendant la démonstration
    if (demoEnCours) {
        return;
    }

    tourInvalide = null;

    const pile = etatJeu[index];

    // Aucun anneau n'est actuellement sélectionné
    if (tourSelectionnee === null) {

        if (pile.length === 0) {

            if (nombreAnneaux === 0) {
                message.textContent =
                    "Cette tour est vide. Cliquez sur Démarrer pour jouer.";
            } else {
                message.textContent = "Cette tour est vide.";
            }

            rendre();
            return;
        }

        // Sélection du seul anneau supérieur
        tourSelectionnee = index;
        anneauSelectionne = pile[pile.length - 1];

        message.textContent =
            "Anneau sélectionné. Choisissez une tour de destination.";

        rendre();
        return;
    }

    // Cliquer sur la même tour annule la sélection
    if (tourSelectionnee === index) {

        tourSelectionnee = null;
        anneauSelectionne = null;

        message.textContent = "Sélection annulée.";

        rendre();
        return;
    }

    // Vérification avant de modifier l'état du jeu
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
   ALGORITHME DE RÉSOLUTION
============================== */

// Génère la liste des déplacements nécessaires
// pour résoudre les Tours de Hanoï.

function genererSolution(
    nombre,
    depart,
    arrivee,
    intermediaire,
    coups
) {

    // Cas de base : un seul anneau
    if (nombre === 1) {
        coups.push([depart, arrivee]);
        return;
    }

    // Déplacer les anneaux du dessus vers la tour intermédiaire
    genererSolution(
        nombre - 1,
        depart,
        intermediaire,
        arrivee,
        coups
    );

    // Déplacer le plus grand anneau vers la destination
    coups.push([depart, arrivee]);

    // Déplacer les anneaux intermédiaires vers la destination
    genererSolution(
        nombre - 1,
        intermediaire,
        arrivee,
        depart,
        coups
    );
}


/* ==============================
   ATTENTE ENTRE LES DÉPLACEMENTS
============================== */

function attendreDemo(delai) {

    return new Promise(resolve => {
        setTimeout(resolve, delai);
    });
}


/* ==============================
   DÉMONSTRATION AUTOMATIQUE
============================== */

async function lancerDemo() {

    // Évite de lancer plusieurs démonstrations simultanément
    if (demoEnCours) {
        return;
    }

    // Démarre toujours depuis une configuration initiale
    demarrer();

    demoEnCours = true;
    boutonDemo.disabled = true;

    // Identifiant permettant d'annuler proprement la démo
    const monJeton = jetonDemo;

    // Création de la liste des déplacements
    const coups = [];

    genererSolution(
        nombreAnneaux,
        0,
        2,
        1,
        coups
    );

    message.textContent =
        `Début de la démonstration : ${coups.length} déplacements à effectuer.`;

    // Exécution des déplacements un par un
    for (let i = 0; i < coups.length; i++) {

        await attendreDemo(650);

        // Vérifie si la démonstration a été annulée
        if (monJeton !== jetonDemo) {
            return;
        }

        const [depart, arrivee] = coups[i];

        // Vérifie la validité du déplacement
        if (!deplacementValide(depart, arrivee)) {
            break;
        }

        // Déplacement réel dans le tableau d'état
        const anneau = etatJeu[depart].pop();

        etatJeu[arrivee].push(anneau);

        message.textContent =
            `Démonstration : déplacement ${i + 1} sur ${coups.length}`;

        // Mise à jour de l'affichage
        rendre();
    }

    // Vérifie une dernière fois si la démo a été annulée
    if (monJeton !== jetonDemo) {
        return;
    }

    demoEnCours = false;
    boutonDemo.disabled = false;

    verifierVictoire();
}


/* ==============================
   ÉCOUTEURS D'ÉVÉNEMENTS
============================== */

// Bouton de démarrage
boutonDemarrer.addEventListener("click", demarrer);

// Bouton de démonstration
boutonDemo.addEventListener("click", lancerDemo);

// Clic sur chacune des trois tours
tours.forEach((tour, index) => {

    tour.addEventListener("click", () => {
        cliquerTour(index);
    });

});


/* ==============================
   INITIALISATION
============================== */

rendre();
