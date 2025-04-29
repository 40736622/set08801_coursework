/**
 *  Plays a Howl audio instance if sound is not muted.
 * @param {Howl} audio - An instance of the Howl audio object to be played.
 * @param {Boolean} isMute - Indicates whether audio playback is muted. 
 */
export function playAudio(audio, isMute) {
    if (isMute) return;
    audio.play();
}

/**
 * Toggles volume mute/unmute.
 * @param {Boolean} isMute - Current mute state.
 * @param {HTMLElement} volumeIcon - DOM element representing the volume icon.
 * @returns {Boolean} The updated mute state.
 */
export function toggleVolume(isMute, volumeIcon) {
    const muteState = !isMute;
    volumeIcon.classList.remove(muteState ? "bi-volume-up-fill" : "bi-volume-mute-fill");
    volumeIcon.classList.add(muteState ? "bi-volume-mute-fill" : "bi-volume-up-fill");
    return muteState;
}