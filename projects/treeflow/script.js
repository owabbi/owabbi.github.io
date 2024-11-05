var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var modal = document.getElementById("FlowModal");
canvas.addEventListener("click", ClickEvent);
canvas.addEventListener("mousemove", UpdateMousePosition);
canvas.addEventListener("mousedown", MouseDownEvent);
canvas.addEventListener("mouseup", MouseUpEvent);

var AddCircleBtn = document.getElementById("addCircle");
var StopAddCircleBtn = document.getElementById("stopAddCircle");

var AddSegmentBtn = document.getElementById("addSegment");
var StopAddSegmentBtn = document.getElementById("stopAddSegment");

var LoadFileBtn = document.getElementById("loadFile");
LoadFileBtn.addEventListener('change', LoadFile);

var flows = [];
var particles = [];

var segments = [];

var AddCircleFlag = false;
var MovingParticleFlag = false;

var AddSegmentFlag = false;
var StillDrawingSegment = false;

var EditFlowFlag = false;

var MoveCircleFlag = false;

var SelectedFlow;
var SelectedFlowIndex = 0;

var MouseX;
var MouseY;

var SelectedParticle;
var LinkedSegments = [];

var BreakPointMoveFlag = false;
var BreakPointFlag = false;
var SelectedBreakPoint;

var ShowBreakPointsFlag = false;

function UpdateMousePosition(event) {
    MouseX = event.clientX;
    MouseY = event.clientY;

    if (MovingParticleFlag) {
        for (let index = 0; index < LinkedSegments.length; index++) {
            const element = LinkedSegments[index];
            console.table(element.breakpoints);
            if (element.startX == SelectedParticle.posX) {
                if (element.startY == SelectedParticle.posY) {
                    element.startX = MouseX;
                    element.startY = MouseY;
                    element.breakpoints[0] = new BreakPoint(MouseX, MouseY);
                }
            }
            if (element.endX == SelectedParticle.posX) {
                if (element.endY == SelectedParticle.posY) {
                    element.endX = MouseX;
                    element.endY = MouseY;
                    element.breakpoints[element.breakpoints.length - 1] = new BreakPoint(MouseX, MouseY);
                }
            }
        }
        SelectedParticle.posX = MouseX;
        SelectedParticle.posY = MouseY;
    }

    if (BreakPointMoveFlag == true) {
        SelectedBreakPoint.x = MouseX;
        SelectedBreakPoint.y = MouseY;
    }
}

function MouseDownEvent(event) {
    if (MoveCircleFlag) {
        for (let index = 0; index < particles.length; index++) {
            const element = particles[index];

            if (ParticleClicked(event, element.posX, element.posY, element.radius)) {

                SelectedParticle = particles.find((e) => ((e.posX == element.posX) && (e.posY == element.posY)));
                console.log(SelectedParticle);

                LinkedSegments = segments.filter(obj => (((obj.startX == element.posX) && (obj.startY == element.posY)) || ((obj.endX == element.posX) && (obj.endY == element.posY))));

                console.table(LinkedSegments);
                MovingParticleFlag = true;
            }
        }
    }
}

function MouseUpEvent(params) {
    MovingParticleFlag = false;
}

function Start() {
    setInterval(updateArea, 20);
    StopAddCircleBtn.style.display = "none";
    StopAddSegmentBtn.style.display = "none";

    var DefaultColor = "black";
    var DefaultName = "Default";
    var DefaultFlow = new Flow(DefaultColor, DefaultName, [], []);

    var Element = document.getElementById("Element1");
    var ElementName = document.getElementById("NameElement1");
    var ElementIcon = document.getElementById("IconElement1");

    Element.style.display = "flex";
    Element.style.backgroundColor = "silver";
    ElementName.innerHTML = DefaultName;
    ElementIcon.style.backgroundColor = DefaultColor;

    flows.push(DefaultFlow);
    console.table(flows);

    SelectedFlow = DefaultFlow;

}

function Clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

class Flow {
    constructor(color, name, particles, segments) {
        this.particles = particles;
        this.segments = segments;
        this.color = color;
        this.name = name;
    }
}

function getCurrentFlow(element) {
    return flows[element];
}

class Particle {
    constructor(positionX, positionY, color, radius) {
        this.posX = positionX;
        this.posY = positionY;
        this.color = color;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function EnableAddCircle() {
    AddCircleFlag = true;
    AddCircleBtn.style.display = "none";
    StopAddCircleBtn.style.display = "block";
    DisableDrawSegment();
}

function DisableAddCircle() {
    AddCircleFlag = false;
    AddCircleBtn.style.display = "block";
    StopAddCircleBtn.style.display = "none";
}

function EnableDrawSegment() {
    AddSegmentFlag = true;
    AddSegmentBtn.style.display = "none";
    StopAddSegmentBtn.style.display = "block";
    DisableAddCircle();
}

function DisableDrawSegment() {
    AddSegmentFlag = false;
    AddSegmentBtn.style.display = "block";
    StopAddSegmentBtn.style.display = "none";
}

function OpenFlowModal() {
    modal.style.display = "block";
}

function CloseFlowModal() {
    modal.style.display = "none";
}


window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function ParticleClicked(event, x, y, width) {
    var CurrentX = event.clientX;
    var CurrentY = event.clientY;
    if ((CurrentX < x + width) && (CurrentX > x - width)) {
        if ((CurrentY < y + width) && (CurrentY > y - width)) {
            console.log("Clicked");
            return true;
        }
    }
}

function NoSuperposed(event, x, y, width) {
    var CurrentX = event.clientX;
    var CurrentY = event.clientY;

    var dx = CurrentX - x;
    var dy = CurrentY - y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2 * width) {
        console.log("Collision");
        return true;
    }
}

class BreakPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = red;
        ctx.fill();
    }
}

class Segment {
    constructor(startX, startY, endX, endY, color, width) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.startPoint = new BreakPoint(startX, startY);
        this.endPoint = new BreakPoint(endX, endY);
        this.color = color;
        this.width = width;
        this.breakpoints = [this.startPoint, this.endPoint];
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        for (let index = 0; index < this.breakpoints.length; index++) {
            const element = this.breakpoints[index];
            ctx.lineTo(element.x, element.y);
        }
        ctx.lineTo(this.endX, this.endY);
        ctx.setLineDash([]);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.stroke();
    }

    addBreak(x, y, j) {
        const newBreakPoint = new BreakPoint(x, y);
        this.breakpoints.splice(j, 0, newBreakPoint);
        console.table(this.breakpoints);
        BreakPointMoveFlag = true;
        SelectedBreakPoint = newBreakPoint;
    }
}

function distance(aX, aY, bX, bY) {
    return Math.sqrt((aX - bX) * (aX - bX) + (aY - bY) * (aY - bY));
}

var StartX = 0;
var StartY = 0;

var epsilon = 0.01;

function ClickEvent(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (AddCircleFlag) {
        var NewParticle = new Particle(x, y, SelectedFlow.color, 20);
        if (particles.length >= 1) {
            for (let index = 0; index < particles.length; index++) {
                const element = particles[index];
                var test = NoSuperposed(event, element.posX, element.posY, element.radius);
                if (test == true) {
                    return;
                }
            }
        }
        particles.push(NewParticle);
        SelectedFlow.particles.push(NewParticle);
        console.table(SelectedFlow.particles);
        console.log("General particles");
        console.table(particles);
    } else if (AddSegmentFlag) {
        for (let index = 0; index < particles.length; index++) {
            const element = particles[index];
            if (ParticleClicked(event, element.posX, element.posY, element.radius)) {
                if (StillDrawingSegment == false) {
                    StartX = element.posX;
                    StartY = element.posY;
                    StillDrawingSegment = true;
                } else {
                    var NewSegment = new Segment(StartX, StartY, element.posX, element.posY, SelectedFlow.color, 5);
                    segments.push(NewSegment);
                    SelectedFlow.segments.push(NewSegment);
                    StillDrawingSegment = false;
                    StartX = 0;
                    StartY = 0;
                }
            }
        }

    } else if (BreakPointMoveFlag) {
        BreakPointMoveFlag = false;
    } else if (BreakPointFlag == true) {
        for (let index = 0; index < segments.length; index++) {
            const element = segments[index];
            for (let j = 0; j < element.breakpoints.length; j++) {
                const point = element.breakpoints[j];
                if ((point.x - x) < epsilon) {
                    if ((point.y - y) < epsilon) {

                        BreakPointMoveFlag = true;
                        SelectedBreakPoint = point;
                        console.log("point clicked");
                    }
                }
            }

        }
    } else {
        for (let index = 0; index < segments.length; index++) {
            const element = segments[index];

            console.table(element.breakpoints);
            for (let j = 1; j < element.breakpoints.length; j++) {
                const CurrentPoint = element.breakpoints[j - 1];
                const point = element.breakpoints[j];
                const interA = distance(x, y, CurrentPoint.x, CurrentPoint.y);
                const interB = distance(x, y, point.x, point.y);
                const distTotal = distance(CurrentPoint.x, CurrentPoint.y, point.x, point.y);
                if (Math.abs((interA + interB) - distTotal < epsilon)) {
                    if (MoveCircleFlag == false) {
                        AddBreakpoint(x, y, element, j);
                        break;
                    }
                }
            }
        }
    }
}

function AddBreakpoint(x, y, segment, j) {
    console.log("is on segement");
    segment.addBreak(x, y, j);
}

function updateArea(event) {
    Clear();
    for (let index = 0; index < segments.length; index++) {
        const element = segments[index];
        element.draw();
        if (ShowBreakPointsFlag) {
            for (let j = 0; j < element.breakpoints.length; j++) {
                const point = element.breakpoints[j];
                if (j != 0 || j != element.breakpoints - 1) {
                    point.draw();
                }
            }
        }
    }
    for (let index = 0; index < particles.length; index++) {
        const element = particles[index];
        element.draw();
    }
    if (StillDrawingSegment) {
        ctx.beginPath();
        ctx.moveTo(StartX, StartY);
        ctx.lineTo(MouseX, MouseY);
        ctx.setLineDash([5, 15]);
        ctx.stroke();
    }


}

function SaveFile(params) {
    const gigArray = [];
    gigArray[0] = flows;
    gigArray[1] = particles;
    gigArray[2] = segments;
    var a = document.createElement("a");
    const myJSONstring = JSON.stringify(flows, null, 2);

    const JSONstringGiga = JSON.stringify(gigArray, null, 2);
    // const myJSONstring2 = JSON.stringify(segments);
    a.href = window.URL.createObjectURL(new Blob([myJSONstring], { type: "text/plain" }));
    // a.href = window.URL.createObjectURL(new Blob(["Segments "+myJSONstring2], {type: "text/plain"}));
    a.download = "test.fs";
    a.click();
}

function LoadFile(event) {
    const fileList = event.target.files;
    const reader = new FileReader();
    reader.readAsText(fileList[0]);
    reader.onload = function(event) {
        console.log(reader.result);
        const Jsonresult = JSON.parse(reader.result);

        console.table(Jsonresult);
        for (let index = 0; index < Jsonresult.length; index++) {
            const element = Jsonresult[index];

            var tempoParticles = [];

            var tempoSegments = [];

            for (let i = 0; i < element.segments.length; i++) {
                const particle = element.segments[i];
                const newElement = new Segment(particle.startX, particle.startY, particle.endX, particle.endY, particle.color, particle.width);
                segments.push(newElement);
                tempoSegments.push(newElement);
            }
            for (let i = 0; i < element.particles.length; i++) {
                const particle = element.particles[i];
                const newElement = new Particle(particle.posX, particle.posY, particle.color, particle.radius);
                particles.push(newElement);
                tempoParticles.push(newElement);
            }

            const newFlow = new Flow(element.color, element.name, tempoParticles, tempoSegments);
            if (index == 0) {
                flows[0] = newFlow;
            } else {
                flows.push(newFlow);
            }

            var Element = document.getElementById(GetCorrectElement(flows.length));
            var ElementName = document.getElementById(GetNameElement(flows.length));
            var ElementIcon = document.getElementById(GetIconElemnt(flows.length));

            Element.style.display = "flex";
            ElementName.innerHTML = element.name;
            ElementIcon.style.backgroundColor = element.color;

            if (flows.length == 5) {
                var AddElement = document.getElementById("ElementAdd");
                AddElement.style.display = "none";
            }

        }

        console.table(flows);
    };

}

function GetCorrectElement(Id) {
    var Element;
    switch (Id) {
        case 1:
            Element = "Element1";
            break;
        case 2:
            Element = "Element2";
            break;
        case 3:
            Element = "Element3";
            break;
        case 4:
            Element = "Element4";
            break;
        case 5:
            Element = "Element5";
            break;
        default:
            break;
    }
    return Element;
}

function GetNameElement(Id) {
    var Element;
    switch (Id) {
        case 1:
            Element = "NameElement1";
            break;
        case 2:
            Element = "NameElement2";
            break;
        case 3:
            Element = "NameElement3";
            break;
        case 4:
            Element = "NameElement4";
            break;
        case 5:
            Element = "NameElement5";
            break;
        default:
            break;
    }
    return Element;
}

function GetIconElemnt(Id) {
    var Element;
    switch (Id) {
        case 1:
            Element = "IconElement1";
            break;
        case 2:
            Element = "IconElement2";
            break;
        case 3:
            Element = "IconElement3";
            break;
        case 4:
            Element = "IconElement4";
            break;
        case 5:
            Element = "IconElement5";
            break;
        default:
            break;
    }
    return Element;
}


function AddFlow() {
    var RedValue = document.getElementById("RedColor").value;
    var GreenValue = document.getElementById("GreenColor").value;
    var BlueValue = document.getElementById("BlueColor").value;
    var FlowName = document.getElementById("FlowName").value;
    var Color = "rgb(" + RedValue + ", " + GreenValue + ", " + BlueValue + ")";

    if (EditFlowFlag == false) {
        var NewFlow = new Flow(Color, FlowName, [], []);
        flows.push(NewFlow);
        var Element = document.getElementById(GetCorrectElement(flows.length));
        var ElementName = document.getElementById(GetNameElement(flows.length));
        var ElementIcon = document.getElementById(GetIconElemnt(flows.length));

        Element.style.display = "flex";
        ElementName.innerHTML = FlowName;
        ElementIcon.style.backgroundColor = Color;

        if (flows.length == 5) {
            var AddElement = document.getElementById("ElementAdd");
            AddElement.style.display = "none";
        }
    } else {
        var Element = document.getElementById(GetCorrectElement(SelectedFlowIndex + 1));
        var ElementName = document.getElementById(GetNameElement(SelectedFlowIndex + 1));
        var ElementIcon = document.getElementById(GetIconElemnt(SelectedFlowIndex + 1));

        Element.style.display = "flex";
        ElementName.innerHTML = FlowName;
        ElementIcon.style.backgroundColor = Color;
        Element.style.backgroundColor = "silver";

        var FlowElement = flows[SelectedFlowIndex];
        FlowElement.color = Color;
        FlowElement.name = FlowName;

        for (let index = 0; index < SelectedFlow.particles.length; index++) {
            const element = SelectedFlow.particles[index];
            element.color = Color;
        }

        for (let index = 0; index < SelectedFlow.segments.length; index++) {
            const element = SelectedFlow.segments[index];
            element.color = Color;
        }
        EditFlowFlag = false;
    }
    console.table(flows);
    CloseFlowModal();
}


function SwitchFlow(index) {
    console.log(SelectedFlow);
    console.log(SelectedFlowIndex);
    var Element = document.getElementById(GetCorrectElement(index + 1));
    var PreviousElement = document.getElementById(GetCorrectElement(SelectedFlowIndex + 1));
    Element.style.backgroundColor = "silver";
    PreviousElement.style.backgroundColor = "white";
    SelectedFlowIndex = index;
    SelectedFlow = flows[index];

    console.log(SelectedFlowIndex);
    console.log(SelectedFlow);
}

function EditFlow(element) {
    EditFlowFlag = true;
    OpenFlowModal();

}

function DeleteFlow(element) {
    console.table(flows);
    console.log("Delete n°" + element);
    var Element = document.getElementById(GetCorrectElement(element));
    Element.style.display = "none";
    SelectedFlowIndex = 0;
    delete flows[element - 1];
    console.table(flows);
}

function MoveCircle(params) {
    MoveCircleFlag = true;
    BreakPointMoveFlag = false;
}

function StopMoveCircle(params) {
    MoveCircleFlag = false;
}

function MoveBreakpoint(params) {
    BreakPointFlag = true;
}

function StopMoveBreakpoint(params) {
    BreakPointFlag = false;
}

function ShowBreakpoints(params) {
    ShowBreakPointsFlag = true;
}

function HideBreakpoints(params) {
    ShowBreakPointsFlag = false;
}