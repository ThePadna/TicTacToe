class Game {
    ai = false;
    constuctor(ai) { //isnt getting called
        console.log(ai);
        this.ai = ai;
    }

    draw(size) {
        console.log("ai?? " + this.ai);
        let canv = document.getElementById("gamecanvas");
        let MIN_WIDTH = 0, MIN_HEIGHT = 0, MAX_WIDTH = canv.width, MAX_HEIGHT = canv.height;
        let ctx = document.querySelector("#gamecanvas").getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        let pixelJumpSizeHori = (MAX_WIDTH / size), pixelJumpSizeVert = (MAX_HEIGHT / size);
        let pixelCurVert = 0, pixelCurHori = 0;
        for(let i = 0; i < size; i++) {
            pixelCurHori+=pixelJumpSizeHori;
            ctx.moveTo(pixelCurHori, 0);
            ctx.lineTo(pixelCurHori, MAX_HEIGHT);
            ctx.stroke();
        }
        for(let j = 0; j < size; j++) {
            pixelCurVert+=pixelJumpSizeVert;
            ctx.moveTo(0, pixelCurVert);
            ctx.lineTo(MAX_WIDTH, pixelCurVert);
            ctx.stroke();
        }
    }
    
    toRadians(deg) {
        return deg * (Math.PI / 180);
    }

}

export default Game;