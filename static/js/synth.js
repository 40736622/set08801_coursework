const keys = document.querySelectorAll(".white-key, .black-key")
const audioCtx = new (AudioContext || webkitAudioContext)();
let midi = null;

const keyboardKeys = [
    "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", 
    "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", 
    "Quote", "KeyZ", "KeyX"
];

// Remember MediaStream Recording API

function playNotes() {
    const osc = new OscillatorNode(audioCtx, {
        type: "square",
        frequency: 440,
    });

    osc.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 1);
}

keys.forEach((key) => {
    let osc = null;

    key.addEventListener("mousedown", (event) => {
        osc = new OscillatorNode(audioCtx, {
            type: "triangle",
            frequency: event.target.dataset.frequency,
        });

        osc.connect(audioCtx.destination);

        osc.start();
    });

    key.addEventListener("mouseup", () => {
        if (osc) {
            osc.stop();
            osc = null
        }
    });

    key.addEventListener("mouseleave", () => {
        if (osc) {
            osc.stop();
            osc = null
        }
    });
});

document.addEventListener("keyup", (event) => {
    console.log(event.code);
});

// navigator.permissions.query({ name: "midi", sysex: true }).then((result) => {
//     if (result.state === "granted") {
//       // Access granted.
//     } else if (result.state === "prompt") {
//       // Using API will prompt for permission
//     }
//     // Permission was denied by user prompt or permission policy
// });