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
        <canvas id="gamecanvas" style={{width:'500',height:'500'}}></canvas>
      </div>
    );
  }
}

export default App;
