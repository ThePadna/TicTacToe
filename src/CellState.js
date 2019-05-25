import React, { Component } from 'react';

class CellState extends React.Component {

    constructor(sel) {
        super();
        this.selection = sel;
        this.state = {value:null}
    }

    getSelection() {
        return this.selection;
    }

    getValue() {
        return this.state.value;
    }

    setValue(val) {
        let err = "You can only set a CellState's value with either x, o, or null.";
        if(!val.includes("x") && !val.includes("o")) {
            console.log(err);
            this.setState({value:null})
        } else if(val.length > 1) {
            console.log(err);
            this.setState({value:null});
        } else {
            this.setState({value:val});
        }
    }

    render() {
        let value = this.state.value;
        if(value == null) {
            console.log("render")
        } else if(value.localeCompare("o") == 0) {
            console.log("render")
        } else if(value.localeCompare("x") == 0) {
            console.log("render")
        }
        return "null;"
    }
}

export default CellState;