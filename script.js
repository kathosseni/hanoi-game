
/* ==============================
   VARIABLES DU JEU
============================== */

// État du jeu : trois tableaux représentant les trois tours.
// Le dernier élément de chaque tableau est l'anneau du dessus.
let etatJeu = [[], [], []];

let tourSelectionnee = null;
let anneauSelectionne = null;
let tourInvalide = null;

let nombreAnneaux = 0;
let nombreCoups = 0;
let score = 0;

let demoEnCours = false;
let jetonDemo = 0;


/* ==============================
   ÉLÉMENTS HTML
============================== */

const tours = document.querySelectorAll(".tour");
const champNbAnneaux = document.querySelector("#nb-anneaux");

const boutonDemarrer = document.querySelector("#btn-demarrer");
const boutonDemo = document.querySelector("#btn-demo");
const boutonReset = document.querySelector("#btn-reset");

const message = document.querySelector("#message");

const compteurCoups = document.querySelector("#compteur-coups");
const affichageScore = document.querySelector("#score");
const libelleScore = document.querySelector("#libelle-score");


/* ==============================
   VÉRIFICATION DES DÉPLACEMENTS
============================== */

function deplacementValide(de, vers) {

    // Vérifier les indices des tours
    if (
        de < 0 || de > 2 ||
        vers < 0 || vers > 2 ||
        de === vers
    ) {
        return false;
    }

    const pileDepart = etatJeu[de];
    const pileDestination = etatJeu[vers];

    // Vérifier que la tour de départ n'est pas vide
    if (pileDepart.length === 0) {
        return false;
    }

    const anneauDeplace = pileDepart[pileDepart.length - 1];

    // Une tour vide peut recevoir n'importe quel anneau
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

        // Vider le contenu de la tour
        tour.innerHTML = "";

        // Gérer la sélection et les erreurs
        tour.classList.toggle(
            "selectionnee",
            tourSelectionnee === index
        );

        tour.classList.toggle(
            "invalide",
            tourInvalide === index
        );

        // Créer les anneaux à partir de l'état du jeu
        etatJeu[index].forEach(taille => {

            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // Largeur proportionnelle à la taille de l'anneau
            anneau.style.width = (40 + taille * 20) + "px";

            // Couleur différente selon la taille
            anneau.style.backgroundColor =
                `hsl(${260 - taille * 20}, 65%, 70%)`;

            // Mettre en évidence uniquement l'anneau du dessus
            if (
                index === tourSelectionnee &&
                taille === anneauSelectionne
            ) {
                anneau.classList.add("selectionne");
            }

            tour.appendChild(anneau);
        });
    });
}


/* ==============================
   COMPTEUR ET SCORE
============================== */

// Calculer le score en fonction du nombre minimal de coups
function calculerScore() {

    const coupsMinimum = Math.pow(2, nombreAnneaux) - 1;

    if (nombreCoups === 0) {
        score = 0;
    } else {
        score = (coupsMinimum / nombreCoups) * 100;
    }

    return score;
}


// Afficher le score
function afficherScore() {

    const resultat = calculerScore();

    affichageScore.textContent =
        nombreCoups === 0
            ? "—"
            : resultat.toFixed(1) + " %";
}


// Enregistrer un déplacement valide
function enregistrerCoup() {

    nombreCoups++;

    compteurCoups.textContent = nombreCoups;

    afficherScore();
}


/* ==============================
   DÉMARRER UNE NOUVELLE PARTIE
============================== */

function demarrer() {

    // Interrompre une éventuelle démonstration
    jetonDemo++;
    demoEnCours = false;

    boutonDemo.disabled = false;

    // Lire et limiter le nombre d'anneaux entre 1 et 8
    nombreAnneaux = parseInt(champNbAnneaux.value, 10);

    if (isNaN(nombreAnneaux)) {
        nombreAnneaux = 3;
    }

    nombreAnneaux = Math.max(1, Math.min(8, nombreAnneaux));

    champNbAnneaux.value = nombreAnneaux;

    // Réinitialiser les trois tours
    etatJeu = [[], [], []];

    // Placer tous les anneaux sur la première tour
    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    // Réinitialiser les sélections
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    // Réinitialiser le compteur
    nombreCoups = 0;
    compteurCoups.textContent = nombreCoups;

    // Réinitialiser le score
    score = 0;
    affichageScore.textContent = "—";
    libelleScore.textContent = "Score :";

    // Afficher le message
    message.textContent =
        "Nouvelle partie ! Déplacez les anneaux vers la troisième tour.";

    rendre();
}


/* ==============================
   JEU MANUEL
============================== */

function cliquerTour(index) {

    // Ignorer les clics pendant la démonstration
    if (demoEnCours) {
        return;
    }

    tourInvalide = null;

    const pile = etatJeu[index];

    // Aucun anneau n'est actuellement sélectionné
    if (tourSelectionnee === null) {

        // Empêcher la sélection d'une tour vide
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

        // Sélectionner uniquement l'anneau du dessus
        anneauSelectionne = pile[pile.length - 1];

        tourSelectionnee = index;

        message.textContent =
            "Anneau sélectionné. Choisissez une tour de destination.";

        rendre();
        return;
    }

    // Cliquer à nouveau sur la tour sélectionnée annule la sélection
    if (tourSelectionnee === index) {

        tourSelectionnee = null;
        anneauSelectionne = null;

        message.textContent = "Sélection annulée.";

        rendre();
        return;
    }

    // Vérifier si le déplacement est autorisé
    if (!deplacementValide(tourSelectionnee, index)) {

        tourInvalide = index;

        message.textContent =
            "Déplacement impossible ! Un grand anneau ne peut pas être posé sur un plus petit.";

        rendre();
        return;
    }

    // Effectuer le déplacement
    const anneau = etatJeu[tourSelectionnee].pop();

    etatJeu[index].push(anneau);

    // Incrémenter le compteur et actualiser le score
    enregistrerCoup();

    // Réinitialiser les sélections
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    message.textContent = "Déplacement effectué !";

    rendre();

    // Vérifier si la partie est terminée
    verifierVictoire();
}


/* ==============================
   CALCUL RÉCURSIF DE LA SOLUTION
============================== */

function resoudre(n, de, vers, via) {

    const coups = [];

    function deplacer(nombre, depart, arrivee, intermediaire) {

        // Cas de base : déplacer un seul anneau
        if (nombre === 1) {

            coups.push([depart, arrivee]);

            return;
        }

        // Déplacer n - 1 anneaux vers la tour intermédiaire
        deplacer(
            nombre - 1,
            depart,
            intermediaire,
            arrivee
        );

        // Déplacer le plus grand anneau vers la destination
        coups.push([depart, arrivee]);

        // Déplacer les n - 1 anneaux vers la destination
        deplacer(
            nombre - 1,
            intermediaire,
            arrivee,
            depart
        );
    }

    deplacer(n, de, vers, via);

    return coups;
}


/* ==============================
   ATTENTE ENTRE LES DÉPLACEMENTS
============================== */

function attendre(delai) {

    return new Promise(resolve => {
        setTimeout(resolve, delai);
    });
}


/* ==============================
   REJOUER LA SOLUTION
============================== */

async function rejouer(coups) {

    // Mémoriser le jeton de cette démonstration
    const monJeton = jetonDemo;

    for (let i = 0; i < coups.length; i++) {

        // Attendre avant chaque déplacement
        await attendre(650);

        // Vérifier si la démonstration a été interrompue
        if (monJeton !== jetonDemo) {
            return false;
        }

        const [de, vers] = coups[i];

        // Vérifier le déplacement
        if (!deplacementValide(de, vers)) {

            message.textContent =
                "Erreur : déplacement invalide pendant la démonstration.";

            return false;
        }

        // Effectuer le déplacement
        const anneau = etatJeu[de].pop();

        etatJeu[vers].push(anneau);

        // Incrémenter le compteur et actualiser le score
        enregistrerCoup();

        // Afficher la progression
        message.textContent =
            `Démonstration : coup ${i + 1} sur ${coups.length}`;

        rendre();
    }

    return true;
}


/* ==============================
   DÉMONSTRATION AUTOMATIQUE
============================== */

async function lancerDemo() {

    if (demoEnCours) {
        return;
    }

    // Démarrer une nouvelle partie
    demarrer();

    demoEnCours = true;

    boutonDemo.disabled = true;

    // Calculer la liste des déplacements
    const coups = resoudre(nombreAnneaux, 0, 2, 1);

    message.textContent =
        `Début de la démonstration : ${coups.length} coups à effectuer.`;

    // Exécuter les déplacements
    const termine = await rejouer(coups);

    // Si une autre action a interrompu la démonstration,
    // ne pas modifier l'état du nouveau jeu
    if (!demoEnCours) {
        return;
    }

    demoEnCours = false;

    boutonDemo.disabled = false;

    // Vérifier la victoire si la démonstration est terminée
    if (termine) {
        verifierVictoire();
    }
}


/* ==============================
   VÉRIFICATION DE LA VICTOIRE
============================== */

function verifierVictoire() {

    if (
        nombreAnneaux > 0 &&
        etatJeu[2].length === nombreAnneaux
    ) {

        // Transformer le score en score final
        libelleScore.textContent = "Score final :";

        // Actualiser le score
        afficherScore();

        // Message de victoire
        message.textContent =
            `🎉 Félicitations ! Vous avez résolu les Tours de Hanoï en ${nombreCoups} coups !`;

        // Effacer les sélections
        tourSelectionnee = null;
        anneauSelectionne = null;
        tourInvalide = null;

        rendre();
    }
}


/* ==============================
   RÉINITIALISATION DU JEU
============================== */

function reset() {

    // Interrompre une éventuelle démonstration
    jetonDemo++;

    demoEnCours = false;

    boutonDemo.disabled = false;

    // Réinitialiser les tours
    etatJeu = [[], [], []];

    // Remettre les anneaux sur la première tour
    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    // Réinitialiser les sélections
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    // Réinitialiser le compteur
    nombreCoups = 0;
    compteurCoups.textContent = nombreCoups;

    // Réinitialiser le score
    score = 0;
    affichageScore.textContent = "—";
    libelleScore.textContent = "Score :";

    // Afficher le message adapté
    if (nombreAnneaux > 0) {

        message.textContent =
            "Jeu réinitialisé. Vous pouvez recommencer !";

    } else {

        message.textContent =
            "Choisissez le nombre d'anneaux puis cliquez sur Démarrer.";
    }

    rendre();
}


/* ==============================
   ÉVÉNEMENTS
============================== */

// Bouton Démarrer
boutonDemarrer.addEventListener("click", demarrer);

// Bouton Démo automatique
boutonDemo.addEventListener("click", lancerDemo);

// Bouton Reset
boutonReset.addEventListener("click", reset);

// Clics sur les trois tours
tours.forEach((tour, index) => {

    tour.addEventListener("click", () => {
        cliquerTour(index);
    });
});

// Affichage initial
rendre();
