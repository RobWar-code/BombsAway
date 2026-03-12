import { stageArea } from "./stageArea.js";
import { game } from "./game.js";
import { soundEffects } from "./soundEffects.js";

init();

document.getElementById("homeBtn").addEventListener("click", (e) => {
    window.location = '../index.html';
});

document.getElementById("restartButton").addEventListener("click", (e) => {
    game.clearDown();
    init();
    game.restart();
});

document.getElementById("soundCell").addEventListener("click", (e) => {
    soundEffects.setAudio();
});

document.getElementById("introBtn").addEventListener("click", (e) => {
    document.getElementById("introDiv").style.display = "block";
    game.pauseGame();
});

document.getElementById("introDismiss").addEventListener("click", (e) => {
    document.getElementById("introDiv").style.display = "none";
    if (!game.gameStarted || game.gamePaused) {
        startGame();
    }
});

async function init() {
    await stageArea.initialise();
}

function startGame() {
    game.start();
}
