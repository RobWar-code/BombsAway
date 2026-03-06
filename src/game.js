import { stageArea } from './stageArea.js';
import { bomberActions } from './bomberActions.js';

export const game = {
    numBombRuns: 20,
    
    start() {
        let bomberInterval = bomberActions.bomberApproachTime + 2000;
        let count = 0;
        let bombRunInterval = setInterval(() => {
            bomberActions.approach();
            ++count;
            if (count >= this.numBombRuns) {
                clearInterval(bombRunInterval);
            }
        }, bomberInterval);
    }
}