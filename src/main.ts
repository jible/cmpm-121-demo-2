import "./style.css";

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

interface point{
    x: number;
    y: number;
}
interface line{
    start: point;
    end: point;
}


let createdLines:Array<line> = new Array<line>;
let undoneLines:Array<line> = new Array<line>;
function drawLine ( newLine: line){
    createdLines.push(newLine);
}
function undo(): void{
    const undoneLine:line|undefined  = createdLines.pop()
    if (undoneLine){
        undoneLines.push(undoneLine)
    }
    
}
function redo(): void{
    const redoneLine: line|undefined = undoneLines.pop();
    if (redoneLine){
        createdLines.push(redoneLine)
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
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        


        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});


const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
    if (ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

const undoButton = document.createElement("button");
clearButton.innerHTML = "undo";
document.body.append(clearButton);

undoButton.addEventListener("click", () => {
    undo();
});
