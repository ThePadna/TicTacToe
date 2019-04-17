import React, { Component } from 'react';
import './App.css';
import Settings from './Settings';

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <div id="header">
          <p>TicTacToe</p>
        </div>
        <Settings></Settings>
      </div>
    );
  }
  newGame() {
    
  }
}

export default App;
