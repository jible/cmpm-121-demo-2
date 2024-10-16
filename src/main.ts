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
let actions :line[][]= [];
let undoneActions: line[][] = [];

let currentAction: line[] = [];
actions.push(currentAction);

const cursor = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");


function undo(): void{
    const undoneAction:line[]|undefined  = actions.pop()
    if (undoneAction){
        undoneActions.push(undoneAction)
    }
    canvas.dispatchEvent(canvasUpdate);
    
}
function redo(): void{
    const redoneAction: line[]|undefined = undoneActions.pop();
    if (redoneAction){
        actions.push(redoneAction)
    }
    canvas.dispatchEvent(canvasUpdate);
}

function drawLines(): void{
    if (ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let currentAction = 0; currentAction < actions.length; currentAction++){
            for (let currentLine = 0; currentLine < actions[currentAction].length; currentLine++){
                ctx.beginPath();
                ctx.moveTo(actions[currentAction][currentLine].start.x, actions[currentAction][currentLine].start.y);
                ctx.lineTo(actions[currentAction][currentLine].end.x, actions[currentAction][currentLine].end.y);
                ctx.stroke();
            }
        }
    }
}

// Triggers for drawing and updating canvas
canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    actions.push(currentAction);
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    if (currentAction.length == 0){
        actions.pop();
    } else {
        currentAction = [];
    }

});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        const start: point = {x: cursor.x, y: cursor.y};
        const end: point = {x: e.offsetX, y: e.offsetY};
        const newLine: line = {start, end};
        currentAction.push(newLine);
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
        undoneActions.length = 0;
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
    actions = [];
    undoneActions = [];
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