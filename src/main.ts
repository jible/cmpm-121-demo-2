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


let currentColor: string = '#000000'; // Default color
let currentThickness :number = 1;

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
    thickness: number = currentThickness;
    color: string = currentColor;


    addLine(newLine: line){
        this.lines.push(newLine);
    }
    drawLines(ctx: CanvasRenderingContext2D){
        for (const segments of this.lines){
            ctx.beginPath();
            
            ctx.moveTo(segments.start.x, segments.start.y);
            ctx.lineTo(segments.end.x, segments.end.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness;
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




// Thank you brace
// Function to create and insert a color picker
function addColorPicker() {
    const app = document.getElementById('app'); // Assuming a container element with id 'app'
    if (app) {
      // Create the color picker input element
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.id = 'colorPicker';
      colorPicker.value = '#000000'; // Default color: black
  
      // Handle color changes
      colorPicker.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        currentColor = target.value;
        currentDrag.color =currentColor;
        // Update line color or apply it wherever necessary
      });
  
      // Insert the color picker into the DOM
      app.appendChild(colorPicker);
    }
  }
  
  // Call the function to execute when the script runs
  addColorPicker();
  
  // Variable to keep track of the current color

  // Initial setup function for the slider
function addThicknessSlider() {
    const app = document.getElementById('app');
    if (app) {
      // Create the slider
      const thicknessSlider = document.createElement('input');
      thicknessSlider.type = 'range';
      thicknessSlider.min = '1';    // Minimum thickness
      thicknessSlider.max = '10';   // Maximum thickness (can adjust as needed)
      thicknessSlider.value = '1';  // Default value
      thicknessSlider.id = 'thicknessSlider';
  
      // Label for slider
      const label = document.createElement('label');
      label.innerHTML = 'Line Thickness: ';
      label.appendChild(thicknessSlider);
  
      // Event listener to handle slider input
      thicknessSlider.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        currentThickness = +target.value; // Convert string to number
        console.log('Line thickness set to:', currentThickness); // Feedback for verification
        currentDrag.thickness = currentThickness;
      });
  
      // Append slider and label to the DOM
      app.appendChild(label);
    }
  }
  
  // Call the function to execute when the script runs
  addThicknessSlider();