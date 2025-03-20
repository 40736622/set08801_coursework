// DOM Elements
const announceResult = document.getElementById("announce-result");
const keyboardBtns = document.querySelectorAll(".btn");
const row = document.querySelectorAll(".row");
let activeRow = document.querySelector(".row-active");
const dailyStreakText = document.querySelector("#daily-streak");
const audioIcon = document.querySelector(".volume-settings i")

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
    lastStreakRecorded: ""
};

// BUG: - When Ctrl + Shift + {Letter} is pressed then it registers on the board when it shouldn't
//      ✅ Yellow highlight for misplaced letter is also registering if guess word has multiple correct guess letters.

// TODO: ✅ Make the keyboard on the website work 
//       - Change keyboard section back into button tags instead of divs
//       - Recheck if I have HTML semantics set properly
//       - Add play again functionality (reset board and choose another secret word)
//       - Add streak and date refresh
//       - Also make the streak work with localStorage
//       - Add audio functionality
//       - Add code comments

/**
 * Get all boxes from the active row.
 * @returns Node list of divs with css box class.
 */
function getActiveBoxes() {
    return activeRow.querySelectorAll(".box");
}

let activeBoxes = getActiveBoxes();

/* ------------------ Game Logic -----------------------*/
// TODO: - Recheck logic and make it look better
//       - Add a check to see if the guess word is too short to be submitted.
function submitGuessWord() {
    activeBoxes.forEach((box) => gameState.currentGuess += box.textContent.toLowerCase());

    if (gameState.currentGuess.length < 5) {
        alert("Word is too short!");
        gameState.currentGuess = "";
        return;
    }

    // if (!wordleList.includes(gameState.currentGuess)) {
    //     alert("Word doesn't exist within the list!");
    //     return;
    // }

    gameState.guesses.push(gameState.currentGuess);
    checkLetters();

    if (checkGuessWord()) {
        stopInput();
        gameState.status = "won";
        gameState.lastStreakRecorded = new Date().getDate();
        incrementDailyStreak();
        announceResult.textContent = "Congratulation, you won.";
    } else {
        if (gameState.currentAttempt < 6) {
            gameState.currentAttempt++;

            activeRow.classList.remove("row-active");
            activeRow = row[gameState.currentAttempt - 1];
            activeRow.classList.add("row-active");
            activeBoxes = getActiveBoxes();

            // Reset row index traversal and current guess word
            currentBoxIndex = 0;
            gameState.currentGuess = "";
        } else {
            stopInput();
            gameState.status = "lost";
            announceResult.textContent = `Sorry, you lost. The word was ${gameState.secretWord}.`;
        }
    }
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

    // Checks if the input is a letter
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
    changeBoxColor(letterEvaluations);
}

/**
 * Changes colors for each active row box depending on letter evaluations
 * @param {Array} lettersEvalution Holds evaluations for each letter of the current guess word.
 */
function changeBoxColor(lettersEvalution) {
    for (let i = 0; i < lettersEvalution.length; i++) {
        if (lettersEvalution[i] === "correct") {
            activeBoxes[i].style.backgroundColor = boxColors.correct;
        } else if (lettersEvalution[i] === "misplaced") {
            activeBoxes[i].style.backgroundColor = boxColors.misplaced;
        } else {
            activeBoxes[i].style.backgroundColor = boxColors.incorrect;
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

// TODO: - Add all came functionality here or at least most
async function startWordleGame() {
    gameState.secretWord = await getRandomWord();
    console.log(gameState.secretWord);
}

// TODO: - Add reset wordle game logic
async function resetWordleGame() {
    gameState.secretWord = await getRandomWord();
    gameState.status = "in_progress";
    gameState.currentGuess = "";
    gameState.currentAttempt = 1;
    gameState.guesses = [];
    gameState.letterEvaluations = [];

    // Clear game board text
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
        box.textContent = "";
        box.style.backgroundColor = boxColors.default;
    });

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

// Ideas - If new Date().getDate() !== same, then reset the streak.
function resetDailyStreak() {
    return;
}

startWordleGame();
startInput();

