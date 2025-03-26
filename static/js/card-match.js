// DOM Elements
const cards = document.querySelectorAll(".card");
const pairsLeftText = document.getElementById("pairs-left");
const timerText = document.getElementById("timer");
const bestTimeText = document.getElementById("best-time");
const dialog = document.querySelector(".announce-card");
const diaglogPlayAgainBtn = dialog.querySelector(".btn-play-again");
const dialogCloseBtn = dialog.querySelector(".btn-close");

// Game State
const emojis = ["😊", "🙃", "😢", "🙌", "💀", "🤖", "🐺", "🐸", "😊", "🙃", "😢", "🙌", "💀", "🤖", "🐺", "🐸"];
let holdPair = [];
const MAX_PAIRS = 8;
let pairsGotten = 0;
let intervalStarted = false;
let timer;
let gameStartTime;
let seconds = 0;
let shuffledEmojis = shuffleArray(emojis);

// TODO: ✅ Add timer
//       Add audio functionality
//       ✅ Show remaining pairs left
//       ✅ Add localStorage functionality with best time saved
//       ✅ Add code comments

// Fisher-Yates Sorting Algorithm
// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
/**
 * Randomly shuffles an array.
 * @param {Array} arr - Holds elements to be shuffled.
 * @returns Shuffled array.
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Flips the card to face upward or downward.
 * @param {boolean} isFlipped - Tells if the card is facing upward.
 * @param {HTMLElement} card - Represents clicked card.
 * @param {HTMLSpanElement} cardSpan - Represents span element of the card.
 */
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

/**
 * Checks if a pair of cards are the same.
 * @param {NodeListOf<HTMLElement>} cards - Holds a pair of cards. 
 */
function checkPair(cards) {
    const [card1, card2] = cards;
    if (card1.querySelector("span").textContent === card2.querySelector("span").textContent) {
        pairsGotten++;
        pairsLeftText.textContent = MAX_PAIRS - pairsGotten;
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

/**
 * Shows the announcement dialog to display the game result.
 */
function announceResult() {
    const announceHeading = dialog.querySelector(".announce-heading");
    const announceText = dialog.querySelector(".announce-text");
    announceHeading.textContent = "Congratulations!";
    announceText.textContent = "You got all the pairs";

    setTimeout(() => {
        dialog.showModal(); // Open dialog
    }, 750);
}

/**
 * Resets the entire game to start a new round.
 */
function resetGame() {
    holdPair = [];
    pairsGotten = 0;
    pairsLeftText.textContent = MAX_PAIRS;
    bestTime = 0;
    seconds = 0;
    timerText.textContent = "0:00";
    shuffledEmojis = shuffleArray(emojis);
    intervalStarted = false;

    cards.forEach((card, index) => {
        card.classList.add("card-flip");

        setTimeout(() => {
            card.classList.remove("card-flip");
        }, 200);

        card.dataset.flipped = "false";
        const cardSpan = card.querySelector("span");
        cardSpan.style.visibility = "hidden";
        card.style.backgroundColor = "#181825";
        cardSpan.textContent = shuffledEmojis[index];
    });

    dialog.close();
}

/**
 * 
 * @param {Number} seconds - time duration in seconds
 * @returns {String} formatted string to represent time in MM:SS 
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

/**
 * Sets Card Match best time within Local Storage.
 * @param {Number} gameDuration - Represents the game duration.
 */
function setCardMatchLocalStorage(gameDuration) {
    const lastSavedBestTime = getCardMatchLocalStorage();
    const bestTime = lastSavedBestTime.bestTime ?? Infinity;

    if (gameDuration < bestTime) {
        const bestTime = JSON.stringify({ "bestTime": gameDuration });
        localStorage.setItem("cardMatch", bestTime);
    }
}

/**
 * 
 * @returns Object representation of Card Match best time from Local Storage.
 */
function getCardMatchLocalStorage() {
    const storedData = localStorage.getItem("cardMatch");
    return storedData ? JSON.parse(storedData) : { bestTime: null };
}

/**
 * Deletes Card Match data from Local Storage. Mostly used for debugging.
 */
function removeCardMatchLocalStorage() {
    localStorage.removeItem("cardMatch");
}

/**
 * Updates the display for the Best Time text by retreiving it from the local storage.
 */
function updateBestTime() {
    const lastBestTime = getCardMatchLocalStorage();

    if (lastBestTime) {
        bestTimeText.textContent = formatTime(lastBestTime.bestTime);
    }
}

// Handles all game logic 
cards.forEach((card, index) => {
    card.dataset.flipped = "false";
    const cardSpan = card.querySelector("span");
    cardSpan.textContent = shuffledEmojis[index];

    card.addEventListener("click", () => {
        if (holdPair.length === 2 || card.dataset.flipped === "true") return; // Prevent more than 2 flips

        if (!intervalStarted) {
            intervalStarted = true;
            gameStartTime = new Date().getTime();
            // Start timer
            timer = setInterval(() => {
                seconds++;
                timerText.textContent = formatTime(seconds);
            }, 1000);
        }

        card.classList.add("card-flip");

        setTimeout(() => {
            card.classList.remove("card-flip");
        }, 200);

        changeFlipState(false, card, cardSpan);
        holdPair.push(card);

        if (holdPair.length === 2) {
            // Use timeout so both cards are seen before flipping
            setTimeout(() => {
                checkPair(holdPair);
                holdPair = [];

                if (pairsGotten === MAX_PAIRS) {
                    const gameEndTime = new Date().getTime()
                    const gameDuration = Math.floor((gameEndTime - gameStartTime) / 1000);  // Calculate duration of the game for more accurate time
                    setCardMatchLocalStorage(gameDuration);
                    updateBestTime();
                    clearInterval(timer); // Stop timer
                    announceResult();
                }
            }, 700);
        }
    });
});

//removeCardMatchLocalStorage();
updateBestTime();
diaglogPlayAgainBtn.addEventListener("click", resetGame); // Close dialog and start a new game
dialogCloseBtn.addEventListener("click", () => dialog.close()); // Close dialog