import "./style.css";
import { EventEmitter } from 'node:events';

const APP_NAME = "kaku";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// Create canvas
const canvas = document.createElement("canvas");
canvas.className = "kaku-canvas";
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);


// Fires every time the canvas needs to be redrawn
const canvasUpdate: Event = new Event("drawing-changed");

// Unique interfaces for this project
/*
Explanation: everytime the person puts their mouse down it starts an action (current action). 
This action is added to the end of the actions array
When user releases their mouse, it makes a new current action and the old one is just part of the action list

Each action is made of a line from one point to another

When user undos, it pops the end of the action array to the undone array
when user redos, it pops end of undone array to the actions array

redo array cleared when player draws a new line
all arrays are cleared when canvas cleared.
*/


interface point{
    x: number;
    y: number;
}
interface line{
    start: point;
    end: point;
}
class drag{
    lines: line[] = []



    addLine(newLine: line){
        this.lines.push(newLine);
    }
    drawLines(ctx: CanvasRenderingContext2D){
        for (const segments of this.lines){
            ctx.beginPath();
            ctx.moveTo(segments.start.x, segments.start.y);
            ctx.lineTo(segments.end.x, segments.end.y);
            ctx.stroke();
        }
    }


}


let drags :drag[]= [];
let undoneDrags: drag[] = [];

let currentDrag: drag = new drag;
drags.push(currentDrag);

const cursor = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");


function undo(): void{
    const undoneDrag:drag|undefined  = drags.pop()
    if (undoneDrag){
        undoneDrags.push(undoneDrag);
    }
    canvas.dispatchEvent(canvasUpdate);
    
}
function redo(): void{
    const redoneDrag: drag|undefined = undoneDrags.pop();
    if (redoneDrag){
        drags.push(redoneDrag);
    }
    canvas.dispatchEvent(canvasUpdate);
}

function drawLines(): void{
    if (ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for ( const i of drags){
            i.drawLines(ctx);
        }
    }
}

// Triggers for drawing and updating canvas
canvas.addEventListener("mousedown", (e) => {
    console.log(drags);
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    drags.push(currentDrag);
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    if (currentDrag.lines.length == 0){
        drags.pop();
    } else {
        currentDrag = new drag;
    }

});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        const start: point = {x: cursor.x, y: cursor.y};
        const end: point = {x: e.offsetX, y: e.offsetY};
        const newLine: line = {start, end};
        currentDrag.addLine(newLine);
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
        undoneDrags.length = 0;
        canvas.dispatchEvent(canvasUpdate);
    }
});

canvas.addEventListener("drawing-changed", function(){
    drawLines();
});


// Buttons
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
    if (ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drags = [];
    undoneDrags = [];
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
    undo();
});


const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
    redo();
});