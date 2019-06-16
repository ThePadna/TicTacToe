import CellState from './wrappers/CellState'
import CanvasCoordinates from './wrappers/CanvasCoordinates'
import CanvasCoordinatesSelection from './wrappers/CanvasCoordinatesSelection'
import DrawCircleAnim from './tasks/DrawCircleAnim'
import DrawCrossAnim from './tasks/DrawCrossAnim'
import { throws } from 'assert';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

class Game {

    constructor(gridSize, difficulty) {
        this.missPlay = 10;
        switch(difficulty) {
            case "Easy":
                this.missPlay = 30;
            case "Medium":
                this.missPlay = 20;
            case "Hard":
                this.missPlay = 10;
            case "Impossible":
                this.missPlay = 0;
        }
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
        ctx.lineWidth = (40 / this.size);
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
                let cs = this.gameState[i];
                if(cs.getOwner() != null) return;
                cs.claim(this.turn, this.p1Symbol, jumpSize);
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
                if (!this.checkForWinCondition(playerClaims, aiClaims)) {
                    this.turn = 1;
                    this.setDisplayWhosTurn("AI's")
                    setTimeout(this.aiTakeTurn, 1500);
                }
            }
        }
    }

    // missPlay should be a value from 0-100 which acts as a percentage value of which the AI will missplay
    // A missplay will go strictly for win condition and not try to play defense
    aiTakeTurn() {
        let symbol = this.p1Symbol === "x" ? "o" : "x";
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
        if (!found && this.size == 3) {
            if (playerClaims.length > 0) {
                for (let i = 0; i < this.gameState.length; i++) {
                    if (this.gameState[i].getIndex() == (Math.floor((this.size * this.size) / 2))) {
                        if (this.gameState[i].getOwner() === null) {
                            this.claimEndAITurn(this.gameState[i], symbol, playerClaims, aiClaims);
                            return;
                        } else {
                            let num = Math.random() * 2 < 1 ? 0 : this.gameState.length - 1;
                            this.claimEndAITurn(this.gameState[num], symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < playerClaims.length; i++) {
                let index = playerClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
                if (this.isInBounds(top) && this.isOnSameRow(index, top)) {
                    if (this.isInBounds(bottom)) {
                        let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                        if (topCS.getOwner() == 0 && bottomCS.getOwner() == null) {
                            this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                            return;
                        } else if (bottomCS.getOwner() == 0 && topCS.getOwner() == null) {
                            this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                    let farthest = (top - 1);
                    if (this.isInBounds(farthest) && this.isOnSameRow(top, farthest)) {
                        let farthestCS = this.findByIndex(farthest), topCS = this.findByIndex(top);
                        if (topCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (topCS.getOwner() == null) {
                                this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        }
                    }
                }
                if (this.isInBounds(bottom) && this.isOnSameRow(index, bottom)) {
                    let farthest = (bottom + 1);
                    if (this.isInBounds(farthest) && this.isOnSameRow(bottom, farthest)) {
                        let farthestCS = this.findByIndex(farthest), bottomCS = this.findByIndex(bottom);
                        if (bottomCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (bottomCS.getOwner() == null) {
                                this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        }
                    }
                }
                if (this.isInBounds(right)) {
                    if (this.isInBounds(left)) {
                        let rightCS = this.findByIndex(right), leftCS = this.findByIndex(left);
                        if (rightCS.getOwner() == 0 && leftCS.getOwner() == null) {
                            this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                            return;
                        } else if (leftCS.getOwner() == 0 && rightCS.getOwner() == null) {
                            this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                    let farthest = (right + this.size);
                    if (this.isInBounds(farthest)) {
                        let farthestCS = this.findByIndex(farthest), rightCS = this.findByIndex(right);
                        if (rightCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (rightCS.getOwner() == null) {
                                this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        }
                    }
                }
                if (this.isInBounds(left)) {
                    let farthest = (left - this.size);
                    if (this.isInBounds(farthest)) {
                        let farthestCS = this.findByIndex(farthest), leftCS = this.findByIndex(left);
                        if (leftCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (leftCS.getOwner() == null) {
                                this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        }
                    }
                }
                if (this.isInBounds(top)) {
                    let topCS = this.findByIndex(top);
                    if (topCS.getOwner() == null) {
                        this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                 if (this.isInBounds(bottom)) {
                    let bottomCS = this.findByIndex(bottom);
                    if (bottomCS.getOwner() == null) {
                        this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                if (this.isInBounds(right)) {
                    let rightCS = this.findByIndex(right);
                    if (rightCS.getOwner() == null) {
                        this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                 if (this.isInBounds(left)) {
                    let leftCS = this.findByIndex(left);
                    if (leftCS.getOwner() == null) {
                        this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
            }
        }
    }
    claimEndAITurn(cs, symbol, playerClaims, aiClaims) {
        cs.claim(this.turn, symbol, this.jumpSize);
        if (!this.checkForWinCondition(playerClaims, aiClaims)) {
            this.turn = 0;
            this.setDisplayWhosTurn("your")
        }
    }

    checkForWinCondition(playerClaims, aiClaims) {
        let emptyCell = false;
        for (let i = 0; i < this.gameState.length; i++) {
            if (this.gameState[i].getOwner() == null) {
                emptyCell = true;
                break;
            }
        }
        if (!emptyCell) {
            this.setDisplayWhosTurn("TIE");
            return true;
        }
        for (let i = 0; i < playerClaims.length; i++) {
            let index = playerClaims[i].getIndex();
            let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
            if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(top, bottom)) {
                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0) {
                    if(this.size > 3) {
                        let farthestTop = (top - 1), farthestBottom = (bottom + 1);
                        if(this.isInBounds(farthestBottom) && this.isInBounds(farthestTop)) {
                            let farthestBottomCS = this.findByIndex(farthestBottom), farthestTopCS = this.findByIndex(farthestTop);
                            if(farthestBottomCS.getOwner() == 1 && farthestTopCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 1 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 1");
                        return true;
                    }
                }
            }
            if (this.isInBounds(left) && this.isInBounds(right)) {
                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0) {
                    if(this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if(this.isInBounds(farthestLeft) && this.isInBounds(farthestRight)) {
                            let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                            if(farthestLeftCS.getOwner() == 1 && farthestRightCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 2 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 2");
                        return true;
                    }
                }
            }
        }
        for (let i = 0; i < aiClaims.length; i++) {
            let index = aiClaims[i].getIndex();
            let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
            if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(top, bottom)) {
                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                if (topCS.getOwner() == 1 && bottomCS.getOwner() == 1) {
                    if(this.size > 3) {
                        let farthestTop = (top - 1), farthestBottom = (bottom + 1);
                        if(this.isInBounds(farthestBottom) && this.isInBounds(farthestTop)) {
                            let farthestBottomCS = this.findByIndex(farthestBottom), farthestTopCS = this.findByIndex(farthestTop);
                            if(farthestBottomCS.getOwner() == 1 && farthestTopCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 3 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 3");
                        return true;
                    }
                }
            }
            if (this.isInBounds(left) && this.isInBounds(right)) {
                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                if (leftCS.getOwner() == 1 && rightCS.getOwner() == 1) {
                    if(this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if(this.isInBounds(farthestLeft) && this.isInBounds(farthestRight)) {
                            let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                            if(farthestLeftCS.getOwner() == 1 && farthestRightCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 4 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 4");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isInBounds(index) {
        return index >= 0 && index < (this.size * this.size);
    }

    isOnSameRow(i1, i2) {
        return Math.floor(i1 / this.size) == Math.floor(i2 / this.size);
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