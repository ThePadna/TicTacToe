import React, { Component } from 'react';
import CanvasCoordinates from './CanvasCoordinates'
import CanvasCoordinatesSelection from './CanvasCoordinatesSelection'
import DrawCircleAnim from '../tasks/DrawCircleAnim'
import DrawCrossAnim from '../tasks/DrawCrossAnim'

class CellState {

    constructor(sel, num) {
        this.selection = sel;
        this.value = null;
        this.owner = null;
        this.num = num;
    }

    getSelection() {
        return this.selection;
    }

    getValue() {
        return this.value;
    }

    getIndex() {
        return this.num;
    }

    setValue(val) {
        let err = "You can only set a CellState's value with either x, o, or null.";
        if (!val.includes("x") && !val.includes("o")) {
            console.log(err);
            this.value = null;
        } else if (val.length > 1) {
            console.log(err);
            this.value = null;
        } else {
            this.value = val;
        }
    }

    setOwner(owner) {
        let err = "You can only set a CellState's owner with either 0 or 1 (Player number).";
        if (owner != 0 && owner != 1) {
            console.log(err);
            return;
        }
        this.owner = owner;
    }

    getOwner() {
        return this.owner;
    }

    claim(owner, symbol, jumpSize) {
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        let sel = this.getSelection();
        let coord1 = sel.getCoord1(), coord2 = sel.getCoord2();
        let midX = ((coord1.getX() + coord2.getX()) / 2), midY = ((coord1.getY() + coord2.getY()) / 2);
        if (symbol === ("x")) {
            new DrawCrossAnim(ctx, new CanvasCoordinates(midX, midY), 1.5, (jumpSize / 3)).tick();
            this.setValue(symbol);
            this.setOwner(owner);
        } else if (symbol === ("o")) {
            new DrawCircleAnim(ctx, new CanvasCoordinates(midX, midY), (jumpSize / 3), 0, Math.PI * 2, (Math.PI * 2) / 50).tick();
            this.setValue(symbol);
            this.setOwner(owner);
        }
    }
}

export default CellState;