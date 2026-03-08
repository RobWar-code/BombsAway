import { stageArea } from './stageArea.js';
import { bomberActions } from './bomberActions.js';

export const game = {
    numBombRuns: 20,
    bomberHitPoints: 40,
    buildingBombedPoints: -10,
    points: 0,
    
    setGameConstants() {
        this.numBombRuns = Math.floor(stageArea.numBuildings * 5);
    },

    start() {
        this.setGameConstants();
        let bomberInterval = bomberActions.bomberApproachTime + 2000;
        let count = 0;
        let bombRunInterval = setInterval(() => {
            bomberActions.approach();
            ++count;
            if (count >= this.numBombRuns) {
                clearInterval(bombRunInterval);
            }
        }, bomberInterval);
    },

    setBuildingBombedPoints() {
        this.points -= this.buildingBombedPoints;
        this.displayScore();
    },

    setBomberHitPoints() {
        this.points += this.bomberHitPoints;
        this.displayScore();
    },

    displayScore() {
        document.getElementById('points').innerText = this.points;
    }

}