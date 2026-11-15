/* ==========================================
   JEU DES TOURS DE HANOÏ
   MODE CLAIR / SOMBRE
========================================== */

/* ==========================================
   VARIABLES DU JEU
========================================== */

let etatJeu = [[], [], []];

let tourSelectionnee = null;
let anneauSelectionne = null;
let tourInvalide = null;

let nombreAnneaux = 0;
let nombreCoups = 0;
let score = 0;

let demoEnCours = false;
let partieTerminee = false;
let animationEnCours = false;

let animationActive = null;
let cloneAnime = null;
let cibleAnimee = null;

let jetonAnimation = 0;
let jetonDemo = 0;


/* ==========================================
   ÉLÉMENTS HTML
========================================== */

const tours = document.querySelectorAll(".tour");

const champNbAnneaux = document.querySelector("#nb-anneaux");

const boutonDemarrer = document.querySelector("#btn-demarrer");
const boutonDemo = document.querySelector("#btn-demo");
const boutonReset = document.querySelector("#btn-reset");
const boutonTheme = document.querySelector("#btn-theme");

const message = document.querySelector("#message");

const compteurCoups = document.querySelector("#compteur-coups");
const affichageScore = document.querySelector("#score");
const libelleScore = document.querySelector("#libelle-score");


/* ==========================================
   MODE CLAIR / SOMBRE
========================================== */

/**
 * Initialise le thème de l'interface au chargement de la page.
 * Utilise en priorité le thème sauvegardé dans le localStorage,
 * sinon la préférence du système (clair ou sombre).
 * @returns {void}
 */
function initialiserTheme() {
    const themeSauvegarde = localStorage.getItem("theme-hanoi");

    const themeSysteme = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const themeInitial = themeSauvegarde || themeSysteme;

    appliquerTheme(themeInitial);
}

/**
 * Applique un thème à la page, met à jour le bouton de bascule
 * et sauvegarde le choix dans le localStorage.
 * @param {"light"|"dark"} theme Thème à appliquer.
 * @returns {void}
 */
function appliquerTheme(theme) {
    const sombre = theme === "dark";

    document.body.dataset.theme = sombre ? "dark" : "light";

    boutonTheme.textContent = sombre
        ? "☀ Mode clair"
        : "☾ Mode sombre";

    boutonTheme.setAttribute("aria-pressed", String(sombre));

    localStorage.setItem("theme-hanoi", theme);
}

/**
 * Bascule entre le mode clair et le mode sombre.
 * @returns {void}
 */
function basculerTheme() {
    const themeActuel = document.body.dataset.theme;

    const nouveauTheme = themeActuel === "dark"
        ? "light"
        : "dark";

    appliquerTheme(nouveauTheme);
}


/* ==========================================
   VALIDATION D'UN DÉPLACEMENT
========================================== */

/**
 * Vérifie si le déplacement de l'anneau supérieur d'une tour vers une autre
 * respecte les règles du jeu (tours existantes, tour de départ non vide,
 * pas de grand anneau posé sur un plus petit).
 * @param {number} de Tour de départ (0, 1 ou 2).
 * @param {number} vers Tour d'arrivée (0, 1 ou 2).
 * @returns {boolean} true si le déplacement est autorisé, false sinon.
 */
function deplacementValide(de, vers) {
    if (
        !Number.isInteger(de) ||
        !Number.isInteger(vers) ||
        de < 0 ||
        de > 2 ||
        vers < 0 ||
        vers > 2 ||
        de === vers
    ) {
        return false;
    }

    if (etatJeu[de].length === 0) {
        return false;
    }

    const anneauDeplace = etatJeu[de][etatJeu[de].length - 1];

    if (etatJeu[vers].length === 0) {
        return true;
    }

    const anneauDestination = etatJeu[vers][etatJeu[vers].length - 1];

    return anneauDeplace < anneauDestination;
}


/* ==========================================
   AFFICHAGE DU JEU
========================================== */

/**
 * Redessine les trois tours et leurs anneaux à partir de l'état du jeu,
 * en appliquant les classes de sélection et d'invalidité.
 * @returns {void}
 */
function rendre() {
    tours.forEach((tour, index) => {
        tour.innerHTML = "";

        etatJeu[index].forEach(taille => {
            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            anneau.style.width = (40 + taille * 20) + "px";

            anneau.style.background =
                `hsl(${250 - taille * 25}, 65%, 70%)`;

            if (
                index === tourSelectionnee &&
                anneau === tour.lastElementChild
            ) {
                anneau.classList.add("selectionne");
            }

            tour.appendChild(anneau);
        });

        tour.classList.toggle(
            "selectionnee",
            index === tourSelectionnee
        );

        tour.classList.toggle(
            "invalide",
            index === tourInvalide
        );
    });

    // La sélection visuelle de l'anneau supérieur.
    if (tourSelectionnee !== null) {
        const anneau = tours[tourSelectionnee].lastElementChild;

        if (anneau) {
            anneau.classList.add("selectionne");
        }
    }
}


/* ==========================================
   SCORE
========================================== */

/**
 * Calcule le score en pourcentage : rapport entre le nombre minimal de coups
 * (2^n - 1) et le nombre de coups joués. Met à jour la variable globale score.
 * @returns {void}
 */
function calculerScore() {
    if (nombreCoups === 0 || nombreAnneaux === 0) {
        score = 0;
        return;
    }

    const minimum = Math.pow(2, nombreAnneaux) - 1;

    score = (minimum / nombreCoups) * 100;
}

/**
 * Affiche le score à l'écran, ou un tiret tant qu'aucun coup n'a été joué.
 * @returns {void}
 */
function afficherScore() {
    if (nombreCoups === 0) {
        affichageScore.textContent = "—";
        return;
    }

    calculerScore();

    affichageScore.textContent = score.toFixed(1) + " %";
}

/**
 * Enregistre un coup : incrémente le compteur, met à jour son affichage
 * ainsi que le score.
 * @returns {void}
 */
function enregistrerCoup() {
    nombreCoups++;

    compteurCoups.textContent = nombreCoups;

    afficherScore();
}


/* ==========================================
   ANNULATION D'UNE ANIMATION
========================================== */

/**
 * Annule l'animation en cours : invalide le jeton d'animation, arrête
 * l'animation, supprime le clone animé et rétablit l'anneau cible masqué.
 * @returns {void}
 */
function annulerAnimation() {
    jetonAnimation++;

    if (animationActive) {
        animationActive.cancel();
        animationActive = null;
    }

    if (cloneAnime) {
        cloneAnime.remove();
        cloneAnime = null;
    }

    if (cibleAnimee) {
        cibleAnimee.style.visibility = "";
        cibleAnimee = null;
    }

    animationEnCours = false;
}


/* ==========================================
   DÉPLACEMENT AVEC ANIMATION
========================================== */

/**
 * Déplace l'anneau supérieur d'une tour vers une autre, en mettant à jour
 * l'état du jeu puis en animant un clone de l'anneau (montée, translation
 * horizontale, descente).
 * @async
 * @param {number} de Tour de départ (0, 1 ou 2).
 * @param {number} vers Tour d'arrivée (0, 1 ou 2).
 * @returns {Promise<boolean>} true si le déplacement a été effectué et
 * l'animation menée à terme, false s'il est invalide ou a été annulé.
 */
async function deplacerAvecAnimation(de, vers) {
    if (!deplacementValide(de, vers)) {
        return false;
    }

    const anneauSource = tours[de].lastElementChild;

    if (!anneauSource) {
        return false;
    }

    const rectangleSource = anneauSource.getBoundingClientRect();

    const clone = anneauSource.cloneNode(true);

    clone.classList.remove("selectionne");

    clone.style.position = "fixed";
    clone.style.left = rectangleSource.left + "px";
    clone.style.top = rectangleSource.top + "px";
    clone.style.width = rectangleSource.width + "px";
    clone.style.height = rectangleSource.height + "px";
    clone.style.margin = "0";
    clone.style.zIndex = "10000";
    clone.style.pointerEvents = "none";
    clone.style.transition = "none";

    document.body.appendChild(clone);

    cloneAnime = clone;
    animationEnCours = true;

    const monJeton = jetonAnimation;

    // Mise à jour de l'état du jeu.
    const anneau = etatJeu[de].pop();

    etatJeu[vers].push(anneau);

    enregistrerCoup();

    rendre();

    // Récupération de la nouvelle position de destination.
    const cible = tours[vers].lastElementChild;

    if (!cible) {
        etatJeu[vers].pop();
        etatJeu[de].push(anneau);

        nombreCoups--;
        compteurCoups.textContent = nombreCoups;

        afficherScore();
        rendre();

        clone.remove();
        cloneAnime = null;
        animationEnCours = false;

        return false;
    }

    const rectangleDestination = cible.getBoundingClientRect();

    cibleAnimee = cible;
    cible.style.visibility = "hidden";

    const deplacementX =
        rectangleDestination.left - rectangleSource.left;

    const deplacementY =
        rectangleDestination.top - rectangleSource.top;

    const mouvementReduit = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const animation = clone.animate(
        [
            {
                transform: "translate(0, 0)",
                offset: 0
            },
            {
                transform: "translate(0, -55px)",
                offset: 0.25
            },
            {
                transform: `translate(${deplacementX}px, -55px)`,
                offset: 0.70
            },
            {
                transform: `translate(${deplacementX}px, ${deplacementY}px)`,
                offset: 1
            }
        ],
        {
            duration: mouvementReduit ? 1 : 750,
            easing: "ease-in-out",
            fill: "forwards"
        }
    );

    animationActive = animation;

    try {
        await animation.finished;
    } catch (erreur) {
        // L'animation peut être annulée par un reset ou un redémarrage.
    } finally {
        clone.remove();

        if (cibleAnimee === cible) {
            cible.style.visibility = "";
            cibleAnimee = null;
        }

        if (cloneAnime === clone) {
            cloneAnime = null;
        }

        if (animationActive === animation) {
            animationActive = null;
        }

        if (monJeton === jetonAnimation) {
            animationEnCours = false;
        }
    }

    return monJeton === jetonAnimation;
}


/* ==========================================
   DÉMARRER UNE PARTIE
========================================== */

/**
 * Démarre une nouvelle partie : annule toute animation ou démonstration,
 * lit le nombre d'anneaux (borné entre 1 et 8), réinitialise l'état,
 * les compteurs et l'affichage.
 * @returns {void}
 */
function demarrer() {
    annulerAnimation();

    jetonDemo++;

    demoEnCours = false;
    partieTerminee = false;

    boutonDemo.disabled = false;

    let valeur = parseInt(champNbAnneaux.value, 10);

    if (isNaN(valeur)) {
        valeur = 3;
    }

    nombreAnneaux = Math.min(8, Math.max(1, valeur));

    champNbAnneaux.value = nombreAnneaux;

    etatJeu = [[], [], []];

    // Les grands anneaux sont placés en premier.
    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    nombreCoups = 0;
    score = 0;

    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    compteurCoups.textContent = "0";
    affichageScore.textContent = "—";
    libelleScore.textContent = "Score :";

    message.textContent =
        "La partie commence ! Sélectionne un anneau sur la première tour.";

    rendre();
}


/* ==========================================
   CLIC SUR UNE TOUR
========================================== */

/**
 * Gère le clic sur une tour : sélectionne l'anneau supérieur, annule la
 * sélection, ou tente de déplacer l'anneau sélectionné vers la tour cliquée.
 * Ne fait rien pendant une démonstration, une animation ou après la victoire.
 * @async
 * @param {number} index Index de la tour cliquée (0, 1 ou 2).
 * @returns {Promise<void>}
 */
async function cliquerTour(index) {
    if (
        demoEnCours ||
        animationEnCours ||
        partieTerminee
    ) {
        return;
    }

    tourInvalide = null;

    // Aucun anneau sélectionné : on sélectionne le sommet.
    if (tourSelectionnee === null) {
        if (etatJeu[index].length === 0) {
            message.textContent = "Cette tour est vide.";
            rendre();
            return;
        }

        tourSelectionnee = index;

        anneauSelectionne =
            etatJeu[index][etatJeu[index].length - 1];

        message.textContent =
            "Anneau sélectionné. Choisis une tour de destination.";

        rendre();
        return;
    }

    // Cliquer sur la même tour annule la sélection.
    if (tourSelectionnee === index) {
        tourSelectionnee = null;
        anneauSelectionne = null;

        message.textContent = "Sélection annulée.";

        rendre();
        return;
    }

    const depart = tourSelectionnee;

    // Vérification du déplacement.
    if (!deplacementValide(depart, index)) {
        tourInvalide = index;

        message.textContent =
            "Déplacement impossible : un grand anneau ne peut pas être posé sur un plus petit.";

        rendre();
        return;
    }

    tourSelectionnee = null;
    anneauSelectionne = null;

    rendre();

    const deplacementReussi =
        await deplacerAvecAnimation(depart, index);

    if (!deplacementReussi) {
        return;
    }

    if (partieTerminee) {
        return;
    }

    message.textContent = "Bien joué ! Déplacement effectué.";

    verifierVictoire();
}


/* ==========================================
   RÉSOLUTION AUTOMATIQUE
========================================== */

/**
 * Calcule la liste des coups qui déplace n anneaux d'une tour à une autre.
 * @param {number} n Nombre d'anneaux à déplacer.
 * @param {number} depart Tour de départ (0, 1 ou 2).
 * @param {number} arrivee Tour d'arrivée.
 * @param {number} intermediaire Tour intermédiaire.
 * @returns {number[][]} Liste de couples [de, vers], dans l'ordre d'exécution.
 */
function resoudre(n, depart, arrivee, intermediaire) {
    const coups = [];

    /**
     * Fonction récursive interne : ajoute à la liste les coups nécessaires
     * pour déplacer n anneaux de la tour « de » vers la tour « vers ».
     * @param {number} n Nombre d'anneaux à déplacer.
     * @param {number} de Tour de départ.
     * @param {number} vers Tour d'arrivée.
     * @param {number} via Tour intermédiaire.
     * @returns {void}
     */
    function deplacer(n, de, vers, via) {
        if (n === 0) {
            return;
        }

        deplacer(n - 1, de, via, vers);

        coups.push([de, vers]);

        deplacer(n - 1, via, vers, de);
    }

    deplacer(n, depart, arrivee, intermediaire);

    return coups;
}


/* ==========================================
   PAUSE
========================================== */

/**
 * Attend un délai donné avant de poursuivre.
 * @param {number} delai Durée de la pause, en millisecondes.
 * @returns {Promise<void>} Promesse résolue à la fin du délai.
 */
function attendre(delai) {
    return new Promise(resolve => setTimeout(resolve, delai));
}


/* ==========================================
   EXÉCUTION DE LA DÉMONSTRATION
========================================== */

/**
 * Rejoue une suite de coups avec animation, en s'interrompant si la
 * démonstration est annulée (jeton périmé), si un coup est invalide
 * ou si une animation est annulée.
 * @async
 * @param {number[][]} coups Liste de couples [de, vers] à exécuter.
 * @param {number} monJetonDemo Jeton de la démonstration en cours, comparé
 * au jeton global pour détecter une annulation.
 * @returns {Promise<boolean>} true si tous les coups ont été joués,
 * false si la démonstration a été interrompue.
 */
async function rejouer(coups, monJetonDemo) {
    for (let i = 0; i < coups.length; i++) {
        if (
            monJetonDemo !== jetonDemo ||
            !demoEnCours
        ) {
            return false;
        }

        await attendre(150);

        if (
            monJetonDemo !== jetonDemo ||
            !demoEnCours
        ) {
            return false;
        }

        const [depart, arrivee] = coups[i];

        if (!deplacementValide(depart, arrivee)) {
            return false;
        }

        const reussi =
            await deplacerAvecAnimation(depart, arrivee);

        if (!reussi) {
            return false;
        }

        message.textContent =
            `Démonstration : ${i + 1} / ${coups.length} coups`;
    }

    return true;
}


/* ==========================================
   LANCER LA DÉMONSTRATION
========================================== */

/**
 * Lance la démonstration automatique : démarre une nouvelle partie,
 * calcule la solution optimale puis la rejoue avec animation.
 * @async
 * @returns {Promise<void>}
 */
async function lancerDemo() {
    demarrer();

    demoEnCours = true;
    boutonDemo.disabled = true;

    const monJetonDemo = jetonDemo;

    const coups = resoudre(
        nombreAnneaux,
        0,
        2,
        1
    );

    message.textContent =
        "Démonstration automatique en cours...";

    const termine = await rejouer(coups, monJetonDemo);

    if (monJetonDemo !== jetonDemo) {
        return;
    }

    demoEnCours = false;
    boutonDemo.disabled = false;

    if (termine) {
        verifierVictoire();
    }
}


/* ==========================================
   VÉRIFICATION DE LA VICTOIRE
========================================== */

/**
 * Vérifie si tous les anneaux sont sur la troisième tour. Si oui, termine
 * la partie, affiche le score final et un message de félicitations.
 * @returns {boolean} true si la partie est gagnée, false sinon.
 */
function verifierVictoire() {
    if (
        nombreAnneaux > 0 &&
        etatJeu[2].length === nombreAnneaux
    ) {
        partieTerminee = true;

        libelleScore.textContent = "Score final :";

        afficherScore();

        tourSelectionnee = null;
        anneauSelectionne = null;
        tourInvalide = null;

        message.textContent =
            `🎉 Bravo ! Tu as terminé en ${nombreCoups} coups.`;

        rendre();

        return true;
    }

    return false;
}


/* ==========================================
   RESET
========================================== */

/**
 * Réinitialise la partie en cours : annule animation et démonstration,
 * replace tous les anneaux sur la première tour et remet à zéro les
 * compteurs et l'affichage.
 * @returns {void}
 */
function reset() {
    annulerAnimation();

    jetonDemo++;

    demoEnCours = false;
    partieTerminee = false;

    boutonDemo.disabled = false;

    etatJeu = [[], [], []];

    for (let i = nombreAnneaux; i >= 1; i--) {
        etatJeu[0].push(i);
    }

    nombreCoups = 0;
    score = 0;

    tourSelectionnee = null;
    anneauSelectionne = null;
    tourInvalide = null;

    compteurCoups.textContent = "0";
    affichageScore.textContent = "—";
    libelleScore.textContent = "Score :";

    message.textContent =
        "La partie a été réinitialisée. Tous les anneaux sont sur la première tour.";

    rendre();
}


/* ==========================================
   ÉVÉNEMENTS
========================================== */

boutonDemarrer.addEventListener("click", demarrer);

boutonDemo.addEventListener("click", lancerDemo);

boutonReset.addEventListener("click", reset);

boutonTheme.addEventListener("click", basculerTheme);

tours.forEach((tour, index) => {
    tour.addEventListener("click", () => {
        cliquerTour(index);
    });
});


/* ==========================================
   INITIALISATION
========================================== */

initialiserTheme();

rendre();