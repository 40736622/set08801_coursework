// DOM Elements
const keys = document.querySelectorAll(".white-key, .black-key");
const waveOptions = document.querySelectorAll("input[name='wave']");
let wave = document.querySelector("input[name='wave']:checked").value;
let volume = document.querySelector("input[name='volume']");
const filterFrequency = document.getElementById("filter-frequency");
const filterQ = document.getElementById("filter-Q");
const filterFrequencyCounter = document.getElementById("filter-frequency-counter");
const filterQCounter = document.getElementById("filter-quality-counter");
const delayDuration = document.getElementById("delay-duration");
const delayFeedback = document.getElementById("delay-feedback");
const delayDurationCounter = document.getElementById("delay-duration-counter");
const delayFeedbackCounter = document.getElementById("delay-feedback-counter");
const distortionCurve = document.getElementById("distortion-curve");
const distortionCurveCounter = document.getElementById("distortion-curve-counter");
const reverbImpulseResponse = document.getElementById("impulse-response-select");

// Set default text for the FX counters
filterFrequencyCounter.textContent = `${filterFrequency.value} Hz`;
filterQCounter.textContent = filterQ.value;
delayDurationCounter.textContent = `${delayDuration.value} ms`;
delayFeedbackCounter.textContent = `${delayFeedback.value}%`;
distortionCurveCounter.textContent = distortionCurve.value;

// Remember: MediaStream Recording API & Midi API

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

// Master Gain
const masterGainNode = audioCtx.createGain();
masterGainNode.gain.value = volume.value / 100;

// Lowpass Filter FX
const filterNode = audioCtx.createBiquadFilter();
filterNode.type = "lowpass";
filterNode.frequency.value = filterFrequency.value;
filterNode.Q.value = filterQ.value;

// Delay FX
const delayNode = audioCtx.createDelay();
delayNode.delayTime.value = delayDuration.value;
const feedback = audioCtx.createGain();
feedback.gain.value = delayFeedback.value;
delayNode.connect(feedback);
feedback.connect(delayNode);

// Distortion FX
const distortionNode = audioCtx.createWaveShaper();
distortionNode.curve = makeDistortionCurve(Number(distortionCurve.value));
distortionNode.oversample = "4x";

// Reverb FX
const reverbNode = audioCtx.createConvolver();
reverbNode.buffer = null;
const reverbWetGain = audioCtx.createGain();
reverbWetGain.gain.value = 0.5;
reverbWetGain.connect(reverbNode);

// Wet and Dry Gains
const mainDryGain = audioCtx.createGain();
mainDryGain.gain.value = 0.75;
const mainWetGain = audioCtx.createGain();
mainWetGain.gain.value = 0.75;

// --------------- Connection Chain --------------
// Distortion connetions
distortionNode.connect(filterNode);

// Filter connections
filterNode.connect(mainDryGain);
filterNode.connect(delayNode);
filterNode.connect(reverbWetGain);

// Delay connections
delayNode.connect(mainDryGain);
delayNode.connect(reverbWetGain);

// Reverb connections
reverbNode.connect(mainWetGain);

// Outputs
mainDryGain.connect(masterGainNode);    // dry to master
mainWetGain.connect(masterGainNode);    // wet to master
masterGainNode.connect(audioCtx.destination);   // destination

function playNote(noteFrequency, wave = "sine") {
    if (!activeOscillators[noteFrequency]) {
        const osc = new OscillatorNode(audioCtx, {
            type: wave,
            frequency: noteFrequency,
        });

        // Create a gain node for the oscillator
        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.2;   // Decrease gain value do the audio doesn't clip when multiple notes are pressed

        // Connect nodes
        osc.connect(oscGain);
        oscGain.connect(distortionNode);

        osc.start();

        activeOscillators[noteFrequency] = { osc, oscGain };
    }
}

function stopNote(noteFrequency) {
    if (activeOscillators[noteFrequency]) {
        activeOscillators[noteFrequency].oscGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015); // Stop pop and click sounds
        delete activeOscillators[noteFrequency];
    }
}

function calculateFrequency(noteNumber, isMidi = false) {
    if (isMidi) {
        return 2 ** ((noteNumber - 69) / 12) * 440;
    }

    return 2 ** ((noteNumber - 49) / 12) * 440;
}

function makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

// Grab audio track via fetch() for convolver node
async function fetchImpulseResponse(audioPath) {
    try {
        if (!audioPath) {
            reverbNode.buffer = null;
            return;
        }

        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
        reverbNode.buffer = decodedAudio;
    } catch (error) {
        console.error(
            `Unable to fetch the audio file. Error: ${err.message}`,
        );
        reverbNode.buffer = null;
    }
}

// Update volume
volume.addEventListener("input", event => masterGainNode.gain.value = event.target.value / 100);

// Update filter parameters
filterFrequency.addEventListener("input", (event) => {
    filterNode.frequency.value = event.target.value;
    filterFrequencyCounter.textContent = `${event.target.value} Hz`;
});

filterQ.addEventListener("input", (event) => {
    filterNode.Q.value = event.target.value
    filterQCounter.textContent = event.target.value;
});

// Update delay parameters
delayDuration.addEventListener("input", (event) => {
    delayNode.delayTime.value = event.target.value / 1000;
    delayDurationCounter.textContent = `${event.target.value} ms`;
});

delayFeedback.addEventListener("input", (event) => {
    feedback.gain.value = event.target.value / 100
    delayFeedbackCounter.textContent = `${event.target.value}%`;
});

// Update distortion parameters
distortionCurve.addEventListener("input", (event) => {
    distortionNode.curve = makeDistortionCurve(Number(event.target.value))
    distortionCurveCounter.textContent = event.target.value;
});

// Update reverb impulse response
reverbImpulseResponse.addEventListener("change", () => {
    fetchImpulseResponse(reverbImpulseResponse.options[reverbImpulseResponse.selectedIndex].value);
});

// Update wave type
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

    key.addEventListener("mousedown", event => playNote(event.target.dataset.frequency, wave));
    key.addEventListener("touchstart", event => playNote(event.target.dataset.frequency, wave));

    key.addEventListener("mouseup", event => stopNote(event.target.dataset.frequency));
    key.addEventListener("mouseleave", event => stopNote(event.target.dataset.frequency));
    key.addEventListener("touchend", event => stopNote(event.target.dataset.frequency));
});

function handleKeyboardPresses() {
    const onScreenPianoKeys = Array.from(keys);

    document.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        const noteEntry = keyboardNoteMap.find(element => element.key === event.code);

        if (noteEntry) {
            const frequency = calculateFrequency(noteEntry.noteNumber);
            playNote(frequency, wave);

            const activePianoKey = onScreenPianoKeys.find((key) => Number(key.dataset.noteNumber) === Number(noteEntry.noteNumber));
            activePianoKey.classList.add("active-key");
        }
    });

    document.addEventListener("keyup", (event) => {
        const noteEntry = keyboardNoteMap.find(element => element.key === event.code);

        if (noteEntry) {
            const frequency = calculateFrequency(noteEntry.noteNumber);
            stopNote(frequency);

            const activePianoKey = onScreenPianoKeys.find((key) => Number(key.dataset.noteNumber) === Number(noteEntry.noteNumber));
            activePianoKey.classList.remove("active-key");
        }
    });
}

// Handles MIDI
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((access) => {
        const inputs = access.inputs.values();
        const onScreenPianoKeys = Array.from(keys);

        inputs.forEach((input) => {
            input.onmidimessage = (message) => {
                const [status, noteNumber, velocity] = message.data;
                const frequency = calculateFrequency(noteNumber, true);
                // console.log(message.data);

                // 224 and 176 - controls and mod wheel
                // 144 and 128 - keys
                if (status === 144 && velocity > 0) {
                    playNote(frequency, wave);

                    const activePianoKey = onScreenPianoKeys.find((key) => Number(key.dataset.noteNumber) === Number(noteNumber - 20));
                    if (activePianoKey) {
                        activePianoKey.classList.add("active-key");
                    }
                } else if (status === 128 && velocity === 0) {
                    stopNote(frequency);
                    const activePianoKey = onScreenPianoKeys.find((key) => Number(key.dataset.noteNumber) === Number(noteNumber - 20));
                    if (activePianoKey) {
                        activePianoKey.classList.remove("active-key");
                    }
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