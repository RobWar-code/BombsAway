export const stageArea = {

    host: document.getElementById('stageHost'),
    stage: null,
    mainImageLayer: new Konva.Layer(),
    buildingGroup: new Konva.Group(),
    gunLayer: new Konva.Layer(),
    gunGroup: new Konva.Group(),
    aircraftLayer: new Konva.Layer(),

    stageSizeNum: 0,
    stageSizes: [
        {width: 1200, height: 500, thresholdWidth: 1260},
        {width: 800, height: 500, thresholdWidth: 820},
        {width: 500, height: 500, thresholdWidth: 520},
        {width: 360, height: 500, thresholdWidth: 430}
    ],
    currentStageWidth: 0,
    currentStageHeight: 500,

    images: [],
    foregroundStripHeight: 40,
    numBuildingImages: 12,
    numBuildings: 10,
    buildingWidth: 40,
    buildingHeight: 70,
    buildingList: [], // Building Image No.s {id: "", bombed: false}
    buildingSet: [], // Image Nodes
    gunHeight: 90,
    gunWidth: 65,
    gunBase: 5,
    fireButtonWidth: 40,
    fireButtonHeight: 40,
    // Bomber
    bomberHorizon: 300,
    minBomberY: 50,
    minBomberWidth: 30,
    maxBomberWidth: 100,
    minBomberHeight: 12,
    maxBomberHeight: 40,

    async initialise() {
        // Find the appropriate stage size
        const windowWidth = window.innerWidth;
        let found = false;
        let index = 0;
        for (let item of this.stageSizes) {
            if (item.thresholdWidth < windowWidth) {
                found = true;
                break;
            }
            ++index;
        }
        if (!found) index = this.stageSizes.length - 1;
        this.currentStageWidth = this.stageSizes[index].width;
        this.currentStageHeight = this.stageSizes[index].height;
        this.stageSizeNum = index;

        // Set-up the stage
        this.host.style.width = `${this.currentStageWidth}px`;
        this.host.style.height = `${this.currentStageHeight}px`;
        this.stage = new Konva.Stage({ container: this.host, width: this.currentStageWidth, height: this.currentStageHeight });

        await this.loadImages();

        // Layout the initial graphics
        this.layoutGraphics();
    },

    layoutGraphics() {
        // Do the sky background
        this.backgroundImage = this.images[`skyscape0${this.stageSizeNum + 1}`];
        this.backgroundNode = new Konva.Image({
            image: this.backgroundImage,
            x: 0,
            y: 0,
            width: this.currentStageWidth,   // scales the cropped region to this size
            height: this.currentStageHeight
        });

        // Foreground Strip
        this.foregroundNode = new Konva.Image({
            image: this.images['foreground'],
            x: 0,
            y: this.currentStageHeight - this.foregroundStripHeight,
            width: this.currentStageWidth,
            height: this.foregroundStripHeight
        })

        // Buildings
        this.getBuildings();

        // AA Gun
        this.AAGunNode = new Konva.Image({
            image: this.images['AAGun'],
            x: 0,
            y: 0,
            width: this.gunWidth,
            height: this.gunHeight
        });

        this.fireButtonNode = new Konva.Image({
            image: this.images['fireButton'],
            x: this.gunWidth / 2 - this.fireButtonWidth / 2,
            y: this.gunHeight / 4,
            width: this.firebuttonWidth,
            height: this.fireButtonHeight 
        });

        // Aircraft Nodes
        this.bomberNode = new Konva.Image({
            image: this.images['bomberFront'],
            x: this.currentStageWidth / 2 - this.minBomberWidth / 2,
            y: this.bomberHorizon,
            width: this.minBomberWidth,
            height: this.minBomberHeight
        });

        this.drawScene();
    },

    getBuildings() {
        this.numBuildings = Math.floor(this.currentStageWidth / this.buildingWidth);
        let selectionSet = []
        this.buildingList = [];

        // Create the selection set
        for (let i = 1; i <= this.numBuildingImages; i++) {
            selectionSet.push(i);
        }
        // Shuffle the set
        selectionSet = this.shuffleSet(selectionSet);

        // Select the list of buildings
        let count = 0;
        while (count < this.numBuildings) {
            for (let i = 0; i < this.numBuildingImages; i++) {
                let id = selectionSet[i] + "";
                if (selectionSet[i] < 10) id = "0" + id;
                let item = {id: id, bombed: false};
                this.buildingList.push(item);
                ++count;
                if (count >= this.numBuildings) break;
            }
            if (count < this.numBuildings) {
                selectionSet = this.shuffleSet(selectionSet);
            }
        }

        this.buildingSet = [];
        let index = 0;
        for (let building of this.buildingList) {
            let id = building.id;
            let buildingImage = this.images[`building${id}`];
            let buildingNode = new Konva.Image({
                image: buildingImage,
                x: index * this.buildingWidth,
                y: this.currentStageHeight - this.buildingHeight - this.foregroundStripHeight,
                width: this.buildingWidth,   // scales the cropped region to this size
                height: this.buildingHeight
            });
            this.buildingSet.push(buildingNode);
            ++index;
        }
    },

    shuffleSet(set) {
        for (let i = 0; i < set.length; i++) {
            let r1 = Math.floor(Math.random() * set.length);
            let r2 = Math.floor(Math.random() * set.length);
            let x = set[r1];
            set[r1] = set[r2];
            set[r2] = x;
        }
        return set;
    },

    setBomber(x, y, w, h) {
        this.bomberNode.x(x);
        this.bomberNode.y(y);
        this.bomberNode.width(w);
        this.bomberNode.height(h);
        this.aircraftLayer.draw();
    },

    drawScene() {
        // Add the background to the layer
        this.stage.destroyChildren();
        this.mainImageLayer.destroyChildren();
        this.mainImageLayer.add(this.backgroundNode);
        this.mainImageLayer.add(this.foregroundNode);

        // Set-up the building group
        this.buildingGroup.destroyChildren();
        for (let node of this.buildingSet) {
            this.buildingGroup.add(node);
        }
        this.mainImageLayer.add(this.buildingGroup);
        this.stage.add(this.mainImageLayer);

        // AA Gun
        this.gunLayer.destroyChildren();
        this.gunGroup.destroyChildren();
        this.gunGroup.position(
            {
                x: this.currentStageWidth / 2 - this.gunWidth / 2,
                y: this.currentStageHeight - this.gunHeight - this.gunBase
            }
        );
        this.gunGroup.draggable(true);
        this.gunGroup.dragBoundFunc((pos) => {
            return {
                x: Math.max(-30, Math.min(this.currentStageWidth - 30, pos.x)),
                y: this.currentStageHeight - this.gunHeight - this.gunBase
            }
        });
        this.gunGroup.add(this.AAGunNode);
        this.gunGroup.add(this.fireButtonNode);
        this.gunLayer.add(this.gunGroup);
        this.stage.add(this.gunLayer);

        // AirCraft
        this.aircraftLayer.add(this.bomberNode);
        this.stage.add(this.aircraftLayer);

        // Draw the Scene
        this.stage.batchDraw();
    },

    async loadImages() {
        // Backgrounds
        for (let i = 0; i < this.stageSizes.length; i++) {
            let url = `assets/images/skyscape0${i + 1}.png`;
            let varName = `skyscape0${i + 1}`;
            await this.loadImage(url, varName);
        }

        // Foreground Strip
        let url = "assets/images/foreground.png";
        let varName = "foreground";
        await this.loadImage(url, varName);

        // Buildings
        for (let i = 0; i < this.numBuildingImages; i++) {
            let id = i + 1 + "";
            if (i < 9) id = "0" + id;
            let url = `assets/images/building${id}.png`;
            let varName = `building${id}`;
            await this.loadImage(url, varName);
        }

        // AA Gun
        url = "assets/images/AAGun03.png";
        varName = "AAGun";
        await this.loadImage(url, varName);

        url = "assets/images/fireButton.png";
        varName = "fireButton";
        await this.loadImage(url, varName);

        // Aircraft Views
        url = "assets/images/bomberFront01.png";
        varName = "bomberFront";
        await this.loadImage(url, varName);
    },

    loadImage(url, varName, crossOrigin = 'anonymous') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            this.images[`${varName}`] = img;
            img.crossOrigin = crossOrigin; // requires server CORS headers if cross-origin
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }

}