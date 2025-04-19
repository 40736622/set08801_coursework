const keys = document.querySelectorAll(".white-key, .black-key")

const audioCtx = new (AudioContext || webkitAudioContext)();
const activeOscillators = {};
let wave = undefined;

const keyboardNoteMap = [
    { noteNumber: 28, key: "KeyQ" },
    { noteNumber: 29, key: "KeyW" },
    { noteNumber: 30, key: "KeyE" },
    { noteNumber: 31, key: "KeyR" },
    { noteNumber: 32, key: "KeyT" },
    { noteNumber: 33, key: "KeyY" },
    { noteNumber: 34, key: "KeyU" },
    { noteNumber: 35, key: "KeyI" },
    { noteNumber: 36, key: "KeyO" },
    { noteNumber: 37, key: "KeyP" },
    { noteNumber: 38, key: "BracketLeft" },
    { noteNumber: 39, key: "BracketRight" },
    { noteNumber: 40, key: "KeyA" },
    { noteNumber: 41, key: "KeyS" },
    { noteNumber: 42, key: "KeyD" },
    { noteNumber: 43, key: "KeyF" },
    { noteNumber: 44, key: "KeyG" },
    { noteNumber: 45, key: "KeyH" },
    { noteNumber: 46, key: "KeyJ" },
    { noteNumber: 47, key: "KeyK" },
    { noteNumber: 48, key: "KeyL" },
    { noteNumber: 49, key: "Semicolon" },
    { noteNumber: 50, key: "Quote" },
    { noteNumber: 51, key: "KeyZ" },
    { noteNumber: 52, key: "KeyX" }
];

audioCtx.resume();
const mainGainNode = audioCtx.createGain();
mainGainNode.connect(audioCtx.destination);
mainGainNode.gain.value = 1;

// Remember: MediaStream Recording API & Midi API

function playNote(noteFrequency, wave = "square") {
    if (!activeOscillators[noteFrequency]) {
        const osc = new OscillatorNode(audioCtx, {
            type: wave,
            frequency: noteFrequency,
        });

        osc.connect(mainGainNode);
        osc.start();
        activeOscillators[noteFrequency] = osc;
    }
}

// function stopNote(osc, noteFrequency) {
function stopNote(noteFrequency) {
    if (activeOscillators[noteFrequency]) {
        activeOscillators[noteFrequency].stop();
        delete activeOscillators[noteFrequency];
    }
}

function calculateFrequency(noteNumber, isMidi = false) {
    if (isMidi) {
        return 2 ** ((noteNumber - 69) / 12) * 440;
    }

    return 2 ** ((noteNumber - 49) / 12) * 440;
}

// Handles on-screen piano keyboard
keys.forEach((key, index) => {
    key.dataset.noteNumber = index + 28;
    key.dataset.frequency = calculateFrequency(key.dataset.noteNumber);

    // Todo: - Implement with mouseover too
    key.addEventListener("mousedown", event => playNote(event.target.dataset.frequency));
    key.addEventListener("touchstart", event => playNote(event.target.dataset.frequency));

    key.addEventListener("mouseup", event => stopNote(event.target.dataset.frequency));
    key.addEventListener("mouseleave", event => stopNote(event.target.dataset.frequency));
    key.addEventListener("touchend", event => stopNote(event.target.dataset.frequency));
});

function handleKeyboardPresses() {
    document.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        const noteEntry = keyboardNoteMap.find(element => element.key === event.code);
        
        if (noteEntry) {
            const frequency = calculateFrequency(noteEntry.noteNumber);
            playNote(frequency);
        }
    });

    document.addEventListener("keyup", (event) => {
        const noteEntry = keyboardNoteMap.find(element => element.key === event.code);
        
        if (noteEntry) {
            const frequency = calculateFrequency(noteEntry.noteNumber);
            stopNote(frequency);
        }
    });
}

// Handles MIDI
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((access) => {
        const inputs = access.inputs.values();

        inputs.forEach((input) => {
            input.onmidimessage = (message) => {
                const [status, noteNumber, velocity] = message.data;
                const frequency = calculateFrequency(noteNumber, true);

                if (velocity > 0) {
                    playNote(frequency);
                } else if (velocity === 0) {
                    stopNote(frequency);
                }
            };
        });

        access.onstatechange = (event) => {
            // Print information about the (dis)connected MIDI controller
            console.log(event.port.name, event.port.state);
        };
    });
}

handleKeyboardPresses();