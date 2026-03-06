import { stageArea } from './stageArea.js';
import { bombActions } from './bombActions.js';

export const bomberActions = {
    numApproachSteps: 36,
    approachStepInterval: 80,
    bomberApproachTime: 36 * 80,
    bombsAwayCount: 30,
    numBombs: 1,
    bombsDropped: 0,

    approach() {
        let sy = stageArea.bomberHorizon;
        let dy = -((sy - stageArea.minBomberY) / this.numApproachSteps);

        // Set the initial bomber x position
        let xLow = -stageArea.minBomberWidth / 2;
        let xHigh = stageArea.currentStageWidth - stageArea.minBomberWidth / 2;
        let targetXLow = -stageArea.maxBomberWidth / 2;
        let targetXHigh = stageArea.currentStageWidth - stageArea.maxBomberWidth / 2;
        let sx = Math.random() * (xHigh - xLow) + xLow;
        let ex = Math.random() * (targetXHigh - targetXLow) + targetXLow;
        let dx = (ex - sx) / this.numApproachSteps;

        let sw = stageArea.minBomberWidth;
        let dw = (stageArea.maxBomberWidth - stageArea.minBomberWidth) / this.numApproachSteps;
        let sh = stageArea.minBomberHeight;
        let dh = (stageArea.maxBomberHeight - stageArea.minBomberHeight) / this.numApproachSteps;

        let start = true
        stageArea.setBomber(start, sx, sy, sw, sh);
        start = false;

        // Step move the aircraft
        this.bombsDropped = 0;
        let count = 0;
        let x = sx;
        let y = sy;
        let w = sw;
        let h = sh;

        let approachInterval = setInterval(() => {
            x = x + dx;
            y = y + dy;
            w = w + dw;
            h = h + dh;
            stageArea.setBomber(start, x, y, w, h);

            ++count;
            if (count >= this.numApproachSteps) {
                clearInterval(approachInterval);
                stageArea.clearBomber();
            }
            if (count >= this.bombsAwayCount && this.bombsDropped < this.numBombs) {
                bombActions.dropBomb(this.bombsDropped, dx, x, y);
                ++this.bombsDropped;
            }
       }, this.approachStepInterval);
    }
}