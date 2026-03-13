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
        document.getElementById("statusPara").innerText = "";
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
            if (this.numBombRuns >= this.maxBombRuns || 
                stageArea.numBuildingsBombed >= stageArea.numBuildings) {
                clearInterval(this.bombRunInterval);
                this.gameOverActions();
            }
        }, bomberInterval);
    },

    pauseGame() {
        this.gamePaused = true;
        clearInterval(this.bombRunInterval);
    },

    gameOverActions() {
        // Check whether all the buildings are bombed
        let message = "";
        if (stageArea.numBuildingsBombed >= stageArea.numBuildings) {
            message = "Game Ended - all your buildings have been destroyed.";
        }
        else {
            let buildingsLeft = stageArea.numBuildings - stageArea.numBuildingsBombed;
            message = `Game Ended - the bombers are done, you saved ${buildingsLeft} buildings.`;
        }
        message += " Click Restart to start again.";
        document.getElementById("statusPara").innerText = message;
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