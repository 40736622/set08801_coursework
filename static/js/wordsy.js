import { playAudio, toggleVolume } from "./audio-helper.js";

// DOM Elements
const keyboardBtns = document.querySelectorAll(".btn");
const rows = document.querySelectorAll(".row");
let activeRow = document.querySelector(".row-active");
const dailyStreakText = document.querySelector("#daily-streak");
const gameInfoDialog = document.querySelector(".game-info");
const dialog = document.querySelector(".announce-card");
const diaglogPlayAgainBtn = dialog.querySelector(".btn-play-again");
const dialogCloseBtn = dialog.querySelector(".btn-close");
const volumeIcon = document.querySelector(".volume-settings i");

// Board Colors
const boxColors = {
    default: "rgb(230, 233, 239)", //#e6e9ef
    correct: "rgb(166, 227, 161)", //#a6e3a1
    incorrect: "rgb(49, 50, 68)", //#313244
    misplaced: "rgb(249, 226, 175)" //#f9e2af
};

const textColors = {
    white: "rgb(255, 255, 255)",
    mantle: "rgb(24, 24, 37)"
};

const MAX_ATTEMPTS = 6;
let currentBoxIndex = 0;

// Game State
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

// Audio
let isMute = false;
const flipSound = new Howl({
    src: ["../static/audio/wordsy-flip-woosh.wav"],
    volume: 0.7
});


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
            playAudio(flipSound, isMute);

        }, index * 250);

    });

    setTimeout(() => {
        rowBoxes.forEach((box) => {
            box.classList.remove("box-flipping");
        });
    }, 2000);
}

/**
 * Shows the announcement dialog to display the game result.
 */
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

/**
 * Evaluates if the current guess word is the correct word.
 */
function submitGuessWord() {
    activeBoxes.forEach((box) => gameState.currentGuess += box.textContent.toLowerCase());

    if (gameState.currentGuess.length < 5) {
        // alert("Word is too short!");
        gameInfoDialog.showModal();

        setTimeout(() => {
            gameInfoDialog.close();
        }, 500);

        gameState.currentGuess = "";
        return;
    }

    gameState.guesses.push(gameState.currentGuess);
    checkLetters();
    triggerBoxFlipping(activeBoxes);
    activeBoxes.forEach((element) => element.style.color = textColors.white)

    if (checkGuessWord()) {
        stopInput();
        gameState.status = "won";
        gameState.lastDateStreakRecorded = new Date().getDate();
        incrementDailyStreak();
        announceResult();
    } else {
        if (gameState.currentAttempt < MAX_ATTEMPTS) {
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
    if (e.ctrlKey || e.shiftKey || e.altKey) {
        return;
    }

    handleInput(e.key || e.target.textContent);

    // Removes focus for a clicked button on the on-screen keyboard.
    if (e.target.classList.contains("btn")) {
        e.target.blur();
    }
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

/**
 * Handles the key inputs.
 * @param {KeyboardEvent | MouseEvent} input - Event object from a keydown or click event.
 */
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

/**
 * Adapted from: Stack Overflow (Nina Scholz)
 * https://stackoverflow.com/questions/72865151/duplicate-verification-in-wordle-clone
 * 
 * Evaluates each letter of the current guess word.
 */
function checkLetters() {
    let letterEvaluations = Array(5).fill("");
    let secretWordLetters = gameState.secretWord.split("");
    let guessWordLetters = gameState.currentGuess.split("");

    // Checks for correctly placed letters
    for (let i = 0; i < guessWordLetters.length; i++) {
        if (guessWordLetters[i] === secretWordLetters[i]) {
            letterEvaluations[i] = "correct"
            secretWordLetters[i] = "";
            guessWordLetters[i] = "";
        }
    }

    // Checks for misplaced letters
    for (let i = 0; i < guessWordLetters.length; i++) {
        if (!guessWordLetters[i]) continue;
        const index = secretWordLetters.indexOf(guessWordLetters[i]);
        if (index !== -1) {
            letterEvaluations[i] = "misplaced";
            secretWordLetters[index] = ""
        }
    }

    // Checks for incorrect letters
    letterEvaluations.forEach((element, index) => {
        if (element === "") {
            letterEvaluations[index] = "incorrect";
        }
    });

    gameState.letterEvaluations.push(letterEvaluations);
    changeBoxColor(letterEvaluations, activeBoxes);
    changeKeyboardColor(letterEvaluations, gameState.currentGuess.split(""), keyboardBtns);
}

/**
 * Changes the color of keyboard keys when a guess is inputted.
 * @param {Array} letterEvaluations - Letter evaluations for guess word.
 * @param {Array} guessWord - Guess word.
 * @param {NodeListOf<HTMLButtonElement>} keyboardBtns - Represents the on-screen keyboard buttons.
 */
function changeKeyboardColor(letterEvaluations, guessWord, keyboardBtns) {
    const keyboardBtnsArray = Array.from(keyboardBtns);

    for (let i = 0; i < guessWord.length; i++) {
        const key = keyboardBtnsArray.find((element) => element.textContent.toUpperCase().trim() === guessWord[i].toUpperCase().trim());

        if (letterEvaluations[i] === "correct") {
            key.style.backgroundColor = boxColors.correct;
        } else if (letterEvaluations[i] === "misplaced" && key.style.backgroundColor !== boxColors.correct) {
            key.style.backgroundColor = boxColors.misplaced;
        } else {
            if (key.style.backgroundColor !== boxColors.correct && key.style.backgroundColor !== boxColors.misplaced) {
                key.style.backgroundColor = boxColors.incorrect;
            }
        }
    }
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
    // const jsonUrl = "http://127.0.0.1:5500/static/wordle.json" // For local development
    const jsonUrl = "https://40736622.github.io/set08801_coursework/static/wordle.json"
    try {
        const response = await fetch(jsonUrl); // Original JSON file taken from: https://gist.github.com/mrhead/f0ced2726394588e8d9863e0568b6473
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

/**
 * 
 * @returns A random word.
 */
async function getRandomWord() {
    const words = await getWordleWords();

    if (words.length > 0) {
        return words[Math.floor(Math.random() * words.length)];
    }
}

/**
 * Choices a new guess word to start a game.
 */
async function startWordleGame() {
    gameState.secretWord = await getRandomWord();
}

/**
 * Choices a new guess word and clears the game board to start a new game.
 */
async function resetWordleGame() {
    gameState.secretWord = await getRandomWord();
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
        box.style.color = textColors.mantle;
    });

    keyboardBtns.forEach((btn) => btn.style.backgroundColor = "rgb(108, 112, 134)");

    dialog.close();
    startInput();
}

/**
 * Saves wordle game data in Local Storage.
 */
function setWordleLocalStorage() {
    localStorage.setItem("wordle", JSON.stringify(gameState));
}

/**
 * 
 * @returns Object representation of wordle game data from Local Storage.
 */
function getWordleLocalStorage() {
    return JSON.parse(localStorage.getItem("wordle"));
}

/**
 * Deletes Wordle data from Local Storage. Mostly used for debugging.
 */
function removeWordleLocalStorage() {
    localStorage.removeItem("wordle");
}

/**
 * Updates the daily streak on the DOM.
 */
function updateDailyStreak() {
    const lastSavedGameState = getWordleLocalStorage();
    // console.log(lastSavedGameState);
    if (lastSavedGameState) {
        gameState.dailyStreak = lastSavedGameState.dailyStreak ?? 0;
        gameState.lastDateStreakRecorded = lastSavedGameState.lastDateStreakRecorded;
        dailyStreakText.textContent = gameState.dailyStreak;
    }
}

/**
 * Changes the active row based on the current attempt.
 */
function changeActiveRow() {
    currentBoxIndex = 0;
    activeRow.classList.remove("row-active");
    activeRow = rows[gameState.currentAttempt - 1];
    activeRow.classList.add("row-active");
    activeBoxes = getActiveBoxes();
}

/**
 * Restores the board to an in progress game if one exist.
 */
function restoreGameState() {
    const lastSavedGameState = getWordleLocalStorage();

    if (lastSavedGameState && lastSavedGameState.status === "in_progress" && lastSavedGameState.currentAttempt > 1) {
        gameState = lastSavedGameState;

        changeActiveRow();

        for (let i = 0; i < gameState.guesses.length; i++) {
            const boxes = rows[i].querySelectorAll(".box");
            changeBoxColor(gameState.letterEvaluations[i], boxes);
            changeKeyboardColor(gameState.letterEvaluations[i], gameState.guesses[i].split(""), keyboardBtns);

            for (let j = 0; j < gameState.guesses[i].length; j++) {
                boxes[j].textContent = gameState.guesses[i][j].toUpperCase();
                boxes[j].style.color = textColors.white;
            }
        }
    } else {
        startWordleGame();
    }
}

/**
 * Resets the daily streak when a day has passed.
 */
function resetDailyStreak() {
    const lastSavedGameState = getWordleLocalStorage();
    // console.log(lastSavedGameState);
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

volumeIcon.addEventListener("click", () => {
    isMute = toggleVolume(isMute, volumeIcon);
});
diaglogPlayAgainBtn.addEventListener("click", resetWordleGame); // Close dialog and start a new game
dialogCloseBtn.addEventListener("click", () => dialog.close()); // Close dialog