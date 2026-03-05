import { stageArea } from "./stageArea.js";
import { game } from "./game.js";

start();

async function start() {
    await stageArea.initialise();
    game.start();
}
