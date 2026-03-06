import { stageArea } from './stageArea.js';

export const bombActions = {
    numDropSteps: 20,
    dropInterval: 80,

    dropBomb(bombNum, dx, px, py) {
        let sy = py + stageArea.maxBomberHeight;
        let sx = px + stageArea.maxBomberWidth / 2 - stageArea.bombWidth / 2;
        let dy = (stageArea.currentStageHeight - stageArea.foregroundStripHeight - 
            stageArea.buildingHeight - py) / this.numDropSteps;

        let start = true;
        stageArea.setBomb(start, bombNum, sx, sy);
        start = false;

        let count = 0;
        let x = sx;
        let y = sy;
        let bombDropInterval = setInterval(() => {
            x += dx;
            y += dy;
            stageArea.setBomb(start, bombNum, x, y);
            ++count;
            if (count >= this.numDropSteps) {
                stageArea.clearBomb(bombNum);
                clearInterval(bombDropInterval);
            }
        }, this.dropInterval)


    }
}