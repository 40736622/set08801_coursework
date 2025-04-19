const keys = document.querySelectorAll(".white-key, .black-key")
const audioCtx = new (AudioContext || webkitAudioContext)();
let midi = null;
let wave = null;

audioCtx.resume();
const mainGainNode = audioCtx.createGain();
mainGainNode.connect(audioCtx.destination);
mainGainNode.gain.value = 1;

const synthNotesMap = {
    c3: { frequency: 130.8128, key: "KeyQ", midi: 48 },
    cs3: { frequency: 138.5913, key: "KeyW", midi: 49 },
    d3: { frequency: 146.8324, key: "KeyE", midi: 50 },
    ds3: { frequency: 155.5635, key: "KeyR", midi: 51 },
    e3: { frequency: 164.8138, key: "KeyT", midi: 52 },
    f3: { frequency: 174.6141, key: "KeyY", midi: 53 },
    fs3: { frequency: 184.9972, key: "KeyU", midi: 54 },
    g3: { frequency: 195.9977, key: "KeyI", midi: 55 },
    gs3: { frequency: 207.6523, key: "KeyO", midi: 56 },
    a3: { frequency: 220.0000, key: "KeyP", midi: 57 },
    as3: { frequency: 233.0819, key: "BracketLeft", midi: 58 },
    b3: { frequency: 246.9417, key: "BracketRight", midi: 59 },

    c4: { frequency: 261.6256, key: "KeyA", midi: 60 },
    cs4: { frequency: 277.1826, key: "KeyS", midi: 61 },
    d4: { frequency: 293.6648, key: "KeyD", midi: 62 },
    ds4: { frequency: 311.1270, key: "KeyF", midi: 63 },
    e4: { frequency: 329.6276, key: "KeyG", midi: 64 },
    f4: { frequency: 349.2282, key: "KeyH", midi: 65 },
    fs4: { frequency: 369.9944, key: "KeyJ", midi: 66 },
    g4: { frequency: 391.9954, key: "KeyK", midi: 67 },
    gs4: { frequency: 415.3047, key: "KeyL", midi: 68 },
    a4: { frequency: 440.0000, key: "Semicolon", midi: 69 },
    as4: { frequency: 466.1638, key: "Quote", midi: 70 },
    b4: { frequency: 493.8833, key: "KeyZ", midi: 71 },

    c5: { frequency: 523.2511, key: "KeyX", midi: 72 }
};

const frequencies = Object.values(synthNotesMap).map(note => note.frequency);

// const keyboardKeys = [
//     "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft",
//     "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
//     "Quote", "KeyZ", "KeyX"
// ];

// Remember: MediaStream Recording API & Midi API

function playNote(noteFrequency, wave = "sine") {
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

function calculateFrequency(noteNumber) {
    return 2 ** ((noteNumber - 49) / 12) * 440;
}

// Handles on-screen piano keyboard
keys.forEach((key, index) => {
    key.dataset.frequency = frequencies[index];
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

                if (velocity > 0) {
                    osc = playNote(440);
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