"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const audio = document.querySelector("#background-music");
    const toggle = document.querySelector("#music-toggle");
    const label = document.querySelector("#music-label");

    if (!audio || !toggle || !label) return;

    const trackName = audio.dataset.trackName;

    function updateButton() {
        const isPlaying = !audio.paused;
        const action = isPlaying ? "Pause" : "Play";
        toggle.setAttribute("aria-pressed", String(isPlaying));
        toggle.setAttribute("aria-label", `${action} ${trackName}`);
        label.textContent = `${action} ${trackName}`;
    }

    async function playMusic() {
        try {
            await audio.play();
        } catch (error) {
            if (error.name === "NotAllowedError") {
                label.textContent = `Click to play ${trackName}`;
                return;
            }

            label.textContent = `Couldn't play ${trackName}`;
        }
    }

    toggle.addEventListener("click", () => {
        if (audio.paused) {
            playMusic();
        } else {
            audio.pause();
        }
    });

    audio.addEventListener("play", updateButton);
    audio.addEventListener("pause", updateButton);
    audio.addEventListener("error", () => {
        label.textContent = `Couldn't load ${trackName}`;
    });

    updateButton();
});
