import CanvasCoordinates from "../wrappers/CanvasCoordinates";
import { throws } from "assert";
import { request } from "http";

class DrawCrossAnim {

    constructor(ctx, cc, gainPerTick, radius) {
        this.ctx = ctx;
        this.radius = radius;
        this.cc = cc;
        this.gainPerTick = gainPerTick;
        this.curGain = 0;
        this.tick = this.tick.bind(this);
    }

    tick() {
        this.curGain += this.gainPerTick;
        this.ctx.beginPath();
        let x = this.cc.getX(), y = this.cc.getY();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + this.curGain, y + this.curGain);
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - this.curGain, y - this.curGain);
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - this.curGain, y + this.curGain);
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + this.curGain, y - this.curGain);
        this.ctx.stroke();
        if(this.curGain < this.radius) {
            window.requestAnimationFrame(this.tick);
        }
    }
}

export default DrawCrossAnim;