const bonneReponse = "Baiser"; // Nom à deviner

const delaiMinutes = 1380;
const delaiMillisecondes = delaiMinutes * 60 * 1000;

var casesBlocked = localStorage.getItem("casesBlocked")
if (casesBlocked === null) {
    casesBlocked = false;
}
console.log("casesBlockes :", casesBlocked);

const message = document.getElementById("message");
const bouton = document.querySelector("button");
const champTexte = document.getElementById("reponse");
const overlay = document.querySelector('.overlay');

// Paramètres configurables
const cols = 15;
const rows = 20;

var clearCases = JSON.parse(localStorage.getItem("clearCases"));
if (Array.isArray(clearCases)) {
    console.log(clearCases)
} else {
    clearCases = [];
}

overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

// Créer tous les carrés
const totalSquares = cols * rows;
const squares = []; // Pour garder une référence à tous les carrés

for (let i = 0; i < totalSquares; i++) {
  const square = document.createElement('div');

  if (clearCases.includes(i)) {
    square.style.opacity = 0;
    square.style.pointerEvents = "none";
  }

  square.addEventListener('click', () => {
    // Si le carré est déjà désactivé, on ignore le clic
    if (square.classList.contains('disabled')) return;

    // On dévoile ce carré
    square.style.opacity = 0;
    square.style.pointerEvents = "none";
    clearCases.push(i)
    console.log(clearCases)
    localStorage.setItem("clearCases", JSON.stringify(clearCases));

    // On désactive tous les autres carrés
    squares.forEach(sq => {
      sq.classList.add('disabled');
      sq.style.pointerEvents = "none";
      sq.style.opacity = sq.style.opacity || 1; // garde visibles les carrés non cliqués
    });
    localStorage.setItem("casesBlocked", "true");

  });

  overlay.appendChild(square);
  squares.push(square);
}

function verifierReponse() {
    const maintenant = new Date().getTime();
    const dernierEssai = localStorage.getItem("dernierEssai");

    if (dernierEssai && maintenant - dernierEssai < delaiMillisecondes) {
        // Tentative trop tôt
        return;
    }

    const userInput = champTexte.value.trim();
    localStorage.setItem("dernierEssai", maintenant);

    if (userInput.toLowerCase() === bonneReponse.toLowerCase()) {
        message.textContent = "✅ Bravo ! Bonne réponse.";
        message.style.color = "green";
        squares.forEach(sq => {
            sq.style.opacity = 0;
            sq.style.pointerEvents = "none";
        })
        localStorage.clear();
    } else {
        message.textContent = "❌ Mauvaise réponse. Réessaie dans "+delaiMinutes+" minutes.";
        message.style.color = "red";
        // Bloquer les interactions et lancer le compte à rebours
        bloquerTentative();
    }
}

function bloquerTentative() {
    console.log("bloquerTentative");
    bouton.disabled = true;
    champTexte.disabled = true;

    squares.forEach(sq => {
        sq.style.pointerEvents = "none";
    })

    const dernierEssai = localStorage.getItem("dernierEssai");
    const targetTime = parseInt(dernierEssai) + delaiMillisecondes;

    const interval = setInterval(() => {
        const maintenant = new Date().getTime();
        const tempsRestant = targetTime - maintenant;

        if (tempsRestant <= 0) {
            console.log("resetTentative");
            clearInterval(interval);
            bouton.disabled = false;
            champTexte.disabled = false;

            squares.forEach(sq => {
                if (sq.style.opacity != 0) { // Ne pas réactiver ceux déjà révélés
                sq.classList.remove('disabled');
                sq.style.pointerEvents = "auto";
                }
            })
            localStorage.setItem("casesBlocked", "false");

            message.textContent = "Vous pouvez réessayer maintenant.";
            message.style.color = "green";
            return;
        }

        const minutes = Math.floor(tempsRestant / 60000);
        const secondes = Math.floor((tempsRestant % 60000) / 1000);

        message.textContent = `⏳ Réessayez dans ${minutes}m ${secondes}s`;
        message.style.color = "orange";
    }, 1000);
}

// Vérifie à l'ouverture de la page s'il faut bloquer
window.onload = () => {
    const dernierEssai = localStorage.getItem("dernierEssai");
    const maintenant = new Date().getTime();

    if (dernierEssai && maintenant - dernierEssai < delaiMillisecondes) {
        bloquerTentative();
    }
};