import CellState from './wrappers/CellState'
import CanvasCoordinates from './wrappers/CanvasCoordinates'
import CanvasCoordinatesSelection from './wrappers/CanvasCoordinatesSelection'
import DrawCircleAnim from './tasks/DrawCircleAnim'
import DrawCrossAnim from './tasks/DrawCrossAnim'

class Game {

    constructor(ai, gridSize) {
        this.ai = ai;
        this.size = gridSize;
        this.gameState = [gridSize * gridSize];
        this.draw.bind(this);
    }

    draw() {
        let canv = document.getElementById("gamecanvas");
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.width, MAX_HEIGHT = canv.height;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        let pixelJumpSize = (MAX_WIDTH / this.size), pixelCurVert = 0, pixelCurHori = 0;
        canv.addEventListener('click', (e) => { this.clicked(new CanvasCoordinates(e.offsetX, e.offsetY), ctx, pixelJumpSize); });
        for(let i = 0; i < this.size; i++) {
            pixelCurHori+=pixelJumpSize;
            ctx.moveTo(pixelCurHori, 0);
            ctx.lineTo(pixelCurHori, MAX_HEIGHT);
            ctx.stroke();
        }
        for(let i = 0; i < this.size; i++) {
            pixelCurVert+=pixelJumpSize;
            ctx.moveTo(0, pixelCurVert);
            ctx.lineTo(MAX_WIDTH, pixelCurVert);
            ctx.stroke();
        }
        let pixelVert = 0, pixelHor = 0;
        let firstRun = true;
        for(let i = 0; i < this.size * this.size; i++) {
            if(firstRun) {
                pixelHor += (pixelJumpSize);
                firstRun = false;
            }
            if((pixelVert + pixelJumpSize) > MAX_HEIGHT) {
                pixelVert = 0;
                pixelHor += (pixelJumpSize);
            }
            let topLeftX = (pixelHor - pixelJumpSize), topLeftY = pixelVert;
            pixelVert += pixelJumpSize;
            let bottomRightX = pixelHor, bottomRightY = pixelVert;
            this.gameState[i] = new CellState(new CanvasCoordinatesSelection(new CanvasCoordinates(topLeftX, topLeftY), new CanvasCoordinates(bottomRightX, bottomRightY)));
        }
    }

    clicked(cc, ctx, jumpSize) {
        for(let i = 0; i < this.gameState.length; i++) {
            let sel = this.gameState[i].getSelection();
            if(sel.contains(cc)) {
                let coord1 = sel.getCoord1(), coord2 = sel.getCoord2();
                let midX = ((coord1.getX() + coord2.getX()) / 2), midY = ((coord1.getY() + coord2.getY()) / 2);
                ctx.lineWidth = (50 / this.size);
                //new DrawCrossAnim(ctx, new CanvasCoordinates(midX, midY), 1.5, (jumpSize / 3)).tick();
                //new DrawCircleAnim(ctx, new CanvasCoordinates(midX, midY), (jumpSize / 3), 0, Math.PI * 2, (Math.PI * 2) / 50).tick();
            }
        }
    }
}

export default Game;