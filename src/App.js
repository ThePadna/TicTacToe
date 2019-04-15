import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom';
import Options from './Options';

class App extends Component {
  render() {
    return (
      <div id="home">
        <div id="header">
          <p id="title"><span id="tic">Tic</span><span id="tac">Tac</span><span id="toe">Toe</span></p>
        </div>
        <div id="options">
        <Options></Options>
        </div>
      </div>
    );
  }
}

export default App;
