import { stageArea } from './stageArea.js';

export const bomberActions = {
    numApproachSteps: 12,

    approach() {
        let sy = stageArea.bomberHorizon;
        let dy = (sy - stageArea.minBomberY) / this.numApproachSteps;
        let sx = stageArea.currentStageWidth / 2 - stageArea.minBomberWidth / 2
        let dx = -(((stageArea.bomberMaxWidth - stageArea.minBomberWidth) / 2) / 
            this.numApproachSteps)
        let sw = stageArea.minBomberWidth;
        let dw = (stageArea.maxBomberWidth - stageArea.minBomberWidth) / this.numApproachSteps;
        let sh = stageArea.minBomberHeight;
        let dh = (stageArea.maxBomberHeight - stageArea.minBomberHeight) / this.numApproachSteps;

        console.log("Got Here: sx, sy, sw, sh", sx, sy, sw, sh);
        stageArea.setBomber(sx, sy, sw, sh);
    }
}