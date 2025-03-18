const announceResult = document.getElementById("announce-result");
const keyboardBtns = document.querySelectorAll(".btn");

const correctLetterColor = "#a6e3a1";
const incorrectLetterColor = "#585b70";
const misplacedLetterColor = "#f9e2af";

const row = document.querySelectorAll(".row");
let activeRow = document.querySelector(".row-active");

const MAX_ATTEMPTS = 6;
let currentAttempt = 1;
let secretWord = "", currentGuess = "";

// let gameProgress = {
//     secretWord,
//     MAX_ATTEMPTS,
//     gameState, // in_progress, won, lost
//     currentGuess,
//     currentAttempt,
//     activeRow, // Cross check this
//     guesses,
//     letterEvaluations,
//     dailyStreak
// }

// BUG: - When Ctrl + Shift + {Letter} is pressed then it registers on the board when it shouldn't
//      ✅ Yellow highlight for misplaced letter is also registering if guess word has multiple correct guess letters.

// TODO: ✅ Make the keyboard on the website work 
//       - Add play again functionality (reset board and choose another secret word)
//       - Add streak and progress tracker and date streak refresh
//       - Also make the trackers work with localStorage
//       - Add audio functionality
//       - Add code comments

function getActiveBoxes() {
    return activeRow.querySelectorAll(".box");
}

let activeBoxes = getActiveBoxes();
let currentIndex = 0;

/* ------------------ Game Logic -----------------------*/
keyboardBtns.forEach((button) => {
    button.addEventListener("click", (e) => {
        console.log(e.target.textContent.trim());

        if (e.target.textContent.trim() === "Enter") {
            submitGuessWord();
        }

        if (e.target.textContent.trim() === "Del") {
            deleteLetter();
        }

        if (e.target.textContent.trim().match(/^[a-zA-Z]$/g)) {
            if (currentIndex < 5) {
                activeBoxes[currentIndex].textContent = e.target.textContent.trim().toUpperCase();
                currentIndex++;
            }
        }
    });
});

document.addEventListener("keydown", keyPressed);

// TODO: - Make it more efficient
function keyPressed(event) {
    if (event.key === "Enter") {
        submitGuessWord();
    }

    if (event.key === "Backspace") {
        deleteLetter();
    }

    // Checks if key press is a letter
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

    // if (currentGuess.length < 5) {
    //     alert("Word is too short!");
    //     currentGuess = "";
    // }

    // if (!wordleList.includes(currentGuess)) {
    //     alert("Word doesn't exist within the list!");
    // }

    if (checkWord(currentGuess, secretWord)) {
        checkLetters(secretWord, currentGuess)
        announceResult.textContent = "Congratulation, you won.";
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

// Some of the logic is already in keyPressed
function deleteLetter() {
    if (currentIndex > 0) {
        currentIndex--;
        activeBoxes[currentIndex].textContent = "";
    }
}

// Bug: - Misplaced letters logic needs to be fixed
// Ideas: - Try a two loop approach instead
//        - First loop to check for all the correct letters
//        - Second loop to check the remaining misplaced letters
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

    changeLetterColor(lettersEvalution);

    //return lettersEvalution;
}

// TODO: - Recheck logic
function changeLetterColor(lettersEvalution) {
    for (let i = 0; i < lettersEvalution.length; i++) {
        if (lettersEvalution[i] === "correct") {
            activeBoxes[i].style.backgroundColor = correctLetterColor;
        } else if (lettersEvalution[i] === "misplaced") {
            activeBoxes[i].style.backgroundColor = misplacedLetterColor;
        } else {
            activeBoxes[i].style.backgroundColor = incorrectLetterColor;
        }
    }
}

// TODO: - Recheck logic
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
}

// TODO: - Add reset wordle game logic
async function resetWordleGame() {
    return;
}

startWordleGame();
