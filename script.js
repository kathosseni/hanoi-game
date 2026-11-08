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

// Tour dont le dépôt a été refusé.
let tourInvalide = null;

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
// RÈGLE DE DÉPLACEMENT
// ==========================================

function deplacementValide(de, vers) {

    // Vérification des indices des tours.
    if (
        de < 0 || de >= etatJeu.length ||
        vers < 0 || vers >= etatJeu.length
    ) {
        return false;
    }

    // On ne peut pas déplacer un anneau vers sa tour d'origine.
    if (de === vers) {
        return false;
    }

    const tourOrigine = etatJeu[de];
    const tourDestination = etatJeu[vers];

    // La tour d'origine doit contenir au moins un anneau.
    if (tourOrigine.length === 0) {
        return false;
    }

    // Récupération du sommet de chaque tour.
    const anneauDeplace = tourOrigine[tourOrigine.length - 1];

    const anneauDestination =
        tourDestination.length > 0
            ? tourDestination[tourDestination.length - 1]
            : null;

    // Une tour vide accepte tous les anneaux.
    if (anneauDestination === null) {
        return true;
    }

    // Un grand anneau ne peut pas être posé sur un plus petit.
    return anneauDeplace < anneauDestination;
}

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

        // Affichage du dépôt refusé.
        tour.classList.toggle(
            "invalide",
            tourInvalide === index
        );

        // Création des anneaux à partir de l'état.
        etatJeu[index].forEach((taille, position) => {

            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // Largeur proportionnelle à la taille.
            anneau.style.width = (40 + taille * 20) + "px";

            // Couleur différente selon la taille.
            anneau.style.backgroundColor =
                `hsl(${taille * 35}, 70%, 50%)`;

            // Seul l'anneau au sommet peut être sélectionné.
            const estSommet = position === etatJeu[index].length - 1;

            if (
                estSommet &&
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
    tourInvalide = null;

    message.textContent = "Sélectionnez l'anneau au sommet de la première tour.";

    rendre();
}

// ==========================================
// GESTION DES CLICS SUR LES TOURS
// ==========================================

function cliquerTour(index) {

    const pile = etatJeu[index];

    // Réinitialisation du précédent retour visuel.
    tourInvalide = null;

    // CAS 1 : aucune tour n'est sélectionnée.
    // On tente de sélectionner le sommet de la tour.
    if (tourSelectionnee === null) {

        if (pile.length === 0) {
            message.textContent = "Cette tour est vide.";
            rendre();
            return;
        }

        tourSelectionnee = index;

        // Seul le dernier élément de la pile est sélectionné.
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

    // Vérification de la règle avant toute modification de l'état.
    if (!deplacementValide(tourSelectionnee, index)) {

        // La destination est mise en évidence en rouge.
        tourInvalide = index;

        message.textContent =
            "Déplacement impossible : un grand anneau ne peut pas être posé sur un plus petit.";

        // L'état du jeu reste strictement inchangé.
        rendre();

        return;
    }

    // Déplacement de l'anneau dans l'état du jeu.
    const tourOrigine = etatJeu[tourSelectionnee];

    const anneauDeplace = tourOrigine.pop();

    pile.push(anneauDeplace);

    // Réinitialisation de la sélection.
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

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