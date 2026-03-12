import { stageArea } from './stageArea.js';
import { bomberActions } from './bomberActions.js';
import { gunActions } from './gunActions.js';

export const game = {
    maxBombRuns: 20,
    numBombRuns: 0,
    bombRunInterval: null,
    bomberHitPoints: 40,
    buildingBombedPoints: -10,
    gameStarted: false,
    gamePaused: false,
    points: 0,
    
    setGameConstants() {
        this.maxBombRuns = Math.floor(stageArea.numBuildings * 5);
    },

    clearDown() {
        clearInterval(this.bombRunInterval);
        bomberActions.clearDown();
        gunActions.clearDown();
    },

    restart() {
        if (this.gameStarted) {
            this.gameStarted = false;
            this.gamePaused = false;
        }
        this.start();
    },

    start() {
        this.points = 0;
        document.getElementById("points").innerText = this.points;
        let bomberInterval = bomberActions.bomberApproachTime + 4000;
        if (!this.gamePaused) {
            this.setGameConstants();
            this.gameStarted = true;
            this.numBombRuns = 0;
        }
        else {
            this.gamePaused = false;
        }
        this.bombRunInterval = setInterval(() => {
            bomberActions.approach();
            ++this.numBombRuns;
            if (this.numBombRuns >= this.maxBombRuns) {
                clearInterval(this.bombRunInterval);
            }
        }, bomberInterval);
    },

    pauseGame() {
        this.gamePaused = true;
        clearInterval(this.bombRunInterval);
    },

    setBuildingBombedPoints() {
        this.points += this.buildingBombedPoints;
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