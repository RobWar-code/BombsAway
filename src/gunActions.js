import { stageArea } from './stageArea.js';
import { bomberActions } from './bomberActions.js';
import { game } from './game.js';

export const gunActions = {
    gunLocked: false,
    numShellSteps: 24,

    fire() {
        if (this.gunLocked) return;

        this.gunLocked = true;
        let pos = stageArea.AAGunNode.getAbsolutePosition();
        let x = pos.x + stageArea.gunWidth/2 - stageArea.gunBlastWidth / 2;
        stageArea.setGunBlast(x);
        setTimeout(() => {
            stageArea.clearGunBlast();
        }, 300);

        this.launchShell();
    },

    launchShell() {
        // Get the position of the gun point
        let pos = stageArea.AAGunNode.getAbsolutePosition();
        let shellX = pos.x + stageArea.gunWidth/2 - stageArea.shellWidth / 2;
        let shellY = pos.y - stageArea.shellHeight;

        // Determine the layer to use
        let shellLayer = stageArea.gunLayer;
        if (bomberActions.posCount < bomberActions.bomberHitLow) {
            shellLayer = stageArea.aircraftLayer;
        }

        let start = true;
        stageArea.setShell(start, shellLayer, shellX, shellY);

        // Shell Motion
        start = false;
        let count = 0;
        let dy = (stageArea.currentStageHeight - (stageArea.currentStageHeight - shellY) - 40) 
            / this.numShellSteps;

        let shellInterval = setInterval(() => {
            shellY -= dy;
            // Check whether a bomber struck
            let w = stageArea.maxBomberWidth * 2/3;
            let bx = bomberActions.posX + w / 2;
            let dbx = Math.abs(bx - shellX);
            let by = bomberActions.posY;
            let dby = by - shellY;
            let h = stageArea.maxBomberHeight;
            let z = bomberActions.posCount;
            if ((dbx < w / 2) && (dby > 0 && dby < h + 10) && 
                (z >= bomberActions.bomberHitLow && z <= bomberActions.bomberHitHigh)) {
                stageArea.clearShell(shellLayer);
                bomberActions.explodeBomber();
                clearInterval(shellInterval);
                game.setBomberHitPoints();
                this.gunLocked = false;
            }
            else {
                stageArea.setShell(start, shellLayer, shellX, shellY);
                ++count;
                if (count >= this.numShellSteps) {
                    this.explodeShell(shellLayer, shellX, shellY);
                    stageArea.clearShell(shellLayer);
                    clearInterval(shellInterval);
                    this.gunLocked = false;
                }
            }
        }, 60);
    },

    explodeShell(shellLayer, shellX, shellY) {
        let x = shellX + stageArea.shellWidth/2 - stageArea.shellExplosionWidth/2;
        let y = shellY + stageArea.shellHeight/2 - stageArea.shellExplosionHeight/2;
        stageArea.setShellExplosion(shellLayer, x, y);
        setTimeout(() => {
            stageArea.clearShellExplosion(shellLayer);
        }, 300);
    }
}