class Game {

    constructor(ai, gridSize) {
        this.ai = ai;
        this.size = gridSize;
        this.gameState = [gridSize * gridSize];
    }

    draw() {
        let canv = document.getElementById("gamecanvas");
        canv.addEventListener('click', (e) => { this.clicked(e.offsetX, e.offsetY); });
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.width, MAX_HEIGHT = canv.height;
        console.log("MIN_WIDTH:=" + MIN_WIDTH + " MAX_WIDTH=" + MAX_WIDTH + " MIN_HEIGHT=" + MIN_HEIGHT + " MAX_HEIGHT=" + MAX_HEIGHT);
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        let pixelJumpSizeHori = (MAX_WIDTH / this.size), pixelJumpSizeVert = (MAX_HEIGHT / this.size);
        let pixelCurVert = 0, pixelCurHori = 0;
        for(let i = 0; i < this.size; i++) {
            pixelCurHori+=pixelJumpSizeHori;
            ctx.moveTo(pixelCurHori, 0);
            ctx.lineTo(pixelCurHori, MAX_HEIGHT);
            ctx.stroke();
        }
        for(let i = 0; i < this.size; i++) {
            pixelCurVert+=pixelJumpSizeVert;
            ctx.moveTo(0, pixelCurVert);
            ctx.lineTo(MAX_WIDTH, pixelCurVert);
            ctx.stroke();
        }
        let pixelVert = 0, pixelHor = 0;
        let firstRun = true;
        for(let i = 0; i < this.size * this.size; i++) {
            if(firstRun) {
                pixelHor += (pixelJumpSizeHori);
                firstRun = false;
            }
            if((pixelVert + pixelJumpSizeVert) > MAX_HEIGHT) {
                pixelVert = 0;
                pixelHor += (pixelJumpSizeHori);
            }
            let topLeftX = (pixelHor - pixelJumpSizeHori), topLeftY = pixelVert;
            pixelVert += pixelJumpSizeVert;
            let bottomRightX = pixelHor, bottomRightY = pixelVert;
            //console.log("box #" + i + " FROM x" + topLeftX + " y" + topLeftY + " TO " + " x" + bottomRightX + " y" + bottomRightY)
            gameState[i] = new CanvasCoordinatesSelection(new CanvasCoordinates(topLeftX, topLeftY), new CanvasCoordinates(bottomRightX, bottomRightY)); 
        }
    }

    clicked(x, y) {
        console.log("clicked at x " + x + " y " + y);
    }

}

export default Game;