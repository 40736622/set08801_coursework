import { playAudio, toggleMute } from "./main.js";

// DOM Elements
const boardBtns = document.querySelectorAll(".box");
const dialog = document.querySelector("dialog");
const diaglogPlayAgainBtn = dialog.querySelector(".btn-play-again");
const dialogCloseBtn = dialog.querySelector(".btn-close");
const playerSettings = document.querySelector(".player-settings");
const volumeIcon = document.querySelector(".volume-settings i");
const playerXWinsText = document.querySelector("#player-x-score");
const playerOWinsText = document.querySelector("#player-o-score");
const tiesText = document.querySelector("#tie-score");

// Game State
const soundPath = "../static/audio/collect-ring.mp3";
let isMute = false;
let playerXWins = 0, playerOWins = 0, ties = 0;
let xMoves = [], oMoves = [];
let turnO = false;
let computerPlaying = true;

// TODO: ✅ Add Visual and Audio cues
//       ✅ Add localStorage functionality
//       ✅ Structure code better
//       ✅ Add X, O and Tie counters
//       ✅ Add blinking for the winning combination
//       ✅ Change popup to a dialog in html and javascript
//       ✅ Add reset game functionality
//       ✅ Add code comments
//       ✅ Fix HTML page to have proper HTML Semantics
//       ✅ Fix box blinking, only make it trigger for the button text (probably need to add a span element for each button).

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
 * Toggles between 1 or 2 player mode.
 */
function toggleComputerPlaying() {
    const playerIcon = playerSettings.querySelector("i");
    const playerCount = playerSettings.querySelector("p");
    resetGame();

    if (computerPlaying) {
        playerIcon.classList.remove("bi-person-fill");
        playerIcon.classList.add("bi-people-fill");
        playerCount.textContent = "2P";
        computerPlaying = false;
    } else {
        playerIcon.classList.remove("bi-people-fill");
        playerIcon.classList.add("bi-person-fill");
        playerCount.textContent = "1P";
        computerPlaying = true;
    }
}

/**
 * Checks if all button elements on the board has an X or O text content to determine if the board is full.
 * @returns {boolean} If each button has an X or O for it's text content then it returns true, otherwise false.
 */
function isBoardFull() {
    const boardBtnsArray = Array.from(boardBtns);
    return boardBtnsArray.every((btn) => ['X', 'O'].includes(btn.textContent.trim()));
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
    let winningMoves
    for (const combination of winningCombinations) {
        if (combination.every((move) => playerMoves.includes(move))) {
            hasWon = true;
            winningMoves = combination;
            break;
        }
    }

    return [hasWon, winningMoves];
}

/**
 * Shows the announcement dialog to display the game result, indicating whether player X or O won, or if it's a tie.
 * @param {boolean} xWon - Holds the win state of player X, either true or false.
 * @param {boolean} oWon - Holds the win state of player O, either true or false.
 */
function announceWinner(xWon, oWon) {
    const announceHeading = dialog.querySelector(".announce-heading");
    const announceText = dialog.querySelector(".announce-text");

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

    scoreCounter(xWon, oWon);
    setTicTacToeLocalStorage(playerXWins, playerOWins, ties);

    setTimeout(() => {
        dialog.showModal(); // Open dialog
    }, 750); 
}

/**
 * Increments win result and updates the DOM to display the new scores.
 * @param {boolean} xWon - Holds the win state of player X, either true or false.
 * @param {boolean} oWon - Holds the win state of player O, either true or false.
 */
function scoreCounter(xWon, oWon) {
    if (xWon) {
        playerXWins++;
        playerXWinsText.textContent = playerXWins;
    } else if (oWon) {
        playerOWins++;
        playerOWinsText.textContent = playerOWins;
    } else {
        ties++;
        tiesText.textContent = ties;
    }
}

/**
 * Triggers blinking animation based on win state (player X or O win, tie).
 * @param {NodeListOf<HTMLButtonElement>} boardBoxes - Board buttons
 */
function triggerBoxBlinking(boardBoxes) {
    boardBoxes.forEach((box) => {
        box.classList.add("blinking-move");
    });

    setTimeout(() => {
        boardBoxes.forEach((box) => {
            box.classList.remove("blinking-move");
        });
    }, 500);
}

/**
 * Handles board button clicks after a player has made a move.
 * @param {HTMLButtonElement} btn 
 */
function handleMoves(btn) {
    const btnValue = Number(btn.value); // Converting button value to a number
    let xWon, oWon;
    let winningMoves;

    if (!turnO) {
        btn.textContent = 'X';
        xMoves.push(btnValue);
        [xWon, winningMoves] = checkWinner(xMoves, winningCombinations);
        turnO = true;
    } else {
        btn.textContent = 'O';
        oMoves.push(btnValue);
        [oWon, winningMoves] = checkWinner(oMoves, winningCombinations);
        turnO = false;
    }

    btn.disabled = true;
    playAudio(soundPath, isMute);

    if (xWon || oWon) {
        disableButtons();
        const winningBoxes = winningMoves.map(index => boardBtns[index]);
        triggerBoxBlinking(winningBoxes);
        announceWinner(xWon, oWon);
    } else if (isBoardFull() && !xWon && !oWon) {
        triggerBoxBlinking(boardBtns);
        announceWinner(false, false);
    }

    if (computerPlaying && turnO && !xWon && !oWon) {
        setTimeout(() => {
            triggerComputerMove();
        }, 300);
    }
}

/**
 * Clears the game board to start a new game.
 */
function resetGame() {
    xMoves = [];
    oMoves = [];
    turnO = false;

    dialog.close();
    enableButtons();
}

/**
 * Saves Tic-Tac-Toe scores within Local Storage.
 * @param {Number} xWins - Represents the total number of player X wins.
 * @param {Number} oWins - Represents the total number of player O wins.
 * @param {Number} ties  - Represents the total number of ties.
 */
function setTicTacToeLocalStorage(xWins, oWins, ties) {
    const scores = JSON.stringify({ "playerXWins": xWins, "playerOWins": oWins, "ties": ties });
    localStorage.setItem("ticTacToe", scores);
}

/**
 * 
 * @returns Object representation of Tic-Tic-Toe scores from Local Storage.
 */
function getTicTacToeLocalStorage() {
    return JSON.parse(localStorage.getItem("ticTacToe"));
}

/**
 * Deletes all Tic-Tac-Toe scores from Local Storage. Mostly used for debugging.
 */
function removeTicTacToeLocalStorage() {
    localStorage.removeItem("ticTacToe");
}

/**
 * Updates all score variables and displays them by fetching the data from Local Storage.
 */
function updateScores() {
    const scores = getTicTacToeLocalStorage();

    if (scores) {
        playerXWins = scores.playerXWins ?? 0;
        playerOWins = scores.playerOWins ?? 0;
        ties = scores.ties ?? 0;

        playerXWinsText.textContent = playerXWins;
        playerOWinsText.textContent = playerOWins;
        tiesText.textContent = ties;
    }
}

/**
 * Simulates a random button click for the computer's move.
 */
function triggerComputerMove() {
    const allMoves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const playedMoves = [...xMoves, ...oMoves];
    const remainingMoves = allMoves.filter((move) => !playedMoves.includes(move));

    if (remainingMoves.length === 0) return;

    const computerMove = remainingMoves[Math.floor(Math.random() * remainingMoves.length)]; // Select a random move
    boardBtns[computerMove].click();
}

// removeTicTacToeLocalStorage();
updateScores();
boardBtns.forEach((btn) => btn.addEventListener("click", () => handleMoves(btn)));
playerSettings.addEventListener("click", toggleComputerPlaying);
volumeIcon.addEventListener("click", toggleVolume);
diaglogPlayAgainBtn.addEventListener("click", resetGame); // Close dialog and start a new game
dialogCloseBtn.addEventListener("click", () => dialog.close()); // Close dialog