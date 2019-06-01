import React, { Component } from 'react';

class CellState {

    constructor(sel) {
        this.selection = sel;
        this.value = null;
        this.owner = null;
    }

    getSelection() {
        return this.selection;
    }

    getValue() {
        return this.value;
    }

    setValue(val) {
        let err = "You can only set a CellState's value with either x, o, or null.";
        if(!val.includes("x") && !val.includes("o")) {
            console.log(err);
            this.value = null;
        } else if(val.length > 1) {
            console.log(err);
            this.value = null;
        } else {
            this.value = val;
        }
    }

    setOwner(owner) {
        let err = "You can only set a CellState's owner with either 0 or 1 (Player number).";
        if(owner != 0 && owner != 1) {
            console.log(err);
            return;
        }
        this.owner = owner;
    }

    getOwner() {
        return this.owner;
    }
}

export default CellState;