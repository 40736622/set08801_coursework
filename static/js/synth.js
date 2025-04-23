// DOM Elements
const keys = document.querySelectorAll(".white-key, .black-key");
const waveOptions = document.querySelectorAll("input[name='wave']");
let wave = document.querySelector("input[name='wave']:checked").value;
let volume = document.querySelector("input[name='volume']");
let filter = document.querySelector("input[name='lowpass']");

const audioCtx = new (AudioContext || webkitAudioContext)();
const activeOscillators = {};
const keyboardNoteMap = [
    { noteNumber: 28, key: "KeyZ" },
    { noteNumber: 29, key: "KeyS" }, // black key
    { noteNumber: 30, key: "KeyX" },
    { noteNumber: 31, key: "KeyD" }, // black key
    { noteNumber: 32, key: "KeyC" },
    { noteNumber: 33, key: "KeyV" },
    { noteNumber: 34, key: "KeyG" }, // black key
    { noteNumber: 35, key: "KeyB" },
    { noteNumber: 36, key: "KeyH" }, // black key
    { noteNumber: 37, key: "KeyN" },
    { noteNumber: 38, key: "KeyJ" }, // black key
    { noteNumber: 39, key: "KeyM" },

    { noteNumber: 40, key: "KeyQ" },
    { noteNumber: 41, key: "Digit2" }, // black key
    { noteNumber: 42, key: "KeyW" },
    { noteNumber: 43, key: "Digit3" }, // black key
    { noteNumber: 44, key: "KeyE" },
    { noteNumber: 45, key: "KeyR" },
    { noteNumber: 46, key: "Digit5" }, // black key
    { noteNumber: 47, key: "KeyT" },
    { noteNumber: 48, key: "Digit6" }, // black key
    { noteNumber: 49, key: "KeyY" },
    { noteNumber: 50, key: "Digit7" }, // black key
    { noteNumber: 51, key: "KeyU" },

    { noteNumber: 52, key: "KeyI" }
];

// audioCtx.resume();

// Master Gain
const mainGainNode = audioCtx.createGain();
mainGainNode.gain.value = volume.value / 100;

// Effects
const filterNode = audioCtx.createBiquadFilter();
filterNode.type = "lowpass";
filterNode.frequency.value = filter.value;
filterNode.Q.value = 3;

// Connect chain
filterNode.connect(mainGainNode);
mainGainNode.connect(audioCtx.destination);

// Remember: MediaStream Recording API & Midi API

function playNote(noteFrequency, wave = "square") {
    if (!activeOscillators[noteFrequency]) {
        const osc = new OscillatorNode(audioCtx, {
            type: wave,
            frequency: noteFrequency,
        });

        // Create a gain node for the oscillator
        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.2;

        // Connect nodes
        osc.connect(oscGain);
        // oscGain.connect(mainGainNode);
        oscGain.connect(filterNode);

        osc.start();
        activeOscillators[noteFrequency] = { osc, oscGain };
        // console.log(activeOscillators);
    }
}

// function stopNote(osc, noteFrequency) {
function stopNote(noteFrequency) {
    if (activeOscillators[noteFrequency]) {
        activeOscillators[noteFrequency].oscGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);
        // activeOscillators[noteFrequency].osc.stop();
        delete activeOscillators[noteFrequency];
    }
}

function calculateFrequency(noteNumber, isMidi = false) {
    if (isMidi) {
        return 2 ** ((noteNumber - 69) / 12) * 440;
    }

    return 2 ** ((noteNumber - 49) / 12) * 440;
}

// Update volume
volume.addEventListener("input", event => mainGainNode.gain.value = event.target.value / 100);

// Update filter frequency
filter.addEventListener("input", event => filterNode.frequency.value = event.target.value);

// Update wave type dynamically
waveOptions.forEach((waveOption) => {
    waveOption.addEventListener("change", (event) => {
        if (event.target.checked) {
            wave = event.target.value;
        }
    });
});

// Handles on-screen piano keyboard
keys.forEach((key, index) => {
    key.dataset.noteNumber = index + 28;
    key.dataset.frequency = calculateFrequency(key.dataset.noteNumber);

    // Todo: - Implement with mouseover too
    key.addEventListener("mousedown", event => playNote(event.target.dataset.frequency, wave));
    key.addEventListener("touchstart", event => playNote(event.target.dataset.frequency, wave));

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
            playNote(frequency, wave);
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
                // console.log(message.data);

                // 224 and 176 - controls and mod wheel
                // 144 and 128 - keys
                if (status === 144 && velocity > 0) {
                    playNote(frequency, wave);
                } else if (status === 128 && velocity === 0) {
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