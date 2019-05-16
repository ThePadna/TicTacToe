import React, { Component } from 'react';
import './App.css';
import Settings from './Settings';
import Game from './Game';

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <div id="header">
          <p>TicTacToe</p>
        </div>
        <Settings></Settings>
        <div id="canvas-wrapper">
          <canvas id="gamecanvas"></canvas>
        </div>
      </div>
    );
  }
}

export default App;
