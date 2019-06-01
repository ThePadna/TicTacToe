import React, { Component } from 'react';
import './App.css';
import Game from './Game';

class App extends Component {

  constructor(props) {
    super(props);
    this.gameInstance = null;
    this.state = { inProgress: false }
    this.hideToggle = this.hideToggle.bind(this);
    this.gridSize = 3;
    this.AI = false;
  }

  render() {
    if (this.state.inProgress) {
      let selectBoxGrid = document.getElementById("gridsize").getElementsByTagName("select")[0];
      let size = selectBoxGrid.options[selectBoxGrid.selectedIndex].value;
      let selectBoxAI = document.getElementById("ai").getElementsByTagName("select")[0];
      let ai = selectBoxAI.options[selectBoxAI.selectedIndex].value.startsWith("E") ? true : false;
      this.gridSize = parseInt(size.substr(0, 1));
      this.ai = ai;
      return (
        <div id="wrapper">
          <div id="header">
            <p>TicTacToe</p>
          </div>
          <div id="canvas-wrapper">
            <canvas id="gamecanvas" height="500px" width="500px"></canvas>
          </div>
          <p id="turn-info"> It's<span>&nbsp;your&nbsp;</span>turn </p>
        </div>
      );
    } else {
      return (
        <div id="wrapper">
          <div id="header">
            <p>TicTacToe</p>
          </div>
          <div id="options" style={{ width: '800px', margin: '0 auto' }}>
            <div id="gridsize">
              <h1>Grid Size</h1>
              <select>
                <option>3x3</option>
                <option>6x6</option>
                <option>9x9</option>
              </select>
            </div>
            <div id="ai">
              <h1>AI</h1>
              <select>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <button id="startbtn" onClick={this.hideToggle}>Start</button>
          </div>
        </div>
      );
    }
  }

  componentDidUpdate() {
    if(this.state.inProgress) {
      this.gameInstance = new Game(this.AI, this.gridSize);
      this.gameInstance.draw();
    }
  }

  hideToggle() {
    this.setState({ inProgress: true });
  }

  getGameInstance() {
    return this.gameInstance;
  }

}

export default App;
