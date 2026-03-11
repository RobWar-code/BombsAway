import { stageArea } from "./stageArea.js";
import { game } from "./game.js";
import { soundEffects } from "./soundEffects.js";

start();

document.getElementById("soundCell").addEventListener("click", (e) => {
    soundEffects.setAudio();
});

async function start() {
    await stageArea.initialise();
    game.start();
}
