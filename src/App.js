import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <div id="header">
          <p>TicTacToe</p>
        </div>
        <div id="options" style={{width:'800px', margin:'0 auto'}}>
          <div id="gridsize">
            <h1>Grid Size</h1>
            <select>
              <option>3x3</option>
              <option>5x5</option>
              <option>7x7</option>
           </select>
          </div>
          <div id="ai">
            <h1>AI</h1>
            <select>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
          <button id="startbtn">Start</button>
        </div>
      </div>
    );
  }
}

export default App;
