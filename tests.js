/* ==========================================================
   tests.js — tests de resoudre() et deplacementValide()
   Chargé par tests.html APRÈS script.js. Résultats dans la console (F12).

   Tout est dans une fonction pour ne pas entrer en conflit avec
   les noms déclarés par script.js (let / const globaux).
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Mini-framework de test ---------- */
  let reussis = 0;
  let echoues = 0;

  function test(nom, fonction) {
    try {
      fonction();
      reussis++;
      console.log(`✅ ${nom}`);
    } catch (erreur) {
      echoues++;
      console.error(`❌ ${nom}\n   → ${erreur.message}`);
    }
  }

  function verifier(condition, message) {
    if (!condition) throw new Error(message);
  }

  function verifierEgal(obtenu, attendu, message) {
    const a = JSON.stringify(obtenu);
    const b = JSON.stringify(attendu);
    if (a !== b) throw new Error(`${message} : obtenu ${a}, attendu ${b}`);
  }

  /* ---------- Outils ---------- */
  const etatOriginal = etatJeu; // état de la page, restauré à la fin

  /** Pose un état de jeu : une pile par tour, du bas vers le sommet. */
  function poserEtat(t0, t1, t2) {
    etatJeu = [t0.slice(), t1.slice(), t2.slice()];
  }

  /** Pile complète de n anneaux : [n, n-1, ..., 1] (le plus grand en bas). */
  function pileComplete(n) {
    const pile = [];
    for (let taille = n; taille >= 1; taille--) pile.push(taille);
    return pile;
  }

  /**
   * Calcule la solution avec resoudre(), puis la rejoue sur etatJeu en
   * vérifiant chaque coup avec deplacementValide(). Renvoie la liste des coups.
   */
  function rejouer(n, de, vers, via) {
    const coups = resoudre(n, de, vers, via);
    const depart = [[], [], []];
    depart[de] = pileComplete(n);
    etatJeu = depart;

    coups.forEach(([a, b], i) => {
      verifier(
        deplacementValide(a, b),
        `le coup n°${i + 1} [${a}, ${b}] est interdit (état : ${JSON.stringify(etatJeu)})`
      );
      etatJeu[b].push(etatJeu[a].pop());
    });
    return coups;
  }

  /* ==========================================================
     deplacementValide(de, vers)
     ========================================================== */
  console.group("deplacementValide(de, vers)");

  test("vers une tour vide : autorisé", () => {
    poserEtat([3, 2, 1], [], []);
    verifierEgal(deplacementValide(0, 1), true, "(0, 1)");
    verifierEgal(deplacementValide(0, 2), true, "(0, 2)");
  });

  test("petit anneau sur un plus grand : autorisé", () => {
    poserEtat([3], [], [2, 1]);
    verifierEgal(deplacementValide(2, 0), true, "(2, 0) : 1 sur 3");
  });

  test("grand anneau sur un plus petit : interdit", () => {
    poserEtat([3, 2], [1], []);
    verifierEgal(deplacementValide(0, 1), false, "(0, 1) : 2 sur 1");
  });

  test("depuis une tour vide : interdit", () => {
    poserEtat([3, 2, 1], [], []);
    verifierEgal(deplacementValide(1, 2), false, "(1, 2)");
  });

  test("vers la même tour : interdit", () => {
    poserEtat([3, 2, 1], [], []);
    verifierEgal(deplacementValide(0, 0), false, "(0, 0)");
  });

  test("seul le sommet compte (pas le fond de la pile)", () => {
    poserEtat([3, 1], [2], []);
    verifierEgal(deplacementValide(0, 1), true, "(0, 1) : le sommet 1 va sur 2");
    verifierEgal(deplacementValide(1, 0), false, "(1, 0) : le sommet 2 ne va pas sur 1");
  });

  test("indices hors plateau : interdit", () => {
    poserEtat([3, 2, 1], [], []);
    verifierEgal(deplacementValide(0, 3), false, "(0, 3)");
    verifierEgal(deplacementValide(3, 0), false, "(3, 0)");
    verifierEgal(deplacementValide(-1, 0), false, "(-1, 0)");
    verifierEgal(deplacementValide(0, -1), false, "(0, -1)");
  });

  test("indices non entiers ou absents : interdit", () => {
    poserEtat([3, 2, 1], [], []);
    verifierEgal(deplacementValide(0.5, 1), false, "(0.5, 1)");
    verifierEgal(deplacementValide(NaN, 1), false, "(NaN, 1)");
    verifierEgal(deplacementValide(undefined, 1), false, "(undefined, 1)");
    verifierEgal(deplacementValide(0, undefined), false, "(0, undefined)");
  });

  test("ne modifie pas etatJeu", () => {
    poserEtat([3, 2], [1], []);
    const avant = JSON.stringify(etatJeu);
    deplacementValide(0, 1);
    deplacementValide(1, 0);
    deplacementValide(2, 0);
    verifierEgal(etatJeu, JSON.parse(avant), "etatJeu après les appels");
  });

  test("ne touche pas au DOM", () => {
    poserEtat([3, 2], [1], []);
    const avant = document.body.innerHTML;
    deplacementValide(0, 1);
    deplacementValide(1, 0);
    verifier(document.body.innerHTML === avant, "le DOM a changé");
  });

  console.groupEnd();

  /* ==========================================================
     resoudre(n, de, vers, via)
     ========================================================== */
  console.group("resoudre(n, de, vers, via)");

  for (let n = 1; n <= 8; n++) {
    test(`n = ${n} : ${Math.pow(2, n) - 1} coups`, () => {
      verifierEgal(resoudre(n, 0, 2, 1).length, Math.pow(2, n) - 1, "nombre de coups");
    });

    test(`n = ${n} : chaque coup est valide`, () => {
      rejouer(n, 0, 2, 1); // lève une erreur au premier coup interdit
    });

    test(`n = ${n} : tous les anneaux finissent sur la tour 3`, () => {
      rejouer(n, 0, 2, 1);
      verifierEgal(etatJeu, [[], [], pileComplete(n)], "position finale");
    });
  }

  test("les coups sont des couples [de, vers] d'entiers entre 0 et 2", () => {
    resoudre(4, 0, 2, 1).forEach((coup, i) => {
      verifier(Array.isArray(coup) && coup.length === 2, `coup n°${i + 1} : ce n'est pas un couple`);
      verifier(
        coup.every((t) => Number.isInteger(t) && t >= 0 && t <= 2),
        `coup n°${i + 1} : indices hors de 0..2 (${JSON.stringify(coup)})`
      );
    });
  });

  test("séquences exactes pour n = 1, 2, 3 (la solution minimale est unique)", () => {
    verifierEgal(resoudre(1, 0, 2, 1), [[0, 2]], "n = 1");
    verifierEgal(resoudre(2, 0, 2, 1), [[0, 1], [0, 2], [1, 2]], "n = 2");
    verifierEgal(
      resoudre(3, 0, 2, 1),
      [[0, 2], [0, 1], [2, 1], [0, 2], [1, 0], [1, 2], [0, 2]],
      "n = 3"
    );
  });

  test("n = 0 : aucun coup", () => {
    verifierEgal(resoudre(0, 0, 2, 1), [], "n = 0");
  });

  test("fonctionne avec d'autres tours : 4 anneaux de la tour 3 vers la tour 1", () => {
    const coups = rejouer(4, 2, 0, 1);
    verifierEgal(coups.length, 15, "nombre de coups");
    verifierEgal(etatJeu, [pileComplete(4), [], []], "position finale");
  });

  test("fonctionne avec d'autres tours : 3 anneaux de la tour 2 vers la tour 3", () => {
    const coups = rejouer(3, 1, 2, 0);
    verifierEgal(coups.length, 7, "nombre de coups");
    verifierEgal(etatJeu, [[], [], pileComplete(3)], "position finale");
  });

  test("ne modifie ni etatJeu ni le DOM", () => {
    poserEtat([3, 2, 1], [], []);
    const etatAvant = JSON.stringify(etatJeu);
    const domAvant = document.body.innerHTML;
    resoudre(5, 0, 2, 1);
    verifierEgal(etatJeu, JSON.parse(etatAvant), "etatJeu après resoudre");
    verifier(document.body.innerHTML === domAvant, "le DOM a changé");
  });

  console.groupEnd();

  /* ==========================================================
     Bilan
     ========================================================== */
  etatJeu = etatOriginal; // on remet l'état de la page tel qu'il était

  const bilan = `${reussis} test(s) réussi(s), ${echoues} échoué(s).`;
  if (echoues === 0) console.log(`🎉 ${bilan}`);
  else console.error(`⚠️ ${bilan}`);

  const zone = document.getElementById("bilan");
  if (zone) zone.textContent = (echoues === 0 ? "✅ " : "❌ ") + bilan;
})();