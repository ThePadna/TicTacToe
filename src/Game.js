import CellState from './wrappers/CellState'
import CanvasCoordinates from './wrappers/CanvasCoordinates'
import CanvasCoordinatesSelection from './wrappers/CanvasCoordinatesSelection'
import DrawCircleAnim from './tasks/DrawCircleAnim'
import DrawCrossAnim from './tasks/DrawCrossAnim'

class Game {

    constructor(gridSize) {
        this.size = gridSize;
        this.jumpSize = null;
        this.gameState = [gridSize * gridSize];
        this.turn = 0;
        this.p1Symbol = (Math.random() * 2) < 1 ? "x" : "o";
        this.aiTakeTurn = this.aiTakeTurn.bind(this);
    }

    draw() {
        let canv = document.getElementById("gamecanvas");
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.width, MAX_HEIGHT = canv.height;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        let pixelJumpSize = (MAX_WIDTH / this.size), pixelCurVert = 0, pixelCurHori = 0;
        this.jumpSize = pixelJumpSize;
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
            this.gameState[i] = new CellState(new CanvasCoordinatesSelection(new CanvasCoordinates(topLeftX, topLeftY), new CanvasCoordinates(bottomRightX, bottomRightY)), i);
        }
    }

    clicked(cc, ctx, jumpSize) {
        if(this.turn != 0) return;
        for(let i = 0; i < this.gameState.length; i++) {
            let sel = this.gameState[i].getSelection();
            if(sel.contains(cc)) {
                let coord1 = sel.getCoord1(), coord2 = sel.getCoord2();
                let midX = ((coord1.getX() + coord2.getX()) / 2), midY = ((coord1.getY() + coord2.getY()) / 2);
                ctx.lineWidth = (50 / this.size);
                this.gameState[i].claim(this.turn, this.p1Symbol, jumpSize);
                this.turn = 1;
                this.setDisplayWhosTurn("AI's")
                setTimeout(this.aiTakeTurn, 1500);
            }
        }
    }

    // missPlay should be a value from 0-100 which acts as a percentage value of which the AI will missplay
    // A missplay will go strictly for win condition and not try to play defense
    aiTakeTurn() {
        let missPlay = 10, symbol = this.p1Symbol === "x" ? "o" : "x";
        let rdm = Math.random() * 100;
        let aiClaims = [];
        let found = false;
        for(let i = 0; i < this.gameState.length; i++) {
            if(this.gameState[i].getOwner() === 1) {
                aiClaims.push(this.gameState[i]);
                found = true;
            }
        }
        if(!found) {
            //first turn
            for(let i = 0; i < this.gameState.length; i++) {
                if(this.gameState[i].getOwner() === null) {
                    this.gameState[i].claim(this.turn, symbol, this.jumpSize);
                    break;
                }
            }
        }

        let move = null;
        if(rdm <= missPlay) {
        } else {
        }
        this.turn = 0;
        this.setDisplayWhosTurn("your")
    }
    getRow(index) {
        return (Math.floor(index / this.size));
    }

    setDisplayWhosTurn(info) {
        info = "&nbsp;" + info + "&nbsp;";
        document.getElementById("turn-info").getElementsByTagName("span")[0].innerHTML = info;
    }
}

export default Game;