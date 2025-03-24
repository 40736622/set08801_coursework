// DOM Elements
const cards = document.querySelectorAll(".card");

// Game State
const emojis = ["😊", "🙃", "😢", "🙌", "💀", "🤖", "🐺", "🐸", "😊", "🙃", "😢", "🙌", "💀", "🤖", "🐺", "🐸"];
let holdPair = [];
let pairsGotten = 0;
let bestTime = 0;
let shuffledEmojis = shuffleArray(emojis);

// Fisher-Yates Sorting Algorithm
// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

cards.forEach((card, index) => {
    card.dataset.flipped = "false";
    const cardSpan = card.querySelector("span");
    cardSpan.textContent = shuffledEmojis[index];

    card.addEventListener("click", (e) => {
        if (holdPair.length === 2 || card.dataset.flipped === "true") return; // Prevent more than 2 flips

        card.classList.add("card-flip");

        setTimeout(() => {
            card.classList.remove("card-flip");
        }, 200);

        changeFlipState(false, card, cardSpan); // Flip the card
        holdPair.push(card);

        if (holdPair.length === 2) {
            // Use time out so that you can see the second card before the it flips both
            setTimeout(() => {
                checkPair(holdPair);
                holdPair = [];

                if (pairsGotten === 8) {
                    console.log("Congraturlation, you won!");
                }
            }, 700);
        }
    });
});

function changeFlipState(isFlipped, card, cardSpan) {
    if (!isFlipped) {
        cardSpan.style.visibility = "visible";
        card.style.backgroundColor = "white";
        card.dataset.flipped = "true";
    } else {
        cardSpan.style.visibility = "hidden";
        card.style.backgroundColor = "#181825";
        card.dataset.flipped = "false";
    }
}

function checkPair(cards) {
    const [card1, card2] = cards;
    if (card1.querySelector("span").textContent === card2.querySelector("span").textContent) {
        pairsGotten++;
    } else {
        card1.classList.add("card-flip");
        card2.classList.add("card-flip");

        setTimeout(() => {
            card1.classList.remove("card-flip");
            card2.classList.remove("card-flip");
        }, 200);

        changeFlipState(true, card1, card1.querySelector("span"));
        changeFlipState(true, card2, card2.querySelector("span"));
    }
}

function resetGame() {
    holdPair = [];
    pairsGotten = 0;
    bestTime = 0;
    shuffledEmojis = shuffleArray(emojis);

    cards.forEach((card, index) => {
        card.classList.add("card-flip");

        setTimeout(() => {
            card.classList.remove("card-flip");
        }, 200);

        card.dataset.flipped = "false";
        const cardSpan = card.querySelector("span");
        cardSpan.textContent = shuffledEmojis[index];
    });
    return;
}