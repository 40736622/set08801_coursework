export function playAudio(audioPath, isMute) {
    if (!isMute) {
        const sound = new Audio(audioPath);
        sound.play().catch(err => console.error("Playback error:", err));
    }
}

// export function toggleMute(...audioFiles) {
//     for (const audioFile of audioFiles) {
//         audioFile.muted = !audioFile.muted;
//         audioFile.pause();
//     }
// }