var particles = [];
var pCoords = document.getElementById("coords");
var canvas = document.getElementById("canvas");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var elementNumber = document.getElementById("number");
var ctx = canvas.getContext("2d");
var GumBallFlag = false;
var GridFlag = false;

var Area = {

    start: function() {
        this.interval = setInterval(updateArea, 20);
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

class Particle {
    constructor(positionX, positionY) {
        this.position = new Vector(positionX, positionY);
        this.velocity = Vector.random(-1, 1, -1, 1);
        this.acceleration = new Vector(0, 0);
        this.radius = 20;
        this.color = "green";
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

}

class GravityBall extends Particle {
    constructor(positionX, positionY) {
        super(positionX, positionY);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.color = "red";
    }

    update() {
        super.update();
        this.acceleration.y += 0.25;
        this.velocity.x *= 0.97;
    }

    handleEdges() {
        var rockbottom = canvas.height - this.radius;
        var allright = canvas.width - this.radius;

        if (this.position.x - this.radius <= 0) {
            this.position.x = this.radius
        }
        if (this.position.x >= allright) {
            this.position.x = allright;
        }
        if (this.position.y > rockbottom) {
            this.position.y = rockbottom;
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
        current.update();
        current.handleEdges(canvas.width, canvas.height);
        current.draw();
    }

    if(GridFlag == true)
    {
        canvas.style.backgroundImage = "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)";
        canvas.style.backgroundSize = "50px 50px";
    }
    else{
        canvas.style.backgroundSize = "0";
    }


}


document.getElementById("canvas").addEventListener("click", CircleAppear);
document.getElementById("canvas").addEventListener("mousemove", UpdateCoords);

function CircleAppear(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;
    if (GumBallFlag == true) {
        var newCircle = new GravityBall(x, y);
        particles.push(newCircle);
        newCircle.draw();
    } else {
        var newCircle = new Particle(x, y);
        particles.push(newCircle);
        newCircle.draw();
    }

    pCoords.innerHTML = coords;


    var CircleNumber = particles.length;
    elementNumber.innerHTML = "Currently " + CircleNumber;
}

function UpdateCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;

    pCoords.innerHTML = coords;
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
    console.log("GridON");
    if (Grid.checked == true) {
        GridFlag = true;
    } else {
        GridFlag = false;
    }
}

function AddGumBalls(event) {
    var GumBallNbr = document.getElementById("AddGumBallNbr").value;
    if (GumBallNbr < 101) {
        var counter = 0;
        console.log(GumBallNbr);
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