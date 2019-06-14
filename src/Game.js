import CellState from './wrappers/CellState'
import CanvasCoordinates from './wrappers/CanvasCoordinates'
import CanvasCoordinatesSelection from './wrappers/CanvasCoordinatesSelection'
import DrawCircleAnim from './tasks/DrawCircleAnim'
import DrawCrossAnim from './tasks/DrawCrossAnim'
import { throws } from 'assert';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

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
        for (let i = 0; i < this.size; i++) {
            pixelCurHori += pixelJumpSize;
            ctx.moveTo(pixelCurHori, 0);
            ctx.lineTo(pixelCurHori, MAX_HEIGHT);
            ctx.stroke();
        }
        for (let i = 0; i < this.size; i++) {
            pixelCurVert += pixelJumpSize;
            ctx.moveTo(0, pixelCurVert);
            ctx.lineTo(MAX_WIDTH, pixelCurVert);
            ctx.stroke();
        }
        let pixelVert = 0, pixelHor = 0;
        let firstRun = true;
        for (let i = 0; i < this.size * this.size; i++) {
            if (firstRun) {
                pixelHor += (pixelJumpSize);
                firstRun = false;
            }
            if ((pixelVert + pixelJumpSize) > MAX_HEIGHT) {
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
        if (this.turn != 0) return;
        for (let i = 0; i < this.gameState.length; i++) {
            let sel = this.gameState[i].getSelection();
            if (sel.contains(cc)) {
                console.log("Index : " + this.gameState[i].getIndex());
                console.log("Index next row : " + this.gameState[i].getIndex() * this.gameState[i].getIndex());
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
        let aiClaims = [], playerClaims = [];
        let found = false;
        for (let i = 0; i < this.gameState.length; i++) {
            if (this.gameState[i].getOwner() === 1) {
                aiClaims.push(this.gameState[i]);
                found = true;
            } else if (this.gameState[i].getOwner() == 0) {
                playerClaims.push(this.gameState[i]);
            }
        }
        if (!found) {
            //first turn
            if (playerClaims.length > 0) {
                for (let i = 0; i < this.gameState.length; i++) {
                    console.log(Math.floor((this.size * this.size) / 2));
                    if (this.gameState[i].getIndex() == (Math.floor((this.size * this.size) / 2))) {
                        if (this.gameState[i].getOwner() === null) {
                            this.gameState[i].claim(this.turn, symbol, this.jumpSize);
                        } else {
                            let num = Math.random() * 2 < 1 ? 0 : this.gameState.length - 1;
                            this.gameState[num].claim(this.turn, symbol, this.jumpSize);
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < playerClaims.length; i++) {
                let index = playerClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
                if (this.isInBounds(top) && this.isOnSameRow(index, top)) {
                    let farthest = (top - 1);
                    if (this.isInBounds(farthest) && this.isOnSameRow(top, farthest)) {
                        if (this.findByIndex(top).getOwner() == 0) {
                            if(this.findByIndex(farthest).getOwner() == null) this.findByIndex(farthest).claim(this.turn, symbol, this.jumpSize);
                        } else if (this.findByIndex(farthest).getOwner() == 0) {
                            if(this.findByIndex(top).getOwner() == null) this.findByIndex(top).claim(this.turn, symbol, this.jumpSize);
                        }
                    }
                }
                if (this.isInBounds(bottom) && this.isOnSameRow(index, bottom)) {
                    let farthest = (bottom + 1);
                    if (this.isInBounds(farthest) && this.isOnSameRow(bottom, farthest)) {
                        if (this.findByIndex(bottom).getOwner() == 0) {
                            if(this.findByIndex(farthest).getOwner() == null) this.findByIndex(farthest).claim(this.turn, symbol, this.jumpSize);
                        } else if (this.findByIndex(farthest).getOwner() == 0) {
                            if(this.findByIndex(bottom).getOwner() == null) this.findByIndex(bottom).claim(this.turn, symbol, this.jumpSize);
                        }
                    }
                }
            }
        }
        this.turn = 0;
        this.setDisplayWhosTurn("your")
    }

isInBounds(index) {
    return index >= 0 && index < (this.size * this.size);
}

isOnSameRow(i1, i2) {
    return Math.floor(i1 / this.size) == Math.floor(i2 / this.size);
}

isOnSameRowHorizontally(i1, i2) {
}

findByIndex(index) {
    for (let i = 0; i < this.gameState.length; i++) {
        if (this.gameState[i].getIndex() == index) return this.gameState[i];
    }
    return null;
}

setDisplayWhosTurn(info) {
    info = "&nbsp;" + info + "&nbsp;";
    document.getElementById("turn-info").getElementsByTagName("span")[0].innerHTML = info;
}
}

export default Game;