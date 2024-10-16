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



const canvasUpdate: Event = new Event("drawing-changed");


    



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


addEventListener("mousemove", (event)=>{
    event
});


const cursor = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");

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