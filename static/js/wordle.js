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
let currentAttempt = 1, dailyStreak = 0;
let secretWord = "", currentGuess = "";

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
let currentIndex = 0;

/* ------------------ Game Logic -----------------------*/
// TODO: - Recheck logic and make it look better
//       - Add a check to see if the guess word is too short to be submitted.
function submitGuessWord() {
    activeBoxes.forEach((box) => currentGuess += box.textContent.toLowerCase());

    // if (currentGuess.length < 5) {
    //     alert("Word is too short!");
    //     currentGuess = "";
    // }

    // if (!wordleList.includes(currentGuess)) {
    //     alert("Word doesn't exist within the list!");
    // }

    if (checkGuessWord(secretWord, currentGuess)) {
        checkLetters(secretWord, currentGuess);
        announceResult.textContent = "Congratulation, you won.";
        incrementDailyStreak();
        //console.log("Right");
    } else {
        //console.log("Wrong");

        if (currentAttempt < 6) {
            checkLetters(secretWord, currentGuess);

            currentAttempt++;

            activeRow.classList.remove("row-active");
            activeRow = row[currentAttempt - 1];
            activeRow.classList.add("row-active");

            activeBoxes = getActiveBoxes();

            // Reset row index traversal and current guess word
            currentIndex = 0;
            currentGuess = "";
        } else {
            checkLetters(secretWord, currentGuess);
            announceResult.textContent = `Sorry, you lost. The word was ${secretWord}.`;
            //console.log("Game Over!");
        }
    }
}

/**
 * Clears the text for each active box.
 */
function deleteLetter() {
    if (currentIndex > 0) {
        currentIndex--;
        activeBoxes[currentIndex].textContent = "";
    }
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
        if (currentIndex < 5) {
            activeBoxes[currentIndex].textContent = input.toUpperCase();
            currentIndex++;
        }
    }
}

// Event listeners.
document.addEventListener("keydown", (e) => handleInput(e.key));
keyboardBtns.forEach((btn) => {
    btn.addEventListener("click", () => handleInput(btn.textContent));
});

/**
 * Stop web page from listening for keyboard inputs.
 */
function stopInput() {
    document.removeEventListener("keydown", (e) => handleInput(e.key));
    keyboardBtns.forEach((btn) => {
        btn.removeEventListener("click", () => handleInput(btn.textContent));
    });
}

function checkLetters(secretWord, guessWord) {
    let lettersEvalution = Array(5).fill("");
    let secretWordLetters = secretWord.split("");
    let guessWordLetters = guessWord.split("");

    for (let i = 0; i < guessWordLetters.length; i++) {
        if (guessWordLetters[i] === secretWordLetters[i]) {
            lettersEvalution[i] = "correct"
            secretWordLetters[i] = "";
            guessWordLetters[i] = "";
        }
    }

    for (let i = 0; i < guessWordLetters.length; i++) {
        if (!guessWordLetters[i]) continue;
        const index = secretWordLetters.indexOf(guessWordLetters[i]);
        if (index !== -1) {
            lettersEvalution[i] = "misplaced";
            secretWordLetters[index] = ""
        }
    }

    lettersEvalution.forEach((element, index) => {
        if (element === "") {
            lettersEvalution[index] = "incorrect";
        }
    });

    // gameState.letterEvaluations.push(lettersEvalution);
    changeBoxColor(lettersEvalution);

    //return lettersEvalution;
}

// TODO: - Recheck logic
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
 * 
 * @returns {boolean} Result if current guess matches the secret wordle word.
 */
function checkGuessWord(secretWord, currentGuess) {
    return currentGuess === secretWord;
}

function incrementDailyStreak() {
    gameState.dailyStreak++;
    dailyStreakText.textContent = gameState.dailyStreak;
}

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

function getRandomWord(words) {
    if (Array.isArray(words)) {
        return words[Math.floor(Math.random() * words.length)];
    }
}

// TODO: - Add all came functionality here or at least most
async function startWordleGame() {
    const wordleList = await getWordleWords();

    secretWord = getRandomWord(wordleList);
    console.log(secretWord);

    // gameState.secretWord = getRandomWord(wordleList);
    // console.log(gameState.secretWord);
}

// TODO: - Add reset wordle game logic
async function resetWordleGame() {
    const wordleList = await getWordleWords();
    gameState.secretWord = await getRandomWord(wordleList);
    gameState.status = "in_prgress";
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

function setWordleLocalStorage(gameState) {
    const wordleGameProgress = JSON.stringify(gameState);
    localStorage.setItem("wordle", wordleGameProgress);
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
