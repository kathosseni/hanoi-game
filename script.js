
/* ==============================
   VARIABLES DU JEU
============================== */

// État des trois tours
// Le dernier élément de chaque tableau est l'anneau du dessus.
let etatJeu = [[], [], []];

let tourSelectionnee = null;
let anneauSelectionne = null;
let tourInvalide = null;

let nombreAnneaux = 0;
let nombreCoups = 0;
let score = 0;

let demoEnCours = false;
let partieTerminee = false;

// Gestion des animations et de leur annulation
let animationEnCours = false;
let animationActive = null;
let cloneAnime = null;
let cibleAnimee = null;

let jetonAnimation = 0;
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

    const anneauDeplace =
        pileDepart[pileDepart.length - 1];

    // Une tour vide peut recevoir un anneau
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

        // Afficher la sélection et les erreurs
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

            // Largeur proportionnelle à la taille
            anneau.style.width = (40 + taille * 20) + "px";

            // Couleur selon la taille de l'anneau
            anneau.style.backgroundColor =
                `hsl(${260 - taille * 20}, 65%, 70%)`;

            // Mettre en évidence l'anneau sélectionné
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

// Calculer le score selon le nombre minimal de coups
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
   ANNULATION D'UNE ANIMATION
============================== */

function annulerAnimation() {

    // Invalider les animations précédentes
    jetonAnimation++;

    // Annuler l'animation active
    if (animationActive) {
        animationActive.cancel();
    }

    // Supprimer la copie animée
    if (cloneAnime) {
        cloneAnime.remove();
    }

    // Rendre visible l'anneau de destination
    if (cibleAnimee && cibleAnimee.isConnected) {
        cibleAnimee.style.visibility = "";
    }

    animationActive = null;
    cloneAnime = null;
    cibleAnimee = null;

    animationEnCours = false;
}


/* ==============================
   ANIMATION D'UN DÉPLACEMENT
============================== */

async function deplacerAvecAnimation(de, vers) {

    if (!deplacementValide(de, vers)) {
        return false;
    }

    // Récupérer l'anneau du dessus
    const source = tours[de].lastElementChild;

    if (!source) {
        return false;
    }

    // Mémoriser la position de départ
    const positionDepart = source.getBoundingClientRect();

    // Créer une copie visuelle de l'anneau
    const clone = source.cloneNode(true);

    clone.classList.remove("selectionne");

    clone.style.position = "fixed";
    clone.style.left = positionDepart.left + "px";
    clone.style.top = positionDepart.top + "px";
    clone.style.width = positionDepart.width + "px";
    clone.style.height = positionDepart.height + "px";
    clone.style.margin = "0";
    clone.style.zIndex = "10000";
    clone.style.pointerEvents = "none";
    clone.style.transition = "none";

    document.body.appendChild(clone);

    cloneAnime = clone;

    animationEnCours = true;

    const monJeton = jetonAnimation;

    // Déplacer réellement l'anneau dans les données
    const anneau = etatJeu[de].pop();

    etatJeu[vers].push(anneau);

    // Actualiser le compteur et le score
    enregistrerCoup();

    // Actualiser le plateau
    rendre();

    // Récupérer l'anneau à sa nouvelle position
    const destination = tours[vers].lastElementChild;

    if (!destination) {

        // Annuler le déplacement en cas de problème
        etatJeu[vers].pop();
        etatJeu[de].push(anneau);

        nombreCoups--;
        compteurCoups.textContent = nombreCoups;
        afficherScore();

        clone.remove();

        cloneAnime = null;
        animationEnCours = false;

        rendre();

        return false;
    }

    const positionArrivee =
        destination.getBoundingClientRect();

    // Cacher temporairement l'anneau réel
    destination.style.visibility = "hidden";

    cibleAnimee = destination;

    // Calculer le déplacement horizontal et vertical
    const deplacementX =
        positionArrivee.left - positionDepart.left;

    const deplacementY =
        positionArrivee.top - positionDepart.top;

    // Hauteur du soulèvement
    const hauteur = 55;

    // Respecter les préférences de mouvement
    const mouvementReduit = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const duree = mouvementReduit ? 1 : 750;

    // Animation en trois étapes :
    // 1. Soulèvement
    // 2. Glissement horizontal
    // 3. Descente
    const animation = clone.animate(
        [
            {
                transform: "translate(0px, 0px)",
                offset: 0
            },
            {
                transform: `translate(0px, -${hauteur}px)`,
                offset: 0.25
            },
            {
                transform:
                    `translate(${deplacementX}px, -${hauteur}px)`,
                offset: 0.70
            },
            {
                transform:
                    `translate(${deplacementX}px, ${deplacementY}px)`,
                offset: 1
            }
        ],
        {
            duration: duree,
            easing: "ease-in-out",
            fill: "forwards"
        }
    );

    animationActive = animation;

    try {

        // Attendre la fin de l'animation
        await animation.finished;

    } catch (erreur) {

        // Une animation peut être annulée par Reset ou Démarrer

    } finally {

        // Supprimer la copie animée
        clone.remove();

        // Réafficher l'anneau réel
        if (destination.isConnected) {
            destination.style.visibility = "";
        }

        // Ne pas effacer les références d'une nouvelle animation
        if (cloneAnime === clone) {
            cloneAnime = null;
        }

        if (cibleAnimee === destination) {
            cibleAnimee = null;
        }

        // Terminer uniquement notre propre animation
        if (monJeton === jetonAnimation) {

            animationActive = null;
            animationEnCours = false;
        }
    }

    return monJeton === jetonAnimation;
}


/* ==============================
   DÉMARRER UNE NOUVELLE PARTIE
============================== */

function demarrer() {

    // Interrompre une animation précédente
    annulerAnimation();

    // Interrompre une démonstration précédente
    jetonDemo++;

    demoEnCours = false;
    partieTerminee = false;

    boutonDemo.disabled = false;

    // Lire le nombre d'anneaux
    nombreAnneaux = parseInt(champNbAnneaux.value, 10);

    if (isNaN(nombreAnneaux)) {
        nombreAnneaux = 3;
    }

    // Limiter le nombre d'anneaux entre 1 et 8
    nombreAnneaux = Math.max(
        1,
        Math.min(8, nombreAnneaux)
    );

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

async function cliquerTour(index) {

    // Ignorer les clics pendant une animation ou une démo
    if (
        demoEnCours ||
        animationEnCours ||
        partieTerminee
    ) {
        return;
    }

    tourInvalide = null;

    const pile = etatJeu[index];

    // Aucun anneau n'est sélectionné
    if (tourSelectionnee === null) {

        // Vérifier que la tour n'est pas vide
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

    // Cliquer sur la tour sélectionnée annule la sélection
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

    // Mémoriser la tour de départ
    const depart = tourSelectionnee;

    // Réinitialiser les sélections
    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    // Effectuer le déplacement animé
    const effectue =
        await deplacerAvecAnimation(depart, index);

    if (!effectue) {
        return;
    }

    // Vérifier que la partie n'a pas été réinitialisée
    if (partieTerminee) {
        return;
    }

    message.textContent = "Déplacement effectué !";

    // Vérifier la victoire
    verifierVictoire();
}


/* ==============================
   CALCUL RÉCURSIF DE LA SOLUTION
============================== */

function resoudre(n, de, vers, via) {

    const coups = [];

    function deplacer(
        nombre,
        depart,
        arrivee,
        intermediaire
    ) {

        // Cas de base : un seul anneau
        if (nombre === 1) {

            coups.push([depart, arrivee]);

            return;
        }

        // Déplacer les anneaux vers la tour intermédiaire
        deplacer(
            nombre - 1,
            depart,
            intermediaire,
            arrivee
        );

        // Déplacer le plus grand anneau
        coups.push([depart, arrivee]);

        // Déplacer les anneaux vers la destination
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

async function rejouer(coups, monJetonDemo) {

    for (let i = 0; i < coups.length; i++) {

        // Petite pause entre les déplacements
        await attendre(150);

        // Vérifier si la démonstration a été interrompue
        if (
            monJetonDemo !== jetonDemo ||
            !demoEnCours
        ) {
            return false;
        }

        const [de, vers] = coups[i];

        // Vérifier le déplacement
        if (!deplacementValide(de, vers)) {

            message.textContent =
                "Erreur : déplacement invalide pendant la démonstration.";

            return false;
        }

        // Effectuer le déplacement animé
        const effectue =
            await deplacerAvecAnimation(de, vers);

        if (!effectue) {
            return false;
        }

        // Vérifier à nouveau l'interruption
        if (
            monJetonDemo !== jetonDemo ||
            !demoEnCours
        ) {
            return false;
        }

        // Afficher la progression
        message.textContent =
            `Démonstration : coup ${i + 1} sur ${coups.length}`;
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

    // Mémoriser le jeton de cette démonstration
    const monJetonDemo = jetonDemo;

    // Calculer la liste des déplacements
    const coups = resoudre(
        nombreAnneaux,
        0,
        2,
        1
    );

    message.textContent =
        `Début de la démonstration : ${coups.length} coups à effectuer.`;

    // Exécuter les déplacements
    const termine = await rejouer(
        coups,
        monJetonDemo
    );

    // Ne rien modifier si une nouvelle partie a été lancée
    if (monJetonDemo !== jetonDemo) {
        return;
    }

    demoEnCours = false;

    boutonDemo.disabled = false;

    // Vérifier la victoire
    if (termine) {

        verifierVictoire();

    } else if (!partieTerminee) {

        message.textContent =
            "La démonstration a été interrompue.";
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

        partieTerminee = true;

        // Transformer le score en score final
        libelleScore.textContent = "Score final :";

        // Actualiser le score
        afficherScore();

        // Effacer les sélections
        tourSelectionnee = null;
        anneauSelectionne = null;
        tourInvalide = null;

        // Message de victoire
        message.textContent =
            `🎉 Félicitations ! Vous avez résolu les Tours de Hanoï en ${nombreCoups} coups !`;

        rendre();

        return true;
    }

    return false;
}


/* ==============================
   RÉINITIALISATION DU JEU
============================== */

function reset() {

    // Interrompre une animation précédente
    annulerAnimation();

    // Interrompre une démonstration précédente
    jetonDemo++;

    demoEnCours = false;
    partieTerminee = false;

    boutonDemo.disabled = false;

    // Réinitialiser les trois tours
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
