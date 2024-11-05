import Vector from "./vector.js";
import { Particle } from "./particule.js";
import { frameRate } from "./tools.js";

export class GravityBall extends Particle {
    constructor(positionX, positionY, context) {
        super(positionX, positionY, context);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.color = "red";
        this.mass = 0.1;
        this.radius = 15;
        this.restitution = -0.7;
        this.ctx = context;

        this.Cd = 0.47; // Dimensionless
        this.rho = 1.22; // kg / m^3
        this.A = Math.PI * this.radius * this.radius / (10000); // m^2
        this.ag = 9.81; // m / s^2

    }

    update() {
        var Fx = -0.5 * this.Cd * this.A * this.rho * this.velocity.x * this.velocity.x * this.velocity.x / Math.abs(this.velocity.x);
        var Fy = -0.5 * this.Cd * this.A * this.rho * this.velocity.y * this.velocity.y * this.velocity.y / Math.abs(this.velocity.y);

        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);

        // Calculate acceleration ( F = ma )
        var ax = Fx / this.mass;
        var ay = this.ag + (Fy / this.mass);
        // Integrate to get velocity
        this.velocity.x += ax * frameRate;
        this.velocity.y += ay * frameRate;

        // Integrate to get position
        this.position.x += this.velocity.x * frameRate * 100;
        this.position.y += this.velocity.y * frameRate * 100;

    }

    handleEdges() {
        if (this.position.y > canvas.height - this.radius) {
            this.velocity.y *= this.restitution;
            this.position.y = canvas.height - this.radius;
        }
        if (this.position.x > canvas.width - this.radius) {
            this.velocity.x *= this.restitution;
            this.position.x = canvas.width - this.radius;
        }
        if (this.position.x < this.radius) {
            this.velocity.x *= this.restitution;
            this.position.x = this.radius;
        }
    }

}