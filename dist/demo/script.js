var particles = [];
var pCoords = document.getElementById("coords");
var canvas = document.getElementById("canvas");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var elementNumber = document.getElementById("number");
var ctx = canvas.getContext("2d");

var mouseIsDown = false;

var frameRate = 1 / 40; // Seconds
var frameDelay = frameRate * 1000; // ms

var GumBallFlag = false;
var GridFlag = false;

var Segments = [];
var currentePente = [];
var DrawingPenteFlag = false;
var EnableDrawLine = false;
var StillDrawing = false;

var milliSeconds = 0;
var t;


function dist2(v, w) { return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y) }

function distToSegment(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    }));
}

var Area = {

    start: function() {
        this.interval = setInterval(updateArea, frameDelay);
    },

    stop: function() {
        clearInterval(this.interval);
    },

    clear: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function StartGravity() {
    console.log("Start Gravity");
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
    Area.start();
}

function StopGravity() {
    console.log("Stop Gravity");
    stopBtn.style.display = "none";
    startBtn.style.display = "block";
    Area.stop();
}

function randomNumBetween(min, max) {
    return min + Math.random() * (max - min);
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static addition(vectorA, vectorB) {
        return new Vector(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
    }

    static multiplication(vector, value) {
        return new Vector(vector.x * value, vector.y * value);
    }

    static division(vector, value) {
        return new Vector(vector.x / value, vector.y / value);
    }

    static substraction(vectorA, vectorB) {
        return new Vector(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
    }

    //Produit scalaire
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    //Vecteur tangent
    getTangent() {
        return new Vector(-this.y, this.x);
    }


    //Norme
    mag() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    static random(minX, maxX, minY, maxY) {
        return new Vector(randomNumBetween(minX, maxX), randomNumBetween(minY, maxY));
    }
}

class Segment {
    constructor(startPointX, startPointY, endPointX, endPointY) {
        this.sX = startPointX;
        this.sY = startPointY;
        this.eX = endPointX;
        this.eY = endPointY;
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
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(this.sX, this.sY);
        ctx.lineTo(this.eX, this.eY);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        // ctx.moveTo(this.sX, this.sY);
        // ctx.lineTo(this.tempoPoint.x, this.tempoPoint.y);
        // ctx.lineTo(this.eX, this.eY);
        // ctx.moveTo(this.sX, this.sY);
        // ctx.lineTo(this.sX + (this.normal.x * 100), this.sY + (100 * this.normal.y));
        // ctx.stroke();
    }

}


class Particle {
    constructor(positionX, positionY) {
        this.position = new Vector(positionX, positionY);
        this.velocity = Vector.random(-2, 2, -2, 2);
        this.acceleration = new Vector(0, 0);
        this.radius = 20;
        this.color = "green";

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
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
        ctx.stroke();
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

class GravityBall extends Particle {
    constructor(positionX, positionY) {
        super(positionX, positionY);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.color = "red";
        this.mass = 0.1;
        this.radius = 15;
        this.restitution = -0.7;

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

function updateArea() {
    Area.clear();
    for (let index = 0; index < particles.length; index++) {

        const current = particles[index];

        const rest = particles.slice(index + 1);
        for (let p of rest) {
            p.checkCollision(current);

        }

        for (let q of Segments) {
            current.checkCollisionSegment(q);
        }
        current.update();
        current.handleEdges(canvas.width, canvas.height);
        current.draw();
    }

    if (GridFlag == true) {
        canvas.style.backgroundImage = "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)";
        canvas.style.backgroundSize = "50px 50px";
    } else {
        canvas.style.backgroundSize = "0";
    }

    if (currentePente.length != 0) {
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(currentePente[0], currentePente[1]);
        ctx.lineTo(currentePente[2], currentePente[3]);
        ctx.stroke();
    }

    for (let index = 0; index < Segments.length; index++) {
        const element = Segments[index];
        element.draw();

    }


}


document.getElementById("canvas").addEventListener("click", CircleAppear);
document.getElementById("canvas").addEventListener("mousemove", UpdateCoords);
document.getElementById("canvas").addEventListener("dblclick", DblClick);

function CircleAppear(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;
    if (EnableDrawLine == false) {

        if (GumBallFlag == true) {
            var newCircle = new GravityBall(x, y);
            particles.push(newCircle);
            newCircle.draw();
            t = setInterval(milliSecondsAdder, 1);
        } else {
            var newCircle = new Particle(x, y);
            particles.push(newCircle);
            newCircle.draw();
        }

        pCoords.innerHTML = coords;



    } else {
        if (StillDrawing == false) {
            currentePente[0] = x;
            currentePente[1] = y;
        } else {
            var currentSegment = new Segment(currentePente[0], currentePente[1], currentePente[2], currentePente[3]);
            if (currentePente[2] != 'undefined' || currentePente[3] != 'undefined') {
                Segments.push(currentSegment);
            }
            currentePente = [];
            currentePente[0] = x;
            currentePente[1] = y;
            StillDrawing = false;
        }

        DrawingPenteFlag = true;
        StillDrawing = true;
    }


    var CircleNumber = particles.length;
    elementNumber.innerHTML = "Currently " + CircleNumber;
}

function UpdateCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;

    pCoords.innerHTML = coords;

    if (DrawingPenteFlag == true) {
        currentePente[2] = x;
        currentePente[3] = y;
    }

}

function DblClick(event) {
    if (EnableDrawLine == true) {
        StillDrawing = false;
        var x = event.clientX;
        var y = event.clientY;
        if (DrawingPenteFlag == true) {
            DrawingPenteFlag = false;
            var currentSegment = new Segment(currentePente[0], currentePente[1], currentePente[2], currentePente[3]);

            Segments.push(currentSegment);
            currentePente = [];
        }

    }
}

function SwitchToGumBall() {
    var GumBallCheck = document.getElementById("GumBall");
    if (GumBallCheck.checked == true) {
        GumBallFlag = true;
    } else {
        GumBallFlag = false
    }

}

function ShowGrid() {
    var Grid = document.getElementById("Grid");
    if (Grid.checked == true) {
        console.log("GridON");
        GridFlag = true;
    } else {
        console.log("GridOFF");
        GridFlag = false;
    }
}

function SetDrawLine() {
    var DrawLineCheck = document.getElementById("DrawLine");
    if (DrawLineCheck.checked == true) {
        console.log("DrawLine mode");
        EnableDrawLine = true;
    } else {
        console.log("DrawLine mode stopped");
        EnableDrawLine = false;
    }
}

function AddGumBalls(event) {
    var GumBallNbr = document.getElementById("AddGumBallNbr").value;
    if (GumBallNbr < 101) {
        var counter = 0;
        while (counter != GumBallNbr) {
            var positionX = Math.floor(Math.random() * 1000);
            var positionY = Math.floor(Math.random() * 500);

            var newCircle = new Particle(positionX, positionY);
            particles.push(newCircle);
            newCircle.draw();
            counter++;
            var CircleNumber = particles.length;
            elementNumber.innerHTML = "Currently " + CircleNumber;
        }
    }

}

function milliSecondsAdder() {
    milliSeconds++;
}