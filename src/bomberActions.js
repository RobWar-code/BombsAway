import { stageArea } from './stageArea.js';
import { bombActions } from './bombActions.js';
import { soundEffects } from './soundEffects.js';

export const bomberActions = {
    numApproachSteps: 56,
    approachStepInterval: 100,
    bomberApproachTime: 56 * 100,
    bombsAwayCount: 46,
    numBombs: 1,
    bombsDropped: 0,
    posCount: 0,
    posX: 0,
    posY: 0,
    aircraftWidth: 0,
    aircraftHeight: 0,
    bomberHitLow: 38,
    bomberHitHigh: 44,
    approachInterval: null,

    clearDown() {
        clearInterval(this.approachInterval);
        soundEffects.bomberStop();
        bombActions.clearDown();
    },

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
        soundEffects.bomberStart();
        start = false;

        // Step move the aircraft
        this.bombsDropped = 0;
        this.posCount = 0;
        let x = sx;
        let y = sy;
        let w = sw;
        let h = sh;
        this.posX = x;
        this.posY = y;
        this.aircraftWidth = w;
        this.aircraftHeight = h;

        this.approachInterval = setInterval(() => {
            x = x + dx;
            y = y + dy;
            w = w + dw;
            h = h + dh;
            this.posX = x;
            this.posY = y;
            this.aircraftWidth = w;
            this.aircraftHeight = h;
            stageArea.setBomber(start, x, y, w, h);

            ++this.posCount;
            if (this.posCount >= this.numApproachSteps) {
                clearInterval(this.approachInterval);
                stageArea.clearBomber();
                soundEffects.bomberStop();
                this.posCount = 0;
            }
            if (this.posCount >= this.bombsAwayCount && this.bombsDropped < this.numBombs) {
                bombActions.dropBomb(this.bombsDropped, dx, x, y);
                ++this.bombsDropped;
            }
       }, this.approachStepInterval);
    },

    explodeBomber() {
        clearInterval(this.approachInterval);
        stageArea.clearBomber();
        stageArea.setBomberExplosion(this.posX, this.posY);
        soundEffects.bomberStop();
        soundEffects.play("aircraftExplode");
        setTimeout(() => {
            stageArea.clearBomberExplosion();
        }, 400);
        this.posCount = 0;
    }
}