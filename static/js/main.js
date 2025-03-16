export function playAudio(audioPath) {
    const sound = new Audio(audioPath);
    sound.play().catch(err => console.error("Playback error:", err));
}

export function muteAudio(...audioFiles) {
    for (const audioFile of audioFiles) {
        audioFile.muted = true;
    }
}

export function unMuteAudio(...audioFiles) {
    for (const audioFile of audioFiles) {
        audioFile.muted = false;
    }
}