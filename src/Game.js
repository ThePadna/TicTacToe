import React, { Component } from 'react';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

class Game {

    constuctor(size, ai) {
        
    }

    draw(size) {
        let canv = document.getElementById("gamecanvas");
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.width, MAX_HEIGHT = canv.height;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        let pixelJumpSize = (MAX_WIDTH / size);
        let pixelCur = 0;
        for(let i = 0; i < size; i++) {
            pixelCur+=pixelJumpSize;
            ctx.moveTo(pixelCur, 0);
            ctx.lineTo(pixelCur, MAX_HEIGHT);
            ctx.stroke();
        }


    }
    
    toRadians(deg) {
        return deg * (Math.PI / 180);
    }

}

export default Game;