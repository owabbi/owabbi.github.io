var circles = [];
var pCoords = document.getElementById("coords");
var canvas = document.getElementById("canvas");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var Area = {

    start: function() {
        this.context = canvas.getContext("2d");
        this.interval = setInterval(updateArea, 20);
    },

    stop: function() {
        clearInterval(this.interval);
    },

    clear: function() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
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


function circle(positionX, positionY, radius) {

    this.x = positionX;
    this.y = positionY;
    this.radius = radius;
    this.speedX = 0;
    this.speedY = 0;

    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.update = function() {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
    }

    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;

        var rockbottom = canvas.height - this.radius;

        if (this.y > rockbottom) {
            this.y = rockbottom;
        }
    }

}

function updateArea() {
    Area.clear();
    for (let index = 0; index < circles.length; index++) {
        circles[index].newPos();
        circles[index].update();
    }


}


document.getElementById("canvas").addEventListener("click", CircleAppear);
document.getElementById("canvas").addEventListener("mousemove", UpdateCoords);

function CircleAppear(event) {
    var positionX = Math.floor(Math.random() * 1000);
    var positionY = Math.floor(Math.random() * 500);

    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;
    var newCircle = new circle(x, y, 20);
    circles.push(newCircle);
    newCircle.update();

    pCoords.innerHTML = coords;


    var elementNumber = document.getElementById("number");

    var CircleNumber = circles.length;
    elementNumber.innerHTML = "Currently " + CircleNumber;
}

function UpdateCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords : " + x + ", Y coords : " + y;

    pCoords.innerHTML = coords;
}