import React, { Component } from 'react';
import './App.css';
import Game from './Game';
import { throws } from 'assert';

class App extends Component {

  constructor(props) {
    super(props);
    this.gameInstance = null;
    this.state = { inProgress: false }
    this.hideToggle = this.hideToggle.bind(this);
    this.difficulty = "Medium";
    this.gridSize = 3;
  }

  render() {
    if (this.state.inProgress) {
      let selectBoxGrid = document.getElementById("gridsize").getElementsByTagName("select")[0];
      let selectBoxDifficulty = document.getElementById("aidifficulty").getElementsByTagName("select")[0];
      this.difficulty = selectBoxDifficulty.options[selectBoxDifficulty.selectedIndex].value;
      let size = selectBoxGrid.options[selectBoxGrid.selectedIndex].value;
      this.gridSize = parseInt(size.substr(0, 1));
      return (
        <div id="wrapper">
          <div id="header">
            <p>TicTacToe</p>
          </div>
          <div id="canvas-wrapper">
            <canvas id="gamecanvas" height="500px" width="500px"></canvas>
          </div>
          <p id="game-info"></p>
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
            <div id="aidifficulty">
              <h1>AI Difficulty</h1>
              <select>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Impossible</option>
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
      this.gameInstance = new Game(this.gridSize, this.difficulty);
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
