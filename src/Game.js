import React, { Component } from 'react';

class Game {

    constuctor(size, ai) {
        
    }

    draw(size) {
        let canv = document.getElementById("gamecanvas");
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.offsetWidth, MAX_HEIGHT = canv.offsetHeight;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.beginPath();
    }
    
    toRadians(deg) {
        return deg * (Math.PI / 180);
    }

}

export default Game;