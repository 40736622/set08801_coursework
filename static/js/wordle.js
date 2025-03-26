// DOM Elements
const keyboardBtns = document.querySelectorAll(".btn");
const rows = document.querySelectorAll(".row");
let activeRow = document.querySelector(".row-active");
const dailyStreakText = document.querySelector("#daily-streak");
const audioIcon = document.querySelector(".volume-settings i");
const dialog = document.querySelector("dialog");
const diaglogPlayAgainBtn = dialog.querySelector(".btn-play-again");
const dialogCloseBtn = dialog.querySelector(".btn-close");

// Board Colors
const boxColors = {
    default: "#e6e9ef",
    correct: "#a6e3a1",
    incorrect: "#585b70",
    misplaced: "#f9e2af"
};

// Game State
const MAX_ATTEMPTS = 6;
let currentBoxIndex = 0;

let gameState = {
    status: "in_progress",
    secretWord: "",
    currentGuess: "",
    currentAttempt: 1,
    guesses: [],
    letterEvaluations: [],
    dailyStreak: 0,
    lastDateStreakRecorded: null
};

// BUG: - When Ctrl + Shift + {Letter} is pressed then it registers on the board when it shouldn't

// TODO: ✅ Make the keyboard on the website work 
//       ✅ Add play again functionality (reset board and choose another secret word)
//       ✅ Add streak and date refresh
//       ✅ Also make the streak work with localStorage
//       ✅ Fix localStorage streak date reset bug
//       - Add audio functionality
//       - Add code comments
//       - Change keyboard section back into button tags instead of divs
//       ✅ Recheck if I have HTML semantics set properly

/**
 * Get all boxes from the active row.
 * @returns Node list of divs with css box class.
 */
function getActiveBoxes() {
    return activeRow.querySelectorAll(".box");
}

let activeBoxes = getActiveBoxes();

/**
 * Triggers flipping animation.
 * @param {NodeListOf<HTMLDivElement>} rowBoxes - Boxes for a single row.
 */
function triggerBoxFlipping(rowBoxes) {
    rowBoxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.add("box-flipping");
        }, index * 200);

    });

    setTimeout(() => {
        rowBoxes.forEach((box) => {
            box.classList.remove("box-flipping");
        });
    }, 2000);
}

function announceResult() {
    const announceHeading = dialog.querySelector(".announce-heading");
    const announceText = dialog.querySelector(".announce-text");

    if (gameState.status === "won") {
        announceHeading.textContent = "Congratulations!";
        announceText.textContent = "You got the right word.";
    } else {
        announceHeading.textContent = "Too Bad!";
        announceText.textContent = `The word was ${gameState.secretWord.toUpperCase()}.`;
    }

    setTimeout(() => {
        dialog.showModal(); // Open dialog
    }, 2200);
}
/* ------------------ Game Logic -----------------------*/
function submitGuessWord() {
    activeBoxes.forEach((box) => gameState.currentGuess += box.textContent.toLowerCase());

    if (gameState.currentGuess.length < 5) {
        alert("Word is too short!");
        gameState.currentGuess = "";
        return;
    }

    gameState.guesses.push(gameState.currentGuess);
    checkLetters();
    triggerBoxFlipping(activeBoxes);

    if (checkGuessWord()) {
        stopInput();
        gameState.status = "won";
        gameState.lastDateStreakRecorded = new Date().getDate();
        incrementDailyStreak();
        announceResult();
    } else {
        if (gameState.currentAttempt < 6) {
            gameState.currentAttempt++;

            changeActiveRow();

            // Reset current guess word
            gameState.currentGuess = "";
        } else {
            stopInput();
            gameState.status = "lost";
            gameState.lastDateStreakRecorded = new Date().getDate();
            announceResult();
        }
    }

    setWordleLocalStorage();
}

/**
 * Clears the text for each active box.
 */
function deleteLetter() {
    if (currentBoxIndex > 0) {
        currentBoxIndex--;
        activeBoxes[currentBoxIndex].textContent = "";
    }
}

/**
 * Callback function to be used with input event listeners.
 * @param {KeyboardEvent | MouseEvent} e - Event object from a keydown or click event.
 */
const handleInputCallback = (e) => {
    handleInput(e.key || e.target.textContent);
}

/**
 * Start event listeners for keyboard inputs.
 */
function startInput() {
    document.addEventListener("keydown", handleInputCallback);
    keyboardBtns.forEach((btn) => {
        btn.addEventListener("click", handleInputCallback);
    });
}

/**
 * Stop event listeners for keyboard inputs.
 */
function stopInput() {
    document.removeEventListener("keydown", handleInputCallback);

    keyboardBtns.forEach((btn) => {
        btn.removeEventListener("click", handleInputCallback);
    });
}

function handleInput(input) {
    if (input === "Enter") {
        submitGuessWord();
    }

    if (input === "Backspace" || input === "Del") {
        deleteLetter();
    }

    // Checks if the input is a letter using regex
    if (input.match(/^[a-zA-Z]$/g)) {
        if (currentBoxIndex < 5) {
            activeBoxes[currentBoxIndex].textContent = input.toUpperCase();
            currentBoxIndex++;
        }
    }
}

function checkLetters() {
    let letterEvaluations = Array(5).fill("");
    let secretWordLetters = gameState.secretWord.split("");
    let guessWordLetters = gameState.currentGuess.split("");

    for (let i = 0; i < guessWordLetters.length; i++) {
        if (guessWordLetters[i] === secretWordLetters[i]) {
            letterEvaluations[i] = "correct"
            secretWordLetters[i] = "";
            guessWordLetters[i] = "";
        }
    }

    for (let i = 0; i < guessWordLetters.length; i++) {
        if (!guessWordLetters[i]) continue;
        const index = secretWordLetters.indexOf(guessWordLetters[i]);
        if (index !== -1) {
            letterEvaluations[i] = "misplaced";
            secretWordLetters[index] = ""
        }
    }

    letterEvaluations.forEach((element, index) => {
        if (element === "") {
            letterEvaluations[index] = "incorrect";
        }
    });

    gameState.letterEvaluations.push(letterEvaluations);
    changeBoxColor(letterEvaluations, activeBoxes);
}

/**
 * Changes colors for each active row box depending on letter evaluations
 * @param {Array} letterEvaluations Holds evaluations for each letter of the current guess word.
 */
function changeBoxColor(letterEvaluations, rowBoxes) {
    for (let i = 0; i < letterEvaluations.length; i++) {
        if (letterEvaluations[i] === "correct") {
            rowBoxes[i].style.backgroundColor = boxColors.correct;
        } else if (letterEvaluations[i] === "misplaced") {
            rowBoxes[i].style.backgroundColor = boxColors.misplaced;
        } else {
            rowBoxes[i].style.backgroundColor = boxColors.incorrect;
        }
    }
}

/**
 * Checks if current guess and secret word are the same.
 * @returns {boolean} Result if current guess matches the secret wordle word.
 */
function checkGuessWord() {
    return gameState.currentGuess === gameState.secretWord;
}

/**
 * Increments daily streak and updates the text display.
 */
function incrementDailyStreak() {
    gameState.dailyStreak++;
    dailyStreakText.textContent = gameState.dailyStreak;
}

/**
 * Fetches local JSON file with Wordle word list.
 * @returns JSON response of Wordle word list.
 */
async function getWordleWords() {
    const jsonUrl = "http://127.0.0.1:5500/static/wordle.json"
    try {
        const response = await fetch(jsonUrl); // JSON file taken from: https://gist.github.com/mrhead/f0ced2726394588e8d9863e0568b6473
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

async function getRandomWord() {
    words = await getWordleWords();

    if (words.length > 0) {
        return words[Math.floor(Math.random() * words.length)];
    }
}

async function startWordleGame() {
    gameState.secretWord = await getRandomWord();
    /*console.log(gameState.secretWord);*/
}

async function resetWordleGame() {
    gameState.secretWord = await getRandomWord();
    /*console.log(gameState.secretWord);*/
    gameState.status = "in_progress";
    gameState.currentGuess = "";
    gameState.currentAttempt = 1;
    gameState.guesses = [];
    gameState.letterEvaluations = [];

    // Reset input to start at the first row
    changeActiveRow();

    // Clear game board text and set default color
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
        box.textContent = "";
        box.style.backgroundColor = boxColors.default;
    });

    dialog.close();
    startInput();
}

function setWordleLocalStorage() {
    localStorage.setItem("wordle", JSON.stringify(gameState));
}

function getWordleLocalStorage() {
    return JSON.parse(localStorage.getItem("wordle"));
}

function removeWordleLocalStorage() {
    localStorage.removeItem("wordle");
}

function updateDailyStreak() {
    const lastSavedGameState = getWordleLocalStorage();
    if (lastSavedGameState) {
        gameState.dailyStreak = lastSavedGameState.dailyStreak ?? 0;
        dailyStreakText.textContent = gameState.dailyStreak;
    }
}

function changeActiveRow() {
    currentBoxIndex = 0;
    activeRow.classList.remove("row-active");
    activeRow = rows[gameState.currentAttempt - 1];
    activeRow.classList.add("row-active");
    activeBoxes = getActiveBoxes();
}

function restoreGameState() {
    const lastSavedGameState = getWordleLocalStorage();

    if (lastSavedGameState && lastSavedGameState.status === "in_progress" && lastSavedGameState.currentAttempt > 1) {
        gameState = lastSavedGameState;
        /*console.log(gameState.secretWord);*/

        // Reset input to start at the first row
        changeActiveRow();

        for (let i = 0; i < gameState.guesses.length; i++) {
            const boxes = rows[i].querySelectorAll(".box");
            changeBoxColor(gameState.letterEvaluations[i], boxes);

            for (let j = 0; j < gameState.guesses[i].length; j++) {
                boxes[j].textContent = gameState.guesses[i][j].toUpperCase();
            }
        }
    } else {
        startWordleGame();
    }
}

function resetDailyStreak() {
    const lastSavedGameState = getWordleLocalStorage();
    if (lastSavedGameState && lastSavedGameState.lastDateStreakRecorded !== new Date().getDate()) {
        gameState.lastDateStreakRecorded = null;
        gameState.dailyStreak = 0;
        setWordleLocalStorage(gameState);
    }
}

restoreGameState();
resetDailyStreak();
updateDailyStreak();
startInput();

diaglogPlayAgainBtn.addEventListener("click", resetWordleGame); // Close dialog and start a new game
dialogCloseBtn.addEventListener("click", () => dialog.close()); // Close dialog