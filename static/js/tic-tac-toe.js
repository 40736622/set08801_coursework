const boardBtns = document.querySelectorAll(".box");
const announceWinner = document.getElementById("announce-winner");
let playerXWins = 0, playerOWins = 0, computerOWins = 0, ties = 0;
let xMoves = [], oMoves = [];
let turnO = false, gameOver = false;
let computerPlaying = false;

// TODO: - Add Visual and Audio cues
//       - Add localStorage functionality
//       - Add X, O and Tie counters
//       - Add slash if a win happened

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
            btn.textContent = "X";
            xMoves.push(btnValue);

            xWon = checkWin(xMoves, winningCombinations);

            if (xWon) {
                disableButtons(boardBtns);
                announceWinner.textContent = "X Wins!";
                console.log("X Wins!");
            }

            turnO = true;

        } else {
            btn.textContent = "O";
            oMoves.push(btnValue);

            oWon = checkWin(oMoves, winningCombinations);

            if (oWon) {
                disableButtons(boardBtns);
                announceWinner.textContent = "O Wins!";
                console.log("O Wins!");
            }

            turnO = false;
        }

        playAudio();
        btn.disabled = true;

        // Checks if the game ends in a tie
        if (checkBoardFull() && !xWon && !oWon) {
            announceWinner.textContent = "It's a Tie!"
            console.log("Tie!");
        }
    });
});

// TODO: - Add all game logic to this function
function startTicTacToe() {
    return;
}

// Reset after gameover
function resetTicTacToe() {
    xMoves = [];
    oMoves = [];
    turnO = false;

    enableButtons(boardBtns);
}

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

// Checks if all board button text content is filled
function checkBoardFull() {
    const boardBtnsArray = Array.from(boardBtns);
    return boardBtnsArray.every((btn) => ["X", "O"].includes(btn.textContent.trim()));
}

// Enable all board buttons and clear text content
function enableButtons(btnNodeList) {
    btnNodeList.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = "";
    });
}

// Disables all board buttons
function disableButtons(btnNodeList) {
    btnNodeList.forEach((btn) => {
        btn.disabled = true;
    });
}

function playAudio() {
    let sound = new Audio("static/audio/collect-ring.mp3");
    sound.play().catch(e => console.error('Playback error:', e));
}

function muteAudio() {
    // sound.muted = true;
    return;
}

function unMuteAudio() {
    return;
}

// TODO: Research minimax algorithm for 1P mode or use Math.Random to emulate a fake AI
function minimax() {
    return;
}