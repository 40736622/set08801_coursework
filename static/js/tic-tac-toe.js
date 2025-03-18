import { playAudio, toggleMute } from "./main.js";

// DOM Elements
const boardBtns = document.querySelectorAll(".box");
const announceCard = document.querySelector(".announce-card");
const closeAnnounceCardBtn = announceCard.querySelector(".btn-close");
const playAgainBtn = announceCard.querySelector(".btn-play-again");
const volumeIcon = document.querySelector(".volume-settings i");
const playerXWinsText = document.querySelector("#player-x-score");
const playerOWinsText = document.querySelector("#player-o-score");
const tiesText = document.querySelector("#tie-score");


// Game State
const soundPath = "static/audio/collect-ring.mp3";
let isMute = false;
let playerXWins = 0, playerOWins = 0, computerOWins = 0, ties = 0;
let xMoves = [], oMoves = [];
let turnO = false;
let computerPlaying = false;

// TODO: ✅ Add Visual and Audio cues
//       ✅ Add localStorage functionality
//       ✅ Structure code better
//       ✅ Add X, O and Tie counters
//       - Add slash/blinking for the winning combination * The blinking seems easier
//       ✅ Add reset game functionality
//       ✅ Add code comments

// All the possible winnning combinations for Tic-Tac-Toe based on button values
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

/**
 * Toggles volume mute/unmute.
 */
function toggleVolume() {
    isMute = !isMute;
    volumeIcon.classList.remove(isMute ? "bi-volume-up-fill" : "bi-volume-mute-fill");
    volumeIcon.classList.add(isMute ? "bi-volume-mute-fill" : "bi-volume-up-fill");
}

/**
 * Checks if all button elements on the board has an X or O text content to determine if the board is full.
 * @returns {boolean} If each button has an X or O for it's text content then it returns true, otherwise false.
 */
function isBoardFull() {
    const boardBtnsArray = Array.from(boardBtns);
    return boardBtnsArray.every((btn) => ["X", "O"].includes(btn.textContent.trim()));
}

/**
 * Enables all board buttons and resets their text content.
 */
function enableButtons() {
    boardBtns.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = "";
    });
}

/**
 * Disable all board buttons.
 */
function disableButtons() {
    boardBtns.forEach((btn) => {
        btn.disabled = true;
    });
}

/**
 * Checks to see if the collection of a specific player's move (X, O) contains a winning combination in order to end the game.
 * @param {Array} playerMoves - Contains the position of a player's moves on the board.
 * @param {Array} winningCombinations - Contains all the possible winning combinations to win a game.
 * @returns {boolean} It is true if a winning combination is found otherwise false.
 */
function checkWinner(playerMoves, winningCombinations) {
    let hasWon = false;
    for (const combination of winningCombinations) {
        if (combination.every((move) => playerMoves.includes(move))) {
            hasWon = true;
            break;
        }
    }
    return hasWon;
}

/**
 * Updates the DOM to display the game result, indicating whether player X or O won, or if it's a tie.
 * @param {boolean} xWon - Holds the win state of player X, either true or false.
 * @param {boolean} oWon - Holds the win state of player O, either true or false.
 */
function announceWinner(xWon, oWon) {
    const announceHeading = announceCard.querySelector(".announce-heading");
    const announceText = announceCard.querySelector(".announce-text");
    announceCard.classList.add("show");

    if (xWon) {
        announceHeading.textContent = "Congratulations!";
        announceText.textContent = "Player X won.";
    } else if (oWon) {
        announceHeading.textContent = "Congratulations!";
        announceText.textContent = "Player O won.";
    } else {
        announceHeading.textContent = "Too Bad!";
        announceText.textContent = "It's a tie.";
    }

    resultCounter(xWon, oWon);
    setTicTacToeLocalStorage(playerXWins, playerOWins, ties);
}

/**
 * Increments win result and updates the DOM to display the new scores.
 * @param {boolean} xWon - Holds the win state of player X, either true or false.
 * @param {boolean} oWon - Holds the win state of player O, either true or false.
 */
function resultCounter(xWon, oWon) {
    if (xWon) {
        playerXWins += 1;
        playerXWinsText.textContent = playerXWins;
    } else if (oWon) {
        playerOWins += 1;
        playerOWinsText.textContent = playerOWins;
    } else {
        ties += 1;
        tiesText.textContent = ties;
    }
}

/**
 * Handles board button clicks after a player has made a move.
 * @param {HTMLButtonElement} btn 
 */
function handleMoves(btn) {
    let btnValue = Number(btn.value); // Converting button value from a string to a number
    let xWon, oWon;

    if (!turnO) {
        btn.textContent = 'X';
        xMoves.push(btnValue);
        xWon = checkWinner(xMoves, winningCombinations);
        turnO = true;
    } else {
        btn.textContent = 'O';
        oMoves.push(btnValue);
        oWon = checkWinner(oMoves, winningCombinations);
        turnO = false;
    }

    btn.disabled = true;
    playAudio(soundPath, isMute);

    if (xWon || oWon) {
        announceWinner(xWon, oWon);
        disableButtons();
    } else if (isBoardFull() && !xWon && !oWon) {
        announceWinner(false, false);
    }
}

/**
 * Resets the Tic-Tac-Toe board to it's beginning state in order to start a new game.
 */
function resetGame() {
    xMoves = [];
    oMoves = [];
    turnO = false;

    announceCard.classList.remove("show");
    enableButtons();
}

/**
 * Sets Tic-Tac-Toe scores within Local Storage.
 * @param {Number} xWins - Represents the total number of player X wins.
 * @param {Number} oWins - Represents the total number of player O wins.
 * @param {Number} ties  - Represents the total number of ties.
 */
function setTicTacToeLocalStorage(xWins, oWins, ties) {
    const ticTacToeScores = JSON.stringify({ "playerXWins": xWins, "playerOWins": oWins, "ties": ties });
    localStorage.setItem("ticTacToe", ticTacToeScores);
}

/**
 * 
 * @returns Object representation of Tic-Tic-Toe scores from Local Storage.
 */
function getTicTacToeLocalStorage() {
    return JSON.parse(localStorage.getItem("ticTacToe"));
}

/**
 * Deletes all Tic-Tac-Toe scores from Local Storage.
 */
function removeTicTacToeLocalStorage() {
    localStorage.removeItem("ticTacToe");
}

/**
 * Updates all score variables and DOM displays by fetching the data from Local Storage.
 */
function updateScores() {
    const scores = getTicTacToeLocalStorage();

    if (scores) {
        playerXWins = scores["playerXWins"];
        playerOWins = scores["playerOWins"];
        ties = scores["ties"];
    
        playerXWinsText.textContent = playerXWins;
        playerOWinsText.textContent = playerOWins;
        tiesText.textContent = ties;
    }
}

// TODO: Use Math.Random to emulate a fake AI
function computerPlays() {
    return;
}

updateScores();
boardBtns.forEach((btn) => btn.addEventListener("click", () => handleMoves(btn)));
volumeIcon.addEventListener("click", toggleVolume);
playAgainBtn.addEventListener("click", resetGame);
closeAnnounceCardBtn.addEventListener("click", () => announceCard.classList.remove("show"));