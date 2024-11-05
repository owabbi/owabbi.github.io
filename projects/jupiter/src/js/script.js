import { Particle } from "./particule.js";
import { GravityBall } from "./gravityball.js";
import { Segment } from "./segment.js";
import { frameDelay } from "./tools.js";

var particles = [];
var pCoords = document.getElementById("coords");
var canvas = document.getElementById("canvas");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var AddGumBallBtn = document.getElementById("AddGumBallBtn");
var elementNumber = document.getElementById("number");
var ctx = canvas.getContext("2d");

var GumBallCheck = document.getElementById("GumBall");
var Grid = document.getElementById("Grid");
var DrawLineCheck = document.getElementById("DrawLine");

var mouseIsDown = false;

var GumBallFlag = false;
var GridFlag = false;

var Segments = [];
var currentePente = [];
var DrawingPenteFlag = false;
var EnableDrawLine = false;
var StillDrawing = false;

var milliSeconds = 0;
var t;
startBtn.addEventListener("click", StartGravity);
stopBtn.addEventListener("click", StopGravity);
AddGumBallBtn.addEventListener("click", AddGumBalls);
GumBallCheck.addEventListener("click", SwitchToGumBall);
Grid.addEventListener("click", ShowGrid);
DrawLineCheck.addEventListener("click", SetDrawLine);


function getMousePosition(event) {
    var x = event.clientX;
    var y = event.clientY;
    var trueX = x - 500;
return [trueX, y];
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
    var MousPosition = getMousePosition(event);
    var x = MousPosition[0];
    var y = MousPosition[1];
    var coords = "X coords : " + x + ", Y coords : " + y;
    if (EnableDrawLine == false) {

        if (GumBallFlag == true) {
            var newCircle = new GravityBall(x, y, ctx);
            particles.push(newCircle);
            newCircle.draw();
            t = setInterval(milliSecondsAdder, 1);
        } else {
            var newCircle = new Particle(x, y, ctx);
            particles.push(newCircle);
            newCircle.draw();
        }

        pCoords.innerHTML = coords;



    } else {
        if (StillDrawing == false) {
            currentePente[0] = x;
            currentePente[1] = y;
        } else {
            var currentSegment = new Segment(currentePente[0], currentePente[1], currentePente[2], currentePente[3], ctx);
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
    var MousPosition = getMousePosition(event);
    var x = MousPosition[0];
    var y = MousPosition[1];
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
            var currentSegment = new Segment(currentePente[0], currentePente[1], currentePente[2], currentePente[3], ctx);

            Segments.push(currentSegment);
            currentePente = [];
        }

    }
}

function SwitchToGumBall() {
    if (GumBallCheck.checked == true) {
        GumBallFlag = true;
    } else {
        GumBallFlag = false
    }

}

function ShowGrid() {
    if (Grid.checked == true) {
        console.log("GridON");
        GridFlag = true;
    } else {
        console.log("GridOFF");
        GridFlag = false;
    }
}

function SetDrawLine() {
    if (DrawLineCheck.checked == true) {
        console.log("DrawLine mode");
        EnableDrawLine = true;
    } else {
        console.log("DrawLine mode stopped");
        EnableDrawLine = false;
    }
}

function AddGumBalls() {
    var GumBallNbr = document.getElementById("AddGumBallNbr").value;
    if (GumBallNbr < 101) {
        var counter = 0;
        while (counter != GumBallNbr) {
            var positionX = Math.floor(Math.random() * 1000);
            var positionY = Math.floor(Math.random() * 500);

            var newCircle = new Particle(positionX, positionY, ctx);
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