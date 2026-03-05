import { stageArea } from './stageArea.js';
import { bomberActions } from './bomberActions.js';

export const game = {
    start() {
        bomberActions.approach();
    }
}