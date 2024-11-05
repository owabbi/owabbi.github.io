import Vector from "./vector.js";
import { dist2 } from "./tools.js";

export class Segment {
    constructor(startPointX, startPointY, endPointX, endPointY, context) {
        this.sX = startPointX;
        this.sY = startPointY;
        this.eX = endPointX;
        this.eY = endPointY;
        this.ctx = context;
        this.startVector = new Vector(startPointX, startPointY);
        this.endVector = new Vector(endPointX, endPointY);

        this.vector = Vector.substraction(this.endVector, this.startVector);

        this.tempoPoint = new Vector(endPointX, startPointY);

        this.length1 = Math.sqrt(dist2(this.startVector, this.endVector));

        this.theta = Math.atan2(this.vector.y, this.vector.x);

        this.thetaDeg = this.theta * 180 / Math.PI;

        this.normal = new Vector(Math.sin(this.theta), -1 * Math.cos(this.theta));

        this.unit = Vector.division(this.vector, this.length1);
        console.table(this.unit);

    }

    draw() {
        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.moveTo(this.sX, this.sY);
        this.ctx.lineTo(this.eX, this.eY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 15]);
        // ctx.moveTo(this.sX, this.sY);
        // ctx.lineTo(this.tempoPoint.x, this.tempoPoint.y);
        // ctx.lineTo(this.eX, this.eY);
        // ctx.moveTo(this.sX, this.sY);
        // ctx.lineTo(this.sX + (this.normal.x * 100), this.sY + (100 * this.normal.y));
        // ctx.stroke();
    }

}
