const announceResult = document.getElementById("announce-result");
const row = document.querySelectorAll(".row");
let activeRow = document.querySelector(".row-active");

const MAX_ATTEMPTS = 6;
let currentAttempt = 1;
let secretWord = "", currentGuess = "";
let secretWordLetters = [];

let dailyStreak = 0;
let gameState = "in_progress"; // in_progress, win, lost
let guesses = [];
let letterEvaluations = [];

const correctLetterColor = "#a6e3a1";
const misplacedLetterColor = "#f9e2af";

// BUG: - When Ctrl + Shift + {Letter} is pressed then it registers on the board when it shouldn't
// TODO: - Add play again functionality (reset board and choose another secret word)
//       - Add streak and progress tracker
//       - Also make the trackers work with localStorage
//       - Add audio functionality

function getActiveBoxes() {
    return activeRow.querySelectorAll(".box");
}

let activeBoxes = getActiveBoxes();
let currentIndex = 0;

/* ------------------ Game Logic -----------------------*/
document.addEventListener("keydown", keyPressed);

// TODO: - Make it more efficient
function keyPressed(event) {
    if (event.key === "Enter") {
        submitGuessWord();
    }

    if (event.key === "Backspace") {
        if (currentIndex > 0) {
            currentIndex--;
            activeBoxes[currentIndex].textContent = "";
        }
    }

    // Checks if key press was a letter
    if (event.key.match(/^[a-zA-Z]$/g)) {
        if (currentIndex < 5) {
            activeBoxes[currentIndex].textContent = event.key.toUpperCase();
            currentIndex++;
        }
    }
}

// TODO: - Recheck logic and make it look better
//       - Add a check to see if the guess word is too short to be submitted.
function submitGuessWord() {
    activeBoxes.forEach(box => currentGuess += box.textContent.toLowerCase());
    if (checkWord(currentGuess, secretWord)) {
        checkLetters(secretWordLetters, currentGuess)
        announceResult.textContent = "Congratulation, you won.";
        //console.log("Right")
    } else {
        //console.log("Wrong");

        if (currentAttempt < 6) {
            checkLetters(secretWordLetters, currentGuess);

            currentAttempt++;

            activeRow.classList.remove("row-active");
            activeRow = row[currentAttempt - 1];
            activeRow.classList.add("row-active");

            activeBoxes = getActiveBoxes();

            currentIndex = 0;
            currentGuess = "";
        } else {
            checkLetters(secretWordLetters, currentGuess);
            announceResult.textContent = `Sorry, you lost. The word was ${secretWord}.`;
            //console.log("Game Over!")
        }
    }
}

// Some of the logic is already in keyPressed
function deleteLetter() {
    return;
}

function splitWordToLetters(word) {
    return word.split("");
}

// TODO: - Add functionality for finding misplaced letters
function checkLetters(secretWordLetters, guessWord) {
    let correctlyPlacedLetters = [];
    let misplacedLetters = [];

    guessWordLetters = splitWordToLetters(guessWord);

    for (let i = 0; i < guessWord.length; i++) {
        if (secretWordLetters.includes(guessWordLetters[i]) && secretWordLetters[i] === guessWordLetters[i]) {
            correctlyPlacedLetters.push(i);
        } else if (secretWordLetters.includes(guessWordLetters[i]) && secretWordLetters[i] !== guessWordLetters[i]) {
            misplacedLetters.push(i);
        }
    }

    changeLetterColor(correctlyPlacedLetters, misplacedLetters);
}

// TODO: - Add functionality to change color for misplaced letters
function changeLetterColor(correctLetters, misplacedLetters) {
    if (correctLetters && correctLetters.length > 0) {
        for (let index of correctLetters) {
            activeBoxes[index].style.backgroundColor = correctLetterColor;
        }
    }

    if (misplacedLetters && misplacedLetters.length > 0) {
        for (let index of misplacedLetters) {
            activeBoxes[index].style.backgroundColor = misplacedLetterColor;
        }
    }
}

// TODO: - Check if this works at all
function checkWord(guessWord, wordleWord) {
    return guessWord === wordleWord;
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

    secretWordLetters = splitWordToLetters(secretWord);
}

async function resetWordleGame() {
    return;
}

startWordleGame();
