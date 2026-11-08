// ==========================================
// ÉTAT DU JEU
// ==========================================

// Chaque tableau représente une tour.
// Les nombres représentent la taille des anneaux.
// Le dernier élément est toujours le sommet de la tour.

let etatJeu = [
    [],
    [],
    []
];

// Tour actuellement sélectionnée.
// null signifie qu'aucune tour n'est sélectionnée.
let tourSelectionnee = null;

// Anneau actuellement sélectionné.
let anneauSelectionne = null;

// Nombre initial d'anneaux.
let nombreAnneaux = 3;

// ==========================================
// RÉFÉRENCES HTML
// ==========================================

const tours = [
    document.getElementById("tour-1"),
    document.getElementById("tour-2"),
    document.getElementById("tour-3")
];

const champNbAnneaux = document.getElementById("nb-anneaux");
const boutonDemarrer = document.getElementById("btn-demarrer");
const message = document.getElementById("message");

// ==========================================
// AFFICHAGE
// ==========================================

function rendre() {

    tours.forEach((tour, index) => {

        // Reconstruction de la tour.
        tour.innerHTML = "";

        // Affichage de la sélection.
        tour.classList.toggle(
            "selectionnee",
            tourSelectionnee === index
        );

        // Création des anneaux à partir de l'état.
        etatJeu[index].forEach(taille => {

            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // Largeur proportionnelle à la taille.
            anneau.style.width = (40 + taille * 20) + "px";

            // Couleur différente selon la taille.
            anneau.style.backgroundColor =
                `hsl(${taille * 35}, 70%, 50%)`;

            // Mise en évidence de l'anneau sélectionné.
            if (
                tourSelectionnee === index &&
                anneauSelectionne === taille
            ) {
                anneau.classList.add("selectionne");
            }

            tour.appendChild(anneau);
        });
    });
}

// ==========================================
// DÉMARRER UNE PARTIE
// ==========================================

function demarrer() {

    nombreAnneaux = parseInt(champNbAnneaux.value, 10);

    if (isNaN(nombreAnneaux)) {
        nombreAnneaux = 3;
    }

    nombreAnneaux = Math.max(1, Math.min(8, nombreAnneaux));

    champNbAnneaux.value = nombreAnneaux;

    // Réinitialisation des trois tours.
    etatJeu = [
        [],
        [],
        []
    ];

    // Placement de tous les anneaux sur la première tour.
    for (let taille = nombreAnneaux; taille >= 1; taille--) {
        etatJeu[0].push(taille);
    }

    // Annulation d'une éventuelle sélection.
    tourSelectionnee = null;
    anneauSelectionne = null;

    message.textContent = "Sélectionnez un anneau sur la première tour.";

    rendre();
}

// ==========================================
// GESTION DES CLICS SUR LES TOURS
// ==========================================

function cliquerTour(index) {

    const pile = etatJeu[index];

    // CAS 1 : aucune tour n'est sélectionnée.
    // On tente de sélectionner le sommet de la tour.
    if (tourSelectionnee === null) {

        if (pile.length === 0) {
            message.textContent = "Cette tour est vide.";
            return;
        }

        tourSelectionnee = index;

        anneauSelectionne = pile[pile.length - 1];

        message.textContent =
            "Anneau sélectionné. Cliquez sur une tour de destination.";

        rendre();

        return;
    }

    // CAS 2 : clic sur la même tour.
    // On annule la sélection.
    if (tourSelectionnee === index) {

        tourSelectionnee = null;
        anneauSelectionne = null;

        message.textContent = "Sélection annulée.";

        rendre();

        return;
    }

    // CAS 3 : tentative de déplacement vers une autre tour.

    const tourOrigine = etatJeu[tourSelectionnee];

    const anneauDeplace = tourOrigine[tourOrigine.length - 1];

    // Récupération de l'anneau au sommet de la destination.
    const anneauDestination =
        pile.length > 0 ? pile[pile.length - 1] : null;

    // Vérification de la règle :
    // Un grand anneau ne peut pas être posé sur un petit.
    if (
        anneauDestination !== null &&
        anneauDeplace > anneauDestination
    ) {

        message.textContent =
            "Déplacement impossible : un grand anneau ne peut pas être posé sur un plus petit.";

        return;
    }

    // Déplacement de l'anneau dans l'état du jeu.
    tourOrigine.pop();
    pile.push(anneauDeplace);

    // Réinitialisation de la sélection.
    tourSelectionnee = null;
    anneauSelectionne = null;

    message.textContent = "Déplacement effectué !";

    // Reconstruction de l'affichage.
    rendre();

    // Vérification de la victoire.
    verifierVictoire();
}

// ==========================================
// VÉRIFICATION DE LA VICTOIRE
// ==========================================

function verifierVictoire() {

    if (
        etatJeu[2].length === nombreAnneaux
    ) {

        message.textContent =
            "Bravo ! Vous avez gagné la partie !";
    }
}

// ==========================================
// ÉVÉNEMENTS
// ==========================================

// Bouton Démarrer.
boutonDemarrer.addEventListener("click", demarrer);

// Chaque tour reçoit un événement de clic.
tours.forEach((tour, index) => {

    tour.addEventListener("click", function () {
        cliquerTour(index);
    });

});

// Affichage initial.
rendre();