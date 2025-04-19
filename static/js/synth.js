const keys = document.querySelectorAll(".white-key, .black-key")
const audioCtx = new (AudioContext || webkitAudioContext)();
let midi = null;
let wave = undefined;

audioCtx.resume();
const mainGainNode = audioCtx.createGain();
mainGainNode.connect(audioCtx.destination);
mainGainNode.gain.value = 1;

const synthNotesMap = {
    c3: { frequency: 130.8128, key: "KeyQ" },
    cs3: { frequency: 138.5913, key: "KeyW" },
    d3: { frequency: 146.8324, key: "KeyE" },
    ds3: { frequency: 155.5635, key: "KeyR" },
    e3: { frequency: 164.8138, key: "KeyT" },
    f3: { frequency: 174.6141, key: "KeyY" },
    fs3: { frequency: 184.9972, key: "KeyU" },
    g3: { frequency: 195.9977, key: "KeyI" },
    gs3: { frequency: 207.6523, key: "KeyO" },
    a3: { frequency: 220.0000, key: "KeyP" },
    as3: { frequency: 233.0819, key: "BracketLeft" },
    b3: { frequency: 246.9417, key: "BracketRight" },

    c4: { frequency: 261.6256, key: "KeyA" },
    cs4: { frequency: 277.1826, key: "KeyS" },
    d4: { frequency: 293.6648, key: "KeyD" },
    ds4: { frequency: 311.1270, key: "KeyF" },
    e4: { frequency: 329.6276, key: "KeyG" },
    f4: { frequency: 349.2282, key: "KeyH" },
    fs4: { frequency: 369.9944, key: "KeyJ" },
    g4: { frequency: 391.9954, key: "KeyK" },
    gs4: { frequency: 415.3047, key: "KeyL" },
    a4: { frequency: 440.0000, key: "Semicolon" },
    as4: { frequency: 466.1638, key: "Quote" },
    b4: { frequency: 493.8833, key: "KeyZ" },

    c5: { frequency: 523.2511, key: "KeyX" }
};

const frequencies = Object.values(synthNotesMap).map(note => note.frequency);

// const keyboardKeys = [
//     "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft",
//     "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
//     "Quote", "KeyZ", "KeyX"
// ];

// Remember: MediaStream Recording API & Midi API

function playNote(noteFrequency, wave = "square") {
    const osc = new OscillatorNode(audioCtx, {
        type: wave,
        frequency: noteFrequency,
    });

    osc.connect(mainGainNode);
    osc.start();

    return osc;
}

function stopNote(osc, noteFrequency) {
    if (osc) {
        osc.stop();
        osc = null;
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
    let osc = null;

    // Todo: - Implement with mouseover too
    key.addEventListener("mousedown", (event) => {
        osc = playNote(event.target.dataset.frequency);
    });

    key.addEventListener("touchstart", (event) => {
        osc = playNote(event.target.dataset.frequency);
    });

    key.addEventListener("mouseup", (event) => stopNote(osc, event.target.dataset.frequency));
    key.addEventListener("mouseleave", (event) => stopNote(osc, event.target.dataset.frequency));
    key.addEventListener("touchend", (event) => stopNote(osc, event.target.dataset.frequency));
});

function handleKeyPresses() {
    let osc = null;

    document.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        const noteEntry = Object.values(synthNotesMap).find(note => note.key === event.code);

        if (noteEntry) {
            osc = playNote(noteEntry.frequency);
        }
    });

    document.addEventListener("keyup", (event) => stopNote(osc, event.target.dataset.frequency));
}

// Handles MIDI
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((access) => {
        let osc = null;

        const inputs = access.inputs.values();

        inputs.forEach((input) => {
            input.onmidimessage = (message) => {
                const [status, note, velocity] = message.data;

                const frequency = calculateFrequency(note, true);

                if (velocity > 0) {
                    osc = playNote(frequency);
                } else if (velocity === 0) {
                    stopNote(osc);
                }

                console.log(message.data);

            };
        });

        access.onstatechange = (event) => {
            // Print information about the (dis)connected MIDI controller
            console.log(event.port.name, event.port.state);
        };
    });
}

handleKeyPresses();