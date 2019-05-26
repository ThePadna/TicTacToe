import CanvasCoordinates from '../wrappers/CanvasCoordinates'

class DrawCircleAnim {

    constructor(ctx, cc, radius, startAngle, endAngle, gainPerTick) {
        this.ctx = ctx;
        this.cc = cc;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.gainPerTick = gainPerTick;
        this.curAngle = 0;
        this.tick = this.tick.bind(this);
    }

    tick() {
        this.curAngle+=this.gainPerTick;
        this.ctx.beginPath();
        this.ctx.arc(this.cc.getX(), this.cc.getY(), this.radius, this.startAngle, this.curAngle);
        this.ctx.stroke();
        if(this.curAngle < this.endAngle) {
            window.requestAnimationFrame(this.tick);
        }
    }
}

export default DrawCircleAnim;