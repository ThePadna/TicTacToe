import CellState from './wrappers/CellState'
import CanvasCoordinates from './wrappers/CanvasCoordinates'
import CanvasCoordinatesSelection from './wrappers/CanvasCoordinatesSelection'
import DrawCircleAnim from './tasks/DrawCircleAnim'
import DrawCrossAnim from './tasks/DrawCrossAnim'

class Game {

    constructor(gridSize, difficulty) {
        this.missPlay = 10;
        switch (difficulty) {
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
        this.edgeCells = [];
        let num = 0;
        for(let i = 0; i < this.size; i++) {
            this.edgeCells.push(num);
            num++;
        }
        num = this.size-1;
        for(let i = 0; i < this.size; i++) {
            this.edgeCells.push(num);
            num += this.size;
        }
        num = 0;
        for(let i = 0; i < this.size; i++) {
            this.edgeCells.push(num);
            num++;
        }
        num = (this.size*this.size) - this.size;
        for(let i = 0; i < this.size; i++) {
            this.edgeCells.push(num);
            num++;
        }
        console.log("All edge cells: ");
        for(let i = 0; i < this.edgeCells.length; i++) {
            console.log(this.edgeCells[i]);
        }
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
                if (cs.getOwner() != null) return;
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
            if (this.size > 3) {
                for (let i = 0; i < playerClaims.length; i++) {
                    //block
                    let index = playerClaims[i].getIndex();
                    let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
                    if (this.size > 3) {
                        if (this.isInBounds(top) && this.isOnSameRow(index, top) && this.isInBounds(bottom) && this.isOnSameRow(index, bottom)) {
                            let topFarthest = top - 1, bottomFarthest = bottom + 1;
                            if (this.isInBounds(topFarthest) && this.isOnSameRow(index, topFarthest) && this.isInBounds(bottomFarthest) && this.isOnSameRow(bottomFarthest, index)) {
                                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom), topFarthestCS = this.findByIndex(topFarthest), bottomFarthestCS = this.findByIndex(bottomFarthest);
                                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomFarthestCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(topFarthestCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (bottomCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topCS.getOwner() == null) {
                                    this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (topCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && bottomCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topCS.getOwner() == null) {
                                    this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (topCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomFarthestCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0) {
                                    let topReached = false, bottomReached = false;
                                    let count = 0;
                                    while (!topReached) {
                                        count++;
                                        let space = topFarthest - count;
                                        if (!this.isInBounds(space) || !this.isOnSameRow(index, space)) {
                                            topReached = true;
                                        }
                                    }
                                    let count1 = 0;
                                    while (!bottomReached) {
                                        count1++;
                                        let space = bottomFarthest + count1;
                                        if (!this.isInBounds(space) || !this.isOnSameRow(index, space)) {
                                            bottomReached = true;
                                        }
                                    }
                                    if (count > count1 && topFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(topFarthestCS, symbol, playerClaims, aiClaims);
                                        return;
                                    } else if (count1 > count && bottomFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(bottomFarthestCS, symbol, playerClaims, aiClaims);
                                        return;
                                    } else {
                                        let cs = null;
                                        if (topFarthestCS.getOwner() != null) {
                                            cs = bottomFarthestCS;
                                        } else if (bottomFarthestCS.getOwner() != null) {
                                            cs = topFarthestCS;
                                        } else {
                                            cs = (Math.random() * 2) < 1 ? topFarthestCS : bottomFarthestCS;
                                        }
                                        if(cs.getOwner() == null) {
                                        this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                        return;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(left) && this.isInBounds(right)) {
                            let leftFarthest = left - this.size, rightFarthest = right + this.size;
                            if (this.isInBounds(leftFarthest) && this.isInBounds(rightFarthest)) {
                                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right), leftFarthestCS = this.findByIndex(leftFarthest), rightFarthestCS = this.findByIndex(rightFarthest);
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && rightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(rightFarthestCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(leftFarthestCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (rightCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && leftCS.getOwner() == null) {
                                    this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && rightCS.getOwner() == null) {
                                    this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && rightCS.getOwner() == null) {
                                    this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (rightCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && leftCS.getOwner() == 0) {
                                    this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0) {
                                    let leftReached = false, rightReached = false;
                                    let count = 0;
                                    while (!leftReached) {
                                        count+=this.size;
                                        let space = leftFarthest - count;
                                        if (!this.isInBounds(space) || this.findByIndex(space).getOwner() == 0) {
                                            leftReached = true;
                                        }
                                    }
                                    let count1 = 0;
                                    while (!rightReached) {
                                        count1+=this.size;
                                        let space = rightFarthest + count1;
                                        if (!this.isInBounds(space) || this.findByIndex(space).getOwner() == 0) {
                                            rightReached = true;
                                        }
                                    }
                                    if (count > count1 && leftFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(leftFarthestCS, symbol, playerClaims, aiClaims);
                                        return;
                                    } else if (count1 > count && rightFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(rightFarthestCS, symbol, playerClaims, aiClaims);
                                        return;
                                    } else {
                                        let cs = null;
                                        if (leftFarthestCS.getOwner() != null) {
                                            cs = leftFarthestCS;
                                        } else if (rightFarthestCS.getOwner() != null) {
                                            cs = rightFarthestCS;
                                        } else {
                                            cs = (Math.random() * 2) < 1 ? leftFarthestCS : rightFarthestCS;
                                        }
                                        if(cs.getOwner() == null) {
                                        this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                        return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let scoresOblique = [], scoresVertical = [], scoresHorizontal = [];
            for (let i = 0; i < aiClaims.length; i++) {
                //hunt
                let index = aiClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size), topLeft = (top - this.size), topRight = (top + this.size), bottomLeft = (bottom - this.size), bottomRight = (bottom + this.size);
                if (this.size > 3) {
                    if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom)) {
                        let topFarthest = top - 1, bottomFarthest = bottom + 1;
                        if (this.isInBounds(topFarthest) && this.isInBounds(bottomFarthest)) {
                            let topFarthestCS = this.findByIndex(topFarthest), bottomFarthestCS = this.findByIndex(bottomFarthest), topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                            let score = 0;
                            if(topFarthestCS.getOwner() != null) score += topFarthestCS.getOwner();
                            if(bottomFarthestCS.getOwner() != null) score += bottomFarthestCS.getOwner();
                            if(topCS.getOwner() != null) score += topFarthestCS.getOwner();
                            if(bottomCS.getOwner() != null) score += topFarthestCS.getOwner();
                            if (topFarthestCS.getOwner() == 1 && topCS.getOwner() == 1) {
                                if(bottomCS.getOwner() == 1) {
                                    if(bottomFarthestCS.getOwner() == null) {
                                        scoresOblique.push([score, bottomFarthestCS]);
                                        continue;
                                    }
                                } else if(bottomFarthestCS.getOwner() == 1) {
                                    if(bottomCS.getOwner() == null) {
                                        scoresOblique.push([score, bottomCS]);
                                        continue;
                                    }
                                } else {
                                    let cs = Math.random() * 2 < 1 ? bottomCS : bottomFarthestCS;
                                    scoresOblique.push([score, cs]);
                                    continue;
                                }
                            }
                            if(bottomCS.getOwner() == 1 && bottomFarthestCS.getOwner() == 1) {
                                if(topCS.getOwner() == 1) {
                                    if(topFarthestCS.getOwner() == null) {
                                        scoresOblique.push([score, topFarthestCS]);
                                        continue;
                                    }
                                } else if(topFarthestCS.getOwner() == 1) {
                                    if(topCS.getOwner() == null) {
                                        scoresOblique.push([score, topCS]);
                                        continue;
                                    }
                                } else {
                                    let cs = Math.random() * 2 < 1 ? topCS : topFarthestCS;
                                    scoresOblique.push([score, cs]);
                                    continue;
                                }
                            }
                            if(bottomCS.getOwner() == 1 && topCS.getOwner() == 1) {
                                if(topFarthestCS.getOwner() == 1) {
                                    if(bottomFarthestCS.getOwner() == null) {
                                        scoresOblique.push([score, bottomFarthestCS]);
                                        continue;
                                    }
                                } else if(bottomFarthestCS.getOwner() == 1) {
                                    if(topFarthestCS.getOwner() == null) {
                                        scoresOblique.push([score, topFarthestCS]);
                                        continue;
                                    }
                                } else {
                                    let cs = Math.random() * 2 < 1 ? bottomFarthestCS : topFarthestCS;
                                    scoresOblique.push([score, cs]);
                                    continue;
                                }
                            }
                            if(topFarthestCS.getOwner() == 1 && bottomFarthestCS.getOwner() == 1) {
                                if(topCS.getOwner() == 1) {
                                    if(bottomCS.getOwner() == null) {
                                        scoresOblique.push([score, bottomCS]);
                                        continue;
                                    }
                                } else if(bottomCS.getOwner() == 1) {
                                    if(topCS.getOwner() == null) {
                                        scoresOblique.push([score, topCS]);
                                        continue;
                                    }
                                } else {
                                    let cs = Math.random() * 2 < 1 ? topCS : bottomCS;
                                    scoresOblique.push([score, cs]);
                                    continue;
                                }
                            }
                        }
                    }
                }
                let currentHighest = null;
                for(let i = 0; i < scoresOblique.length; i++) {
                    let score = scoresOblique[i][0];
                    if(currentHighest != null) {
                        if(score > currentHighest[0]) currentHighest = scoresOblique[i];
                    } else currentHighest = scoresOblique[i];
                }
                if(currentHighest != null) {
                    this.claimEndAITurn(currentHighest[1], symbol, playerClaims, aiClaims);
                    return;
                }
                if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom)) {
                    let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                    if (topCS.getOwner() == 1 && bottomCS.getOwner() == null) {
                        this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                    if (bottomCS.getOwner() == 1 && topCS.getOwner() == null) {
                        this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                if (this.isInBounds(right) && this.isInBounds(left)) {
                    let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                    if (leftCS.getOwner() == 1 && rightCS.getOwner() == null) {
                        this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                    if (rightCS.getOwner() == 1 && leftCS.getOwner() == null) {
                        this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                if (this.isInBounds(topLeft) && this.isInBounds(bottomRight)) {
                    let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                    if (topLeftCS.getOwner() == 1 && bottomRightCS.getOwner() == null) {
                        this.claimEndAITurn(bottomRightCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                    if (bottomRightCS.getOwner() == 1 && topLeftCS.getOwner() == null) {
                        this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                if (this.isInBounds(topRight) && this.isInBounds(bottomLeft)) {
                    let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                    if (topRightCS.getOwner() == 1 && bottomLeftCS.getOwner() == null) {
                        this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                    if (bottomLeftCS.getOwner() == 1 && topRightCS.getOwner() == null) {
                        this.claimEndAITurn(topRightCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
            }
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
                let topLeft = top - this.size;
                let bottomRight = bottom + this.size;
                if (this.isInBounds(topLeft) && this.isInBounds(bottomRight)) {
                    let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                    if (topLeftCS.getOwner() == 0) {
                        if (bottomRightCS.getOwner() == null) {
                            this.claimEndAITurn(bottomRightCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    } else if (bottomRightCS.getOwner() == 0) {
                        if (topLeftCS.getOwner() == null) {
                            this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                }

                let topRight = top + this.size;
                let bottomLeft = bottom - this.size;
                if (this.isInBounds(topRight) && this.isInBounds(bottomLeft)) {
                    let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                    if (topRightCS.getOwner() == 0) {
                        if (bottomLeftCS.getOwner() == null) {
                            this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    } else if (bottomLeftCS.getOwner() == 0) {
                        if (topRightCS.getOwner() == null) {
                            this.claimEndAITurn(topRightCS, symbol, playerClaims, aiClaims);
                            return;
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
        console.log(Math.random() + "claimEndAITurn" + cs.getIndex());
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
            if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom)) {
                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0) {
                    if (this.size > 3) {
                        let farthestTop = (top - 1), farthestBottom = (bottom + 1);
                        if (this.isInBounds(farthestBottom) && this.isInBounds(farthestTop) && this.isOnSameRow(index, farthestTop) && this.isOnSameRow(index, farthestBottom)) {
                            let farthestBottomCS = this.findByIndex(farthestBottom), farthestTopCS = this.findByIndex(farthestTop);
                            if (farthestBottomCS.getOwner() == 0 && farthestTopCS.getOwner() == 0) {
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
                    if (this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if (this.isInBounds(farthestLeft) && this.isInBounds(farthestRight)) {
                            let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                            if (farthestLeftCS.getOwner() == 0 && farthestRightCS.getOwner() == 0) {
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
            let topRight = top + this.size;
            let bottomLeft = bottom - this.size;
            if (this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom) && this.isInBounds(topRight) && this.isInBounds(bottomLeft)) {
                let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                if (topRightCS.getOwner() == 0 && bottomLeftCS.getOwner() == 0) {
                    if (this.size > 3) {
                        let farthestTopRight = (topRight - 1) + this.size, farthestBottomLeft = (bottomLeft + 1) - this.size;
                        if (this.isInBounds(farthestTopRight) && this.isInBounds(farthestBottomLeft)) {
                            let farthestTopRightCS = this.findByIndex(farthestTopRight), farthestBottomLeftCS = this.findByIndex(farthestBottomLeft);
                            if (farthestTopRightCS.getOwner() == 0 && farthestBottomLeftCS.getOwner() == 0) {
                                this.setDisplayWhosTurn("WIN 6 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 6")
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
                    if (this.size > 3) {
                        let farthestTop = (top - 1), farthestBottom = (bottom + 1);
                        if (this.isInBounds(farthestBottom) && this.isInBounds(farthestTop)) {
                            let farthestBottomCS = this.findByIndex(farthestBottom), farthestTopCS = this.findByIndex(farthestTop);
                            if (farthestBottomCS.getOwner() == 1 && farthestTopCS.getOwner() == 1) {
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
                    if (this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if (this.isInBounds(farthestLeft) && this.isInBounds(farthestRight)) {
                            let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                            if (farthestLeftCS.getOwner() == 1 && farthestRightCS.getOwner() == 1) {
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
            let topLeft = top - this.size;
            let bottomRight = bottom + this.size;
            if (this.isInBounds(topLeft) && this.isInBounds(bottomRight)) {
                let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                if (topLeftCS.getOwner() == 1 && bottomRightCS.getOwner() == 1) {
                    if (this.size > 3) {
                        let farthestTopLeft = (topLeft - 1) - this.size, farthestBottomRight = (bottomRight + 1) + this.size;
                        if (this.isInBounds(farthestTopLeft) && this.isInBounds(farthestBottomRight)) {
                            let farthestTopLeftCS = this.findByIndex(farthestTopLeft), farthestBottomRightCS = this.findByIndex(farthestBottomRight);
                            if (farthestTopLeftCS.getOwner() == 1 && farthestBottomRightCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 5 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 5")
                        return true;
                    }
                }
            }
            let topRight = top + this.size;
            let bottomLeft = bottom - this.size;
            if (this.isInBounds(bottomLeft) && this.isInBounds(topRight)) {
                let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                if (topRightCS.getOwner() == 1 && bottomLeftCS.getOwner() == 1) {
                    if (this.size > 3) {
                        let farthestTopRight = (topRight - 1) + this.size, farthestBottomLeft = (bottomLeft + 1) - this.size;
                        if (this.isInBounds(farthestTopRight) && this.isInBounds(farthestBottomLeft)) {
                            let farthestTopRightCS = this.findByIndex(farthestTopRight), farthestBottomLeftCS = this.findByIndex(farthestBottomLeft);
                            console.log("coords: " + farthestTopRight + " " + topRight + " " + index + " " + bottomLeft + " " + farthestBottomLeft);
                            if (farthestTopRightCS.getOwner() == 1 && farthestBottomLeftCS.getOwner() == 1) {
                                this.setDisplayWhosTurn("WIN 7 size>3");
                                return true;
                            }
                        }
                    } else {
                        this.setDisplayWhosTurn("WIN 7")
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

    isOnSameRowHorizontally(i1, i2) {
        let num = 0;
        let foundEnd = false;
        while (!foundEnd) {
            num += this.size;
            let i1NextRow = i1 + num;
            if (!this.isInBounds(i1NextRow)) foundEnd = true;
            if (i1NextRow == i2) return true;
        }
        foundEnd = false;
        num = 0;
        while (!foundEnd) {
            num -= this.size;
            let i1PrevRow = i1 - num;
            if (!this.isInBounds(i1PrevRow)) foundEnd = true;
            if (i1PrevRow == i2) return true;
        }
        return false;
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