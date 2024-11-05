import Vector from "./vector.js";
import { dist2, distToSegment } from "./tools.js";

export class Particle {
    constructor(positionX, positionY, context) {
        this.position = new Vector(positionX, positionY);
        this.velocity = Vector.random(-2, 2, -2, 2);
        this.acceleration = new Vector(0, 0);
        this.radius = 20;
        this.color = "green";
        this.ctx = context;

        this.length1 = this.velocity.mag();

        this.theta = Math.acos(Math.sqrt(dist2(this.velocity.x, this.velocity.y)) / (this.length1));

    }
    update() {
        this.position = Vector.addition(this.position, this.velocity);
        this.velocity = Vector.addition(this.velocity, this.acceleration);
        this.acceleration = Vector.multiplication(this.acceleration, 0);
        this.velocity = Vector.multiplication(this.velocity, 1);
    }

    handleEdges() {
        var rockbottom = canvas.height - this.radius;
        var allright = canvas.width - this.radius;

        if (this.position.x - this.radius <= 0) {
            this.velocity.x = -this.velocity.x;
            this.position.x = this.radius
        }
        if (this.position.x >= allright) {
            this.position.x = allright;
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y - this.radius <= 0) {
            this.position.y = this.radius;
            this.velocity.y = -this.velocity.y;
        }
        if (this.position.y > rockbottom) {
            this.velocity.y = -this.velocity.y;
            this.position.y = rockbottom;
        }
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineTo(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
        this.ctx.stroke();
    }

    checkCollision(particle) {
        const v = Vector.substraction(this.position, particle.position);
        const distance = v.mag();

        if (distance <= this.radius + particle.radius) {
            const unitNormal = Vector.division(v, v.mag());
            const unitTangent = unitNormal.getTangent();

            const correction = Vector.multiplication(unitNormal, this.radius + particle.radius);
            const newV = Vector.addition(particle.position, correction);
            this.position = newV;

            const a = this.velocity;
            const b = particle.velocity;

            const a_n = a.dot(unitNormal);
            const b_n = b.dot(unitNormal);
            const a_t = a.dot(unitTangent);
            const b_t = b.dot(unitTangent);

            const a_n_final = (a_n * (this.radius - particle.radius) +
                2 * particle.radius * b_n) / (this.radius + particle.radius);
            const b_n_final = (b_n * (particle.radius - this.radius) +
                2 * this.radius * a_n) / (this.radius + particle.radius);

            const a_n_after = Vector.multiplication(unitNormal, a_n_final);
            const b_n_after = Vector.multiplication(unitNormal, b_n_final);
            const a_t_after = Vector.multiplication(unitTangent, a_t);
            const b_t_after = Vector.multiplication(unitTangent, b_t);

            const a_after = Vector.addition(a_n_after, a_t_after);
            const b_after = Vector.addition(b_n_after, b_t_after);

            this.velocity = a_after;
            particle.velocity = b_after;
        }
    }

    checkCollisionSegment(segment) {
        var dist = distToSegment(this.position, segment.startVector, segment.endVector);
        if (dist <= this.radius) {

            var normal = segment.normal;
            var unitNormal = Vector.division(normal, normal.mag());

            var d = 2 * this.velocity.dot(normal);
            console.log(d);


            this.velocity.x -= d * normal.x;
            this.velocity.y -= d * normal.y;

            var vectorSegmentunit = segment.unit;

            var changedOrigin = Vector.substraction(this.position, segment.startVector);

            var projectionFactor = changedOrigin.dot(segment.vector) / segment.vector.mag();
            var projectionCoords = Vector.multiplication(vectorSegmentunit, projectionFactor);

            var projected = Vector.addition(projectionCoords, segment.startVector);

            var correction = Vector.multiplication(unitNormal, this.radius);

            if (d >= 0) {
                const newV = Vector.substraction(projected, correction);

                this.position = newV;
            } else {
                const newV = Vector.addition(projected, correction);

                this.position = newV;

            }

        }
    }

}