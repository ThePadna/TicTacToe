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
        for (let i = 0; i < this.size; i++) {
            console.log("loop #1 pushing " + num);
            this.edgeCells.push(num);
            num++;
        }
        num = this.size - 1;
        for (let i = 0; i < this.size; i++) {
            console.log("loop #2 pushing " + num);
            this.edgeCells.push(num);
            num += this.size;
        }
        num = 0;
        for (let i = 0; i < this.size; i++) {
            console.log("loop #3 pushing " + num);
            this.edgeCells.push(num);
            num += this.size;
        }
        num = (this.size * this.size) - this.size;
        for (let i = 0; i < this.size; i++) {
            console.log("loop #4 pushing " + num);
            this.edgeCells.push(num);
            num++;
        }
        console.log("edge cells");
        for (let i = 0; i < this.edgeCells.length; i++) {
            console.log(i);
        }
    }

    draw() {
        this.setDisplayWhosTurn("your");
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
                let scores = [];
                for (let i = 0; i < aiClaims.length; i++) {
                    let index = aiClaims[i].getIndex();
                    let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size), topLeft = (top - this.size), topRight = (top + this.size), bottomLeft = (bottom - this.size), bottomRight = (bottom + this.size);
                    if (this.size > 3) {
                        if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom)) {
                            let topFarthest = top - 1, bottomFarthest = bottom + 1;
                            if (this.isInBounds(topFarthest) && this.isInBounds(bottomFarthest)) {
                                let topFarthestCS = this.findByIndex(topFarthest), bottomFarthestCS = this.findByIndex(bottomFarthest), topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                                let score = 0;
                                if (topFarthestCS.getOwner() != null) score += topFarthestCS.getOwner();
                                if (bottomFarthestCS.getOwner() != null) score += bottomFarthestCS.getOwner();
                                if (topCS.getOwner() != null) score += topCS.getOwner();
                                if (bottomCS.getOwner() != null) score += bottomCS.getOwner();
                                console.log("Vert score " + score);
                                if (topFarthestCS.getOwner() == 1 && topCS.getOwner() == 1) {
                                    if (bottomCS.getOwner() == 1) {
                                        if (bottomFarthestCS.getOwner() == null) {
                                            scores.push([score, bottomFarthestCS]);
                                            continue;
                                        }
                                    } else if (bottomFarthestCS.getOwner() == 1) {
                                        if (bottomCS.getOwner() == null) {
                                            scores.push([score, bottomCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? bottomCS : bottomFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (bottomCS.getOwner() == 1 && bottomFarthestCS.getOwner() == 1) {
                                    if (topCS.getOwner() == 1) {
                                        if (topFarthestCS.getOwner() == null) {
                                            scores.push([score, topFarthestCS]);
                                            continue;
                                        }
                                    } else if (topFarthestCS.getOwner() == 1) {
                                        if (topCS.getOwner() == null) {
                                            scores.push([score, topCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? topCS : topFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (bottomCS.getOwner() == 1 && topCS.getOwner() == 1) {
                                    if (topFarthestCS.getOwner() == 1) {
                                        if (bottomFarthestCS.getOwner() == null) {
                                            scores.push([score, bottomFarthestCS]);
                                            continue;
                                        }
                                    } else if (bottomFarthestCS.getOwner() == 1) {
                                        if (topFarthestCS.getOwner() == null) {
                                            scores.push([score, topFarthestCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? bottomFarthestCS : topFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (topFarthestCS.getOwner() == 1 && bottomFarthestCS.getOwner() == 1) {
                                    if (topCS.getOwner() == 1) {
                                        if (bottomCS.getOwner() == null) {
                                            scores.push([score, bottomCS]);
                                            continue;
                                        }
                                    } else if (bottomCS.getOwner() == 1) {
                                        if (topCS.getOwner() == null) {
                                            scores.push([score, topCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? topCS : bottomCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(topLeft) && this.isInBounds(bottomRight) && !this.isHittingEdge(index)) {
                            let topLeftFarthest = (topLeft - 1) - this.size, bottomRightFarthest = (bottom + 1) + this.size;
                            if (this.isInBounds(topLeftFarthest) && this.isInBounds(bottomRightFarthest) && !this.isHittingEdge(topLeft) && !this.isHittingEdge(topRight)) {
                                let topLeftFarthestCS = this.findByIndex(topLeftFarthest), bottomRightFarthestCS = this.findByIndex(bottomRightFarthest), topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                                let score = 0;
                                if (topLeftFarthestCS.getOwner() != null) score += topLeftFarthestCS.getOwner();
                                if (bottomRightFarthestCS.getOwner() != null) score += bottomRightFarthestCS.getOwner();
                                if (topLeftCS.getOwner() != null) score += topLeftCS.getOwner();
                                if (bottomRightCS.getOwner() != null) score += bottomRightCS.getOwner();
                                console.log("Oblique 0 score " + score);
                                if (topLeftFarthestCS.getOwner() == 1 && topLeftCS.getOwner() == 1) {
                                    if (bottomRightCS.getOwner() == 1) {
                                        if (bottomRightFarthestCS.getOwner() == null) {
                                            scores.push([score, bottomRightFarthestCS]);
                                            continue;
                                        }
                                    } else if (bottomRightFarthestCS.getOwner() == 1) {
                                        if (bottomRightCS.getOwner() == null) {
                                            scores.push([score, bottomRightCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? bottomRightCS : bottomRightFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (bottomRightCS.getOwner() == 1 && bottomRightFarthestCS.getOwner() == 1) {
                                    if (topLeftCS.getOwner() == 1) {
                                        if (topLeftFarthestCS.getOwner() == null) {
                                            scores.push([score, topLeftFarthestCS]);
                                            continue;
                                        }
                                    } else if (topLeftFarthestCS.getOwner() == 1) {
                                        if (topLeftCS.getOwner() == null) {
                                            scores.push([score, topLeftCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? topLeftCS : topLeftFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (bottomRightCS.getOwner() == 1 && topLeftCS.getOwner() == 1) {
                                    if (topLeftFarthestCS.getOwner() == 1) {
                                        if (bottomRightFarthestCS.getOwner() == null) {
                                            scores.push([score, bottomRightFarthestCS]);
                                            continue;
                                        }
                                    } else if (bottomRightFarthestCS.getOwner() == 1) {
                                        if (topLeftFarthestCS.getOwner() == null) {
                                            scores.push([score, topLeftFarthestCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? bottomRightFarthestCS : topLeftFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (topLeftFarthestCS.getOwner() == 1 && bottomRightFarthestCS.getOwner() == 1) {
                                    if (topLeftCS.getOwner() == 1) {
                                        if (bottomRightCS.getOwner() == null) {
                                            scores.push([score, bottomRightCS]);
                                            continue;
                                        }
                                    } else if (bottomRightCS.getOwner() == 1) {
                                        if (topLeftCS.getOwner() == null) {
                                            scores.push([score, topLeftCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? topLeftCS : bottomRightCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(left) && this.isInBounds(right) && !this.isHittingEdge(index)) {
                            let leftFarthest = left - this.size, rightFarthest = right + this.size;
                            if (this.isInBounds(leftFarthest) && this.isInBounds(rightFarthest) && !this.isHittingEdge(left) && !this.isHittingEdge(right)) {
                                let leftFarthestCS = this.findByIndex(leftFarthest), rightFarthestCS = this.findByIndex(rightFarthest), leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                                let score = 0;
                                if (leftFarthestCS.getOwner() != null) score += leftFarthestCS.getOwner();
                                if (rightFarthestCS.getOwner() != null) score += rightFarthestCS.getOwner();
                                if (leftCS.getOwner() != null) score += leftCS.getOwner();
                                if (rightCS.getOwner() != null) score += rightCS.getOwner();
                                console.log("hori score " + score);
                                if (leftFarthestCS.getOwner() == 1 && leftCS.getOwner() == 1) {
                                    if (rightCS.getOwner() == 1) {
                                        if (rightFarthestCS.getOwner() == null) {
                                            scores.push([score, rightFarthestCS]);
                                            continue;
                                        }
                                    } else if (rightFarthestCS.getOwner() == 1) {
                                        if (rightCS.getOwner() == null) {
                                            scores.push([score, rightCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? rightCS : rightFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (rightCS.getOwner() == 1 && rightFarthestCS.getOwner() == 1) {
                                    if (leftCS.getOwner() == 1) {
                                        if (leftFarthestCS.getOwner() == null) {
                                            scores.push([score, leftFarthestCS]);
                                            continue;
                                        }
                                    } else if (leftFarthestCS.getOwner() == 1) {
                                        if (leftCS.getOwner() == null) {
                                            scores.push([score, leftCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? leftCS : leftFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (rightCS.getOwner() == 1 && leftCS.getOwner() == 1) {
                                    if (leftFarthestCS.getOwner() == 1) {
                                        if (rightFarthestCS.getOwner() == null) {
                                            scores.push([score, rightFarthestCS]);
                                            continue;
                                        }
                                    } else if (rightFarthestCS.getOwner() == 1) {
                                        if (leftFarthestCS.getOwner() == null) {
                                            scores.push([score, leftFarthestCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? rightFarthestCS : leftFarthestCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                                if (leftFarthestCS.getOwner() == 1 && rightFarthestCS.getOwner() == 1) {
                                    if (leftCS.getOwner() == 1) {
                                        if (rightCS.getOwner() == null) {
                                            scores.push([score, rightCS]);
                                            continue;
                                        }
                                    } else if (rightCS.getOwner() == 1) {
                                        if (leftCS.getOwner() == null) {
                                            scores.push([score, leftCS]);
                                            continue;
                                        }
                                    } else {
                                        let cs = Math.random() * 2 < 1 ? leftCS : rightCS;
                                        if (cs.getOwner() == null) {
                                            scores.push([score, cs]);
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                let currentHighest = null;
                for (let i = 0; i < scores.length; i++) {
                    let score = scores[i][0];
                    if (currentHighest != null) {
                        if (score > currentHighest[0]) currentHighest = scores[i];
                    } else currentHighest = scores[i];
                }
                if (currentHighest != null && currentHighest[0] > 2) {
                    console.log("claiming with current highest.")
                    this.claimEndAITurn(currentHighest[1], symbol, playerClaims, aiClaims);
                    return;
                }
                for (let i = 0; i < playerClaims.length; i++) {
                    //block
                    let index = playerClaims[i].getIndex();
                    let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size), topLeft = top - this.size, topRight = top + this.size, bottomLeft = bottom - this.size, bottomRight = bottom + this.size;
                    if (this.size > 3) {
                        if (this.isInBounds(top) && this.isOnSameRow(index, top) && this.isInBounds(bottom) && this.isOnSameRow(index, bottom)) {
                            let topFarthest = top - 1, bottomFarthest = bottom + 1;
                            if (this.isInBounds(topFarthest) && this.isOnSameRow(index, topFarthest) && this.isInBounds(bottomFarthest) && this.isOnSameRow(bottomFarthest, index)) {
                                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom), topFarthestCS = this.findByIndex(topFarthest), bottomFarthestCS = this.findByIndex(bottomFarthest);
                                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG1")
                                    return;
                                }
                                if (topCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(topFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG2")
                                    return;
                                }
                                if (topFarthestCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topCS.getOwner() == null) {
                                    this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG3")
                                    return;
                                }
                                if (topCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && bottomCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG4")
                                    return;
                                }
                                if (bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == 0 && topCS.getOwner() == null) {
                                    this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG5")
                                    return;
                                }
                                if (topCS.getOwner() == 0 && topFarthestCS.getOwner() == 0 && bottomCS.getOwner() == 0 && bottomFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG5")
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
                                        console.log("DEBUG6")
                                        this.claimEndAITurn(topFarthestCS, symbol, playerClaims, aiClaims);
                                        return;
                                    } else if (count1 > count && bottomFarthestCS.getOwner() == null) {
                                        console.log("DEBUG7")
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
                                        if (cs.getOwner() == null) {
                                            this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                            console.log("DEBUG8")
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(left) && this.isInBounds(right) && !this.isHittingEdge(index) && !this.isHittingEdge(left) && !this.isHittingEdge(right)) {
                            let leftFarthest = left - this.size, rightFarthest = right + this.size;
                            if (this.isInBounds(leftFarthest) && this.isInBounds(rightFarthest)) {
                                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right), leftFarthestCS = this.findByIndex(leftFarthest), rightFarthestCS = this.findByIndex(rightFarthest);
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && rightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(rightFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG9")
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(leftFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG10")
                                    return;
                                }
                                if (rightCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && leftCS.getOwner() == null) {
                                    this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG11")
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && rightCS.getOwner() == null) {
                                    this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG12")
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightFarthestCS.getOwner() == 0 && rightCS.getOwner() == null) {
                                    this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG13")
                                    return;
                                }
                                if (rightCS.getOwner() == 0 && leftFarthestCS.getOwner() == 0 && leftCS.getOwner() == null) {
                                    this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG14")
                                    return;
                                }
                                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0) {
                                    let leftReached = false, rightReached = false;
                                    let count = 0;
                                    while (!leftReached) {
                                        count += this.size;
                                        let space = leftFarthest - count;
                                        if (!this.isInBounds(space) || this.findByIndex(space).getOwner() == 0) {
                                            leftReached = true;
                                        }
                                    }
                                    let count1 = 0;
                                    while (!rightReached) {
                                        count1 += this.size;
                                        let space = rightFarthest + count1;
                                        if (!this.isInBounds(space) || this.findByIndex(space).getOwner() == 0) {
                                            rightReached = true;
                                        }
                                    }
                                    if (count > count1 && leftFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(leftFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG15")
                                        return;
                                    } else if (count1 > count && rightFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(rightFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG16")
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
                                        if (cs.getOwner() == null) {
                                            this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                            console.log("DEBUG17")
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(topLeft) && !this.isHittingEdge(topLeft) && this.isInBounds(bottomRight) && !this.isHittingEdge(bottomRight)) {
                            console.log("oblique line SPOTTED");
                            let topLeftFarthest = (topLeft - 1) - this.size, bottomRightFarthest = (bottomRight + 1) + this.size;
                            if (this.isInBounds(topLeftFarthest) && this.isInBounds(bottomRightFarthest)) {
                                let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight), topLeftFarthestCS = this.findByIndex(topLeftFarthest), bottomRightFarthestCS = this.findByIndex(bottomRightFarthest);
                                if (topLeftCS.getOwner() == 0 && bottomRightCS.getOwner() == 0 && topLeftFarthestCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomRightFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG18")
                                    return;
                                }
                                if (topLeftCS.getOwner() == 0 && bottomRightCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == 0 && topLeftFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(topLeftFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG19")
                                    return;
                                }
                                if (bottomRightCS.getOwner() == 0 && topLeftFarthestCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == 0 && topLeftCS.getOwner() == null) {
                                    this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG20")
                                    return;
                                }
                                if (topLeftCS.getOwner() == 0 && topLeftFarthestCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == 0 && bottomRightCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomRightCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG21")
                                    return;
                                }
                                if (bottomRightCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == 0 && topLeftCS.getOwner() == null) {
                                    this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG22")
                                    return;
                                }
                                if (topLeftCS.getOwner() == 0 && topLeftFarthestCS.getOwner() == 0 && bottomRightCS.getOwner() == 0 && bottomRightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomRightFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG23")
                                    return;
                                }
                                if (topLeftCS.getOwner() == 0 && bottomRightCS.getOwner() == 0) {
                                    let topLeftReached = false, bottomRightReached = false;
                                    let count = 0;
                                    while (!topLeftReached) {
                                        count++;
                                        let space = (topLeftFarthest - count) - (count * this.size);
                                        if (!this.isInBounds(space)) {
                                            topLeftReached = true;
                                        }
                                    }
                                    let count1 = 0;
                                    while (!bottomRightReached) {
                                        count1++;
                                        let space = (bottomRightFarthest + count1) + (count * this.size);
                                        if (!this.isInBounds(space)) {
                                            bottomRightReached = true;
                                        }
                                    }
                                    if (count > count1 && topLeftFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(topLeftFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG24")
                                        return;
                                    } else if (count1 > count && bottomRightFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(bottomRightFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG25")
                                        return;
                                    } else {
                                        let cs = null;
                                        if (topLeftFarthestCS.getOwner() != null) {
                                            cs = bottomRightFarthestCS;
                                        } else if (bottomRightFarthestCS.getOwner() != null) {
                                            cs = topLeftFarthestCS;
                                        } else {
                                            cs = (Math.random() * 2) < 1 ? topLeftFarthestCS : bottomRightFarthestCS;
                                        }
                                        if (cs.getOwner() == null) {
                                            this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                            console.log("DEBUG26")
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        if (this.isInBounds(topRight) && !this.isHittingEdge(topRight) && this.isInBounds(bottomLeft) && !this.isHittingEdge(bottomLeft)) {
                            let topRightFarthest = (topRight + 1) + this.size, bottomLeftFarthest = (bottomRight - 1) - this.size;
                            if (this.isInBounds(topRightFarthest) && this.isInBounds(bottomLeftFarthest)) {
                                let bottomLeftCS = this.findByIndex(bottomLeft), topRightCS = this.findByIndex(topRight), topRightFarthestCS = this.findByIndex(topRightFarthest), bottomLeftFarthestCS = this.findByIndex(bottomLeftFarthest);
                                if (bottomLeftCS.getOwner() == 0 && topRightCS.getOwner() == 0 && bottomLeftFarthestCS.getOwner() == 0 && topRightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(topRightFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG27")
                                    return;
                                }
                                if (bottomLeftCS.getOwner() == 0 && topRightCS.getOwner() == 0 && topRightFarthestCS.getOwner() == 0 && bottomLeftFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomLeftFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG28")
                                    return;
                                }
                                if (topRightCS.getOwner() == 0 && bottomLeftFarthestCS.getOwner() == 0 && topRightFarthestCS.getOwner() == 0 && bottomLeftCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG29")
                                    return;
                                }
                                if (bottomLeftCS.getOwner() == 0 && bottomLeftFarthestCS.getOwner() == 0 && topRightFarthestCS.getOwner() == 0 && topRightCS.getOwner() == null) {
                                    this.claimEndAITurn(topRightCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG30")
                                    return;
                                }
                                if (topRightCS.getOwner() == 0 && topRightFarthestCS.getOwner() == 0 && bottomLeftCS.getOwner() == null) {
                                    this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG31")
                                    return;
                                }
                                if (bottomLeftCS.getOwner() == 0 && bottomLeftFarthestCS.getOwner() == 0 && topRightCS.getOwner() == 0 && topRightFarthestCS.getOwner() == null) {
                                    this.claimEndAITurn(topRightFarthestCS, symbol, playerClaims, aiClaims);
                                    console.log("DEBUG32")
                                    return;
                                }
                                if (bottomLeftCS.getOwner() == 0 && topRightCS.getOwner() == 0) {
                                    let bottomLeftReached = false, topRightReached = false;
                                    let count = 0;
                                    while (!bottomLeftReached) {
                                        count++;
                                        let space = (bottomLeftFarthest + count) - (count * this.size);
                                        if (!this.isInBounds(space)) {
                                            bottomLeftReached = true;
                                        }
                                    }
                                    let count1 = 0;
                                    while (!topRightReached) {
                                        count1++;
                                        let space = (topRightFarthest - count1) + (count * this.size);
                                        if (!this.isInBounds(space)) {
                                            topRightReached = true;
                                        }
                                    }
                                    if (count > count1 && bottomLeftFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(bottomLeftFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG33")
                                        return;
                                    } else if (count1 > count && topRightFarthestCS.getOwner() == null) {
                                        this.claimEndAITurn(topRightFarthestCS, symbol, playerClaims, aiClaims);
                                        console.log("DEBUG34")
                                        return;
                                    } else {
                                        let cs = null;
                                        if (bottomLeftFarthestCS.getOwner() != null) {
                                            cs = topRightFarthestCS;
                                        } else if (topRightFarthestCS.getOwner() != null) {
                                            cs = bottomLeftFarthestCS;
                                        } else {
                                            cs = (Math.random() * 2) < 1 ? bottomLeftFarthestCS : topRightFarthestCS;
                                        }
                                        if (cs.getOwner() == null) {
                                            this.claimEndAITurn(cs, symbol, playerClaims, aiClaims);
                                            console.log("DEBUG35")
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (currentHighest != null) {
                    this.claimEndAITurn(currentHighest[1], symbol, playerClaims, aiClaims);
                    console.log("DEBUG36")
                    return;
                }
            }
            for (let i = 0; i < aiClaims.length; i++) {
                let index = aiClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size), topLeft = (top - this.size), topRight = (top + this.size), bottomLeft = (bottom - this.size), bottomRight = (bottom + this.size);
                if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom)) {
                    let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                    if (topCS.getOwner() == 1 && bottomCS.getOwner() == null) {
                        this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST4");
                        return;
                    }
                    if (bottomCS.getOwner() == 1 && topCS.getOwner() == null) {
                        this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST3");
                        return;
                    }
                }
                if (this.isInBounds(right) && this.isInBounds(left)) {
                    let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                    if (leftCS.getOwner() == 1 && rightCS.getOwner() == null) {
                        console.log("okTEST1");
                        this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                    if (rightCS.getOwner() == 1 && leftCS.getOwner() == null) {
                        console.log("okTEST2");
                        this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                        return;
                    }
                }
                if (this.isInBounds(topLeft) && this.isInBounds(bottomRight) && !this.isHittingEdge(index)) {
                    let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                    if (topLeftCS.getOwner() == 1 && bottomRightCS.getOwner() == null) {
                        this.claimEndAITurn(bottomRightCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST5");
                        return;
                    }
                    if (bottomRightCS.getOwner() == 1 && topLeftCS.getOwner() == null) {
                        this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST6");
                        return;
                    }
                }
                if (this.isInBounds(topRight) && this.isInBounds(bottomLeft) && !this.isHittingEdge(index)) {
                    let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                    if (topRightCS.getOwner() == 1 && bottomLeftCS.getOwner() == null) {
                        this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST7");
                        return;
                    }
                    if (bottomLeftCS.getOwner() == 1 && topRightCS.getOwner() == null) {
                        this.claimEndAITurn(topRightCS, symbol, playerClaims, aiClaims);
                        console.log("okTEST8");
                        return;
                    }
                }
            }
            for (let i = 0; i < playerClaims.length; i++) {
                let index = playerClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
                if (this.isInBounds(top) && this.isOnSameRow(index, top)) {
                    if (this.isInBounds(bottom) && this.isOnSameRow(bottom, index)) {
                        let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                        if (topCS.getOwner() == 0 && bottomCS.getOwner() == null) {
                            this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                            console.log("okTEST1");
                            return;
                        } else if (bottomCS.getOwner() == 0 && topCS.getOwner() == null) {
                            this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                            console.log("okTEST2");
                            return;
                        }
                    }
                    let farthest = (top - 1);
                    if (this.isInBounds(farthest) && this.isOnSameRow(top, farthest)) {
                        let farthestCS = this.findByIndex(farthest), topCS = this.findByIndex(top);
                        if (topCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                console.log("okTEST3");
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (topCS.getOwner() == null) {
                                this.claimEndAITurn(topCS, symbol, playerClaims, aiClaims);
                                console.log("okTEST4");
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
                                console.log("okTEST5");
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (bottomCS.getOwner() == null) {
                                this.claimEndAITurn(bottomCS, symbol, playerClaims, aiClaims);
                                console.log("okTEST6");
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
                            console.log("okTEST7");
                            return;
                        } else if (leftCS.getOwner() == 0 && rightCS.getOwner() == null) {
                            this.claimEndAITurn(rightCS, symbol, playerClaims, aiClaims);
                            console.log("okTEST8");
                            return;
                        }
                    }
                    let farthest = (right + this.size);
                    if (this.isInBounds(farthest)) {
                        let farthestCS = this.findByIndex(farthest), rightCS = this.findByIndex(right);
                        if (rightCS.getOwner() == 0) {
                            if (farthestCS.getOwner() == null) {
                                console.log("okTEST9");
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (rightCS.getOwner() == null) {
                                console.log("okTEST10");
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
                                console.log("okTEST11");
                                this.claimEndAITurn(farthestCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        } else if (farthestCS.getOwner() == 0) {
                            if (leftCS.getOwner() == null) {
                                console.log("okTEST12");
                                this.claimEndAITurn(leftCS, symbol, playerClaims, aiClaims);
                                return;
                            }
                        }
                    }
                }
                let topLeft = top - this.size;
                let bottomRight = bottom + this.size;
                if (this.isInBounds(topLeft) && this.isInBounds(bottomRight) && !this.isHittingEdge(index)) {
                    let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                    if (topLeftCS.getOwner() == 0) {
                        if (bottomRightCS.getOwner() == null) {
                            console.log("okTEST13");
                            this.claimEndAITurn(bottomRightCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    } else if (bottomRightCS.getOwner() == 0) {
                        if (topLeftCS.getOwner() == null) {
                            console.log("okTEST14");
                            this.claimEndAITurn(topLeftCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                }

                let topRight = top + this.size;
                let bottomLeft = bottom - this.size;
                if (this.isInBounds(topRight) && this.isInBounds(bottomLeft) && !this.isHittingEdge(index)) {
                    let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                    if (topRightCS.getOwner() == 0) {
                        if (bottomLeftCS.getOwner() == null) {
                            console.log("okTEST15");
                            this.claimEndAITurn(bottomLeftCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    } else if (bottomLeftCS.getOwner() == 0) {
                        if (topRightCS.getOwner() == null) {
                            console.log("okTEST16");
                            this.claimEndAITurn(topRightCS, symbol, playerClaims, aiClaims);
                            return;
                        }
                    }
                }
            }
            for (let i = 0; i < playerClaims.length; i++) {
                let index = playerClaims[i].getIndex();
                let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
                if (this.isInBounds(top)) {
                    let topCS = this.findByIndex(top);
                    if (topCS.getOwner() == null) {
                        console.log("okTES1T");
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
            this.setDisplayWhosWon("TIE");
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
                                let csList = [topCS, bottomCS, farthestBottomCS, farthestTopCS, playerClaims[i]];
                                this.setDisplayWhosWon("you", csList)
                                console.log("WIN 1 size>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [topCS, bottomCS, playerClaims[i]];
                        this.setDisplayWhosWon("you", csList)
                        console.log("WIN 1")
                        return true;
                    }
                }
            }
            if (this.isInBounds(left) && this.isInBounds(right)) {
                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                if (leftCS.getOwner() == 0 && rightCS.getOwner() == 0 && !this.isHittingEdge(index)) {
                    if (this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if (this.isInBounds(farthestLeft) && this.isInBounds(farthestRight)) {
                            if (!(!this.isHittingEdge(index) && this.isHittingEdge(left) || this.isHittingEdge(right) || this.isHittingEdge(farthestLeft) || this.isHittingEdge(farthestRight))) {
                                let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                                if (farthestLeftCS.getOwner() == 0 && farthestRightCS.getOwner() == 0) {
                                    let csList = [farthestLeftCS, farthestRightCS, playerClaims[i]];
                                    this.setDisplayWhosWon("you", csList)
                                    console.log("WIN 2 size>3")
                                    return true;
                                }
                            }
                        }
                    } else {
                        let csList = [leftCS, rightCS, playerClaims[i]];
                        this.setDisplayWhosWon("you", csList)
                        console.log("WIN 2")
                        return true;
                    }
                }
            }
            let topRight = top + this.size;
            let bottomLeft = bottom - this.size;
            if (this.isOnSameRow(index, top) && this.isOnSameRow(index, bottom) && this.isInBounds(topRight) && this.isInBounds(bottomLeft)) {
                let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                if (!this.isHittingEdge(index) && topRightCS.getOwner() == 0 && bottomLeftCS.getOwner() == 0) {
                    if (this.size > 3) {
                        let farthestTopRight = (topRight - 1) + this.size, farthestBottomLeft = (bottomLeft + 1) - this.size;
                        if (this.isInBounds(farthestTopRight) && this.isInBounds(farthestBottomLeft) && !this.isHittingEdge(topRight) && !this.isHittingEdge(bottomLeft)) {
                            let farthestTopRightCS = this.findByIndex(farthestTopRight), farthestBottomLeftCS = this.findByIndex(farthestBottomLeft);
                            if (farthestTopRightCS.getOwner() == 0 && farthestBottomLeftCS.getOwner() == 0) {
                                let csList = [topRightCS, bottomLeftCS, playerClaims[i]];
                                this.setDisplayWhosWon("you", csList)
                                console.log("WIN 6 size>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [topRightCS, bottomLeftCS, playerClaims[i]];
                        this.setDisplayWhosWon("you", csList)
                        console.log("WIN 6")
                        return true;
                    }
                }
            }
            let topLeft = top - this.size;
            let bottomRight = bottom + this.size;
            if (this.isInBounds(topLeft) && this.isInBounds(bottomRight)) {
                let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                if (!this.isHittingEdge(index) && topLeftCS.getOwner() == 0 && bottomRightCS.getOwner() == 0) {
                    if (this.size > 3) {
                        let farthestTopLeft = (topLeft - 1) - this.size, farthestBottomRight = (bottomRight + 1) + this.size;
                        if (this.isInBounds(farthestTopLeft) && this.isInBounds(farthestBottomRight) && !this.isHittingEdge(bottomRight) && !this.isHittingEdge(topLeft)) {
                            let farthestTopLeftCS = this.findByIndex(farthestTopLeft), farthestBottomRightCS = this.findByIndex(farthestBottomRight);
                            if (farthestTopLeftCS.getOwner() == 0 && farthestBottomRightCS.getOwner() == 0) {
                                let csList = [topLeftCS, bottomRightCS, farthestBottomRightCS, farthestTopLeftCS, playerClaims[i]];
                                this.setDisplayWhosWon("you", csList)
                                console.log("WIN 8 size>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [topLeftCS, bottomRightCS, playerClaims[i]];
                        this.setDisplayWhosWon("you", csList)
                        console.log("WIN 8")
                        return true;
                    }
                }
            }
        }
        for (let i = 0; i < aiClaims.length; i++) {
            let index = aiClaims[i].getIndex();
            let top = (index - 1), bottom = (index + 1), right = (index + this.size), left = (index - this.size);
            if (this.isInBounds(top) && this.isInBounds(bottom) && this.isOnSameRow(index, bottom) && this.isOnSameRow(index, top)) {
                let topCS = this.findByIndex(top), bottomCS = this.findByIndex(bottom);
                if (topCS.getOwner() == 1 && bottomCS.getOwner() == 1) {
                    if (this.size > 3) {
                        let farthestTop = (top - 1), farthestBottom = (bottom + 1);
                        if (this.isInBounds(farthestBottom) && this.isInBounds(farthestTop) && this.isOnSameRow(index, farthestBottom) && this.isOnSameRow(index, farthestTop)) {
                            let farthestBottomCS = this.findByIndex(farthestBottom), farthestTopCS = this.findByIndex(farthestTop);
                            if (farthestBottomCS.getOwner() == 1 && farthestTopCS.getOwner() == 1) {
                                let csList = [topCS, bottomCS, farthestBottomCS, farthestTopCS, aiClaims[i]];
                                this.setDisplayWhosWon("AI", csList);
                                console.log("WIN 3 SIZE>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [topCS, bottomCS, aiClaims[i]];
                        this.setDisplayWhosWon("AI", csList);
                        console.log("WIN 3")
                        return true;
                    }
                }
            }
            if (this.isInBounds(left) && this.isInBounds(right)) {
                let leftCS = this.findByIndex(left), rightCS = this.findByIndex(right);
                if (leftCS.getOwner() == 1 && rightCS.getOwner() == 1) {
                    if (this.size > 3) {
                        let farthestLeft = (left - this.size), farthestRight = (right + this.size);
                        if (this.isInBounds(farthestLeft) && this.isInBounds(farthestRight) && !this.isHittingEdge(right) && !this.isHittingEdge(left) && !this.isHittingEdge(index)) {
                            let farthestLeftCS = this.findByIndex(farthestLeft), farthestRightCS = this.findByIndex(farthestRight);
                            if (farthestLeftCS.getOwner() == 1 && farthestRightCS.getOwner() == 1) {
                                let csList = [leftCS, rightCS, farthestLeftCS, farthestRightCS, aiClaims[i]];
                                this.setDisplayWhosWon("AI", csList);
                                console.log("WIN 4 SIZE>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [leftCS, rightCS, aiClaims[i]];
                        this.setDisplayWhosWon("AI", csList);
                        console.log("WIN 4")
                        return true;
                    }
                }
            }
            let topLeft = top - this.size;
            let bottomRight = bottom + this.size;
            if (this.isInBounds(topLeft) && this.isInBounds(bottomRight)) {
                let topLeftCS = this.findByIndex(topLeft), bottomRightCS = this.findByIndex(bottomRight);
                if (topLeftCS.getOwner() == 1 && bottomRightCS.getOwner() == 1 && !this.isHittingEdge(index)) {
                    if (this.size > 3) {
                        let farthestTopLeft = (topLeft - 1) - this.size, farthestBottomRight = (bottomRight + 1) + this.size;
                        if (this.isInBounds(farthestTopLeft) && this.isInBounds(farthestBottomRight) && !this.isHittingEdge(bottomRight) && !this.isHittingEdge(topLeft)) {
                            let farthestTopLeftCS = this.findByIndex(farthestTopLeft), farthestBottomRightCS = this.findByIndex(farthestBottomRight);
                            if (farthestTopLeftCS.getOwner() == 1 && farthestBottomRightCS.getOwner() == 1) {
                                let csList = [topLeftCS, bottomRightCS, farthestBottomRightCS, farthestTopLeftCS, aiClaims[i]];
                                this.setDisplayWhosWon("AI", csList);
                                console.log("WIN 5 SIZE>3")
                                return true;
                            }
                        }
                    } else {
                        let csList = [topLeftCS, bottomRightCS, aiClaims[i]];
                        this.setDisplayWhosWon("AI", csList)
                        console.log("WIN 5")
                        return true;
                    }
                }
            }
            let topRight = top + this.size;
            let bottomLeft = bottom - this.size;
            if (this.isInBounds(bottomLeft) && this.isInBounds(topRight) && !this.isHittingEdge(index)) {
                let topRightCS = this.findByIndex(topRight), bottomLeftCS = this.findByIndex(bottomLeft);
                if (topRightCS.getOwner() == 1 && bottomLeftCS.getOwner() == 1 && !this.isHittingEdge(index)) {
                    if (this.size > 3) {
                        let farthestTopRight = (topRight - 1) + this.size, farthestBottomLeft = (bottomLeft + 1) - this.size;
                        if (this.isInBounds(farthestTopRight) && this.isInBounds(farthestBottomLeft) && !this.isHittingEdge(topRight) && !this.isHittingEdge(bottomLeft)) {
                            let farthestTopRightCS = this.findByIndex(farthestTopRight), farthestBottomLeftCS = this.findByIndex(farthestBottomLeft);
                            if (farthestTopRightCS.getOwner() == 1 && farthestBottomLeftCS.getOwner() == 1) {
                                let csList = [topRightCS, bottomLeftCS, farthestBottomLeftCS, farthestTopRightCS, aiClaims[i]];
                                this.setDisplayWhosWon("AI", csList);
                                console.log("WIN 7 SIZE>3");
                                return true;
                            }
                        }
                    } else {
                        let csList = [topRightCS, bottomLeftCS, aiClaims[i]];
                        this.setDisplayWhosWon("AI", csList);
                        console.log("WIN 7");
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

    isHittingEdge(i1) {
        for (let i = 0; i < this.edgeCells.length; i++) {
            if (i1 == this.edgeCells[i]) return true;
        }
        return false;
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
        document.getElementById("turn-info").innerHTML = "<span>" + info + "</span>turn";
    }

    setDisplayWhosWon(winner, csList) {
        winner = "&nbsp;" + winner + "&nbsp;";
        let statement = "<span>" + winner + "</span>wins!";
        if (winner.indexOf("you") != -1) statement = "<span>" + winner + "</span> win!";
        if (csList == null) {
            document.getElementById("turn-info").innerHTML = statement.substr(0, statement.length - 5);
            return;
        }
        document.getElementById("turn-info").innerHTML = statement;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.lineWidth = (15 / this.size);
        ctx.strokeStyle = 'red';
        for (let i = 0; i < csList.length; i++) {
            let ccs = csList[i].getSelection();
            let coord1 = ccs.getCoord1(), coord2 = ccs.getCoord2();
            ctx.beginPath();
            ctx.moveTo(coord1.getX(), coord1.getY());
            ctx.lineTo(coord2.getX(), coord1.getY());
            ctx.lineTo(coord2.getX(), coord2.getY());
            ctx.lineTo(coord1.getX(), coord2.getY());
            ctx.lineTo(coord1.getX(), coord1.getY());
            ctx.stroke();
        }
        ctx.lineWidth = (40 / this.size);
        ctx.strokeStyle = 'black';
    }
}

export default Game;