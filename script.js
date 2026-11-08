// État du jeu : trois piles représentant les trois tours.
// Chaque nombre correspond à la taille d'un anneau.
// 1 = plus petit anneau, 8 = plus grand anneau.
let etatJeu = [
    [],
    [],
    []
];

// Références aux éléments HTML
const tours = [
    document.getElementById("tour-1"),
    document.getElementById("tour-2"),
    document.getElementById("tour-3")
];

const champNbAnneaux = document.getElementById("nb-anneaux");
const boutonDemarrer = document.getElementById("btn-demarrer");

// Reconstruit entièrement l'affichage à partir de l'état du jeu.
function rendre() {
    tours.forEach((tour, index) => {
        // On vide la tour avant de reconstruire son contenu.
        tour.innerHTML = "";

        // On parcourt les anneaux de la pile.
        etatJeu[index].forEach(taille => {
            const anneau = document.createElement("div");

            anneau.classList.add("anneau");

            // La largeur dépend de la taille de l'anneau.
            anneau.style.width = (40 + taille * 20) + "px";

            // Une couleur différente pour chaque taille.
            anneau.style.backgroundColor = `hsl(${taille * 35}, 70%, 50%)`;

            tour.appendChild(anneau);
        });
    });
}

// Démarre une nouvelle partie.
function demarrer() {
    let nombreAnneaux = parseInt(champNbAnneaux.value, 10);

    // Vérification de la valeur saisie.
    if (isNaN(nombreAnneaux)) {
        nombreAnneaux = 3;
    }

    nombreAnneaux = Math.max(1, Math.min(8, nombreAnneaux));

    // Mise à jour du champ si nécessaire.
    champNbAnneaux.value = nombreAnneaux;

    // Réinitialisation des trois piles.
    etatJeu = [
        [],
        [],
        []
    ];

    // Création des anneaux sur la première tour.
    // Les anneaux sont rangés du plus grand au plus petit.
    for (let taille = nombreAnneaux; taille >= 1; taille--) {
        etatJeu[0].push(taille);
    }

    // Actualisation de l'affichage.
    rendre();
}

// Événement du bouton Démarrer.
boutonDemarrer.addEventListener("click", demarrer);

// Affichage initial.
rendre();