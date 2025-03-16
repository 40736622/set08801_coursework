import { playAudio, muteAudio, unMuteAudio } from "./main.js";

const boardBtns = document.querySelectorAll(".box");
const announceCard = document.querySelector(".announce-card");
const closeAnnounceCardBtn = announceCard.querySelector(".btn-close");
const playAgainBtn = announceCard.querySelector(".btn-play-again");
const soundPath = "static/audio/collect-ring.mp3";
let playerXWins = 0, playerOWins = 0, computerOWins = 0, ties = 0;
let xMoves = [], oMoves = [];
let turnO = false, gameOver = false;
let computerPlaying = false;

// TODO: - Add Visual and Audio cues
//       - Add localStorage functionality
//       ✅ Add X, O and Tie counters
//       - Add slash/blinking for the winning combination * The blinking seems easier
//       ✅ Add reset game functionality
//       - Add code comments

// All the possible winnning combinations for Tic-Tac-Toe 
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

boardBtns.forEach(function (btn) {
    btn.addEventListener("click", () => {
        let btnValue = Math.floor(Number(btn.value)); // Converting btn value from string to number
        let xWon, oWon;

        if (!turnO) {
            btn.textContent = 'X';
            xMoves.push(btnValue);

            xWon = checkWin(xMoves, winningCombinations);

            if (xWon) {
                disableButtons(boardBtns);
                announceWinner.textContent = "X Wins!";
                //console.log("X Wins!");
            }

            turnO = true;

        } else {
            btn.textContent = 'O';
            oMoves.push(btnValue);

            oWon = checkWin(oMoves, winningCombinations);

            if (oWon) {
                disableButtons(boardBtns);
                announceWinner.textContent = "O Wins!";
                //console.log("O Wins!");
            }

            turnO = false;
        }

        playAudio(soundPath);
        btn.disabled = true;

        // announceWinner(xWon, oWon); // FIXME - Only make this get called if a winning combination is on the board or a tie occurs

        // Checks if the game ends in a tie
        if (checkBoardFull() && !xWon && !oWon) {
            announceWinner.textContent = "It's a Tie!"
            //console.log("Tie!");
        }
    });
});

// TODO: - Add all game logic to this function
function startTicTacToe() {
    return;
}

/**
 * Resets the Tic-Tac-Toe board to it's beginning state in order to start a new game.
 */
function resetTicTacToe() {
    xMoves = [];
    oMoves = [];
    turnO = false;

    enableButtons(boardBtns);
}

/**
 * Checks to see if the collection of a specific player's move (X, O) contains a winning combination in order to end the game.
 * @param {Array} playerMoves - Contains the position of a player's moves on the board.
 * @param {Array} winningCombinations - Contains all the possible winning combinations to win a game.
 * @returns {boolean} It is true if a winning combination is found otherwise false.
 */

function checkWin(playerMoves, winningCombinations) {
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
 * Updates the DOM to display the game result, indicating whether player X or O won, or if it's a tie
 * @param {boolean} xWon Holds the win state of player X, either true or false.
 * @param {boolean} oWon Holds the win state of player O, either true or false.
 */
function announceWinner(xWon, oWon) {
    const announceHeading = announceCard.querySelector(".announce-heading");
    const announceText = announceCard.querySelector(".announce-text");
    announceCard.classList.add("show");

    if (xWon) {
        announceHeading.textContent = "Congratulations!!!!";
        announceText.textContent = "Player X won.";
    } else if (oWon) {
        announceHeading.textContent = "Congratulations!!!!";
        announceText.textContent = "Player O won.";
    } else if (!xWon && !oWon) {
        announceHeading.textContent = "Too Bad!!!!";
        announceText.textContent = "It's a tie.";
    }
}

closeAnnounceCardBtn.addEventListener("click", () => {
    announceCard.classList.remove("show");
});

playAgainBtn.addEventListener("click", () => {
    announceCard.classList.remove("show");
    resetTicTacToe();
})

function resultCounter(xWon, oWon) {
    if (xWon) {
        playerXWins += 1;
    } else if (oWon) {
        playerOWins += 1;
    } else if (!xWon && !oWon) {
        ties += 1;
    }
}

/**
 * Checks if all button elements on the board has an X or O text content to determine if the board is full.
 * @returns {boolean} If each button has an X or O for it's text content then it returns true, otherwise false.
 */
function checkBoardFull() {
    const boardBtnsArray = Array.from(boardBtns);
    return boardBtnsArray.every((btn) => ["X", "O"].includes(btn.textContent.trim()));
}

/**
 * Enables all board buttons and resets their text content.
 * @param {NodeListOf<HTMLButtonElement>} btnNodeList - Holds the button elements that represent each box on the board.
 */
function enableButtons(btnNodeList) {
    btnNodeList.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = "";
    });
}

/**
 * Disable all board buttons.
 * @param {NodeListOf<HTMLButtonElement>} btnNodeList - Holds the button elements that represent each box on the board.
 */
function disableButtons(btnNodeList) {
    btnNodeList.forEach((btn) => {
        btn.disabled = true;
    });
}

// function playAudio() {
//     let sound = new Audio("static/audio/collect-ring.mp3");
//     sound.play().catch(e => console.error('Playback error:', e));
// }

// function setStorage(xWins, oWins, ties) {
//     localStorage.setItem("playerXWins", xWins);
//     localStorage.setItem("playerOWins", oWins);
//     localStorage.setItem("ties", ties);
// }

// TODO: Research minimax algorithm for 1P mode or use Math.Random to emulate a fake AI
function minimax() {
    return;
}