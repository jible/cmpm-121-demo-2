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

// Events
const canvasUpdate: Event = new Event("drawing-changed");
const toolChanged: Event = new Event("tool-changed");

// tool settings
let currentColor: string = "#000000"; // Default color
let currentThickness: number = 1;

const cursor = {
  active: false,
  x: 0,
  y: 0,
};

// Imports
import { point, line, drag, addLine, drawDrag } from "./dataTypes.ts";
import {
  addColorPicker,
  addThicknessSlider,
  createButton,
} from "./settingButtons.ts";
import { wash } from "./drawCommands.ts";

// Setting up cursor and preview
const toolPreview = {
  active: false,
  x: 0,
  y: 0,
  updatePosition(x?: number, y?: number) {
    if (x) {
      this.x = x;
    }
    if (y) {
      this.y = y;
    }
  },
  draw(ctx: CanvasRenderingContext2D) {
    if (this.active) {
      ctx.fillStyle = currentColor;
      ctx.font = `32px monospace`;
      ctx.fillText("*", this.x - 8, this.y + 16);
    }
  },
};

// canvas data type and functions

let drags: drag[] = [];
let undoneDrags: drag[] = [];
let currentDrag: drag = {
  lines: [],
  thickness: currentThickness,
  color: currentColor,
};
drags.push(currentDrag);
const ctx = canvas.getContext("2d");

function clear(): void {
  currentDrag = {
    lines: [],
    thickness: currentThickness,
    color: currentColor,
  };
  if (ctx) {
    wash(canvas, ctx);
  }
  drags = [];
  undoneDrags = [];
}

function undo(): void {
  const undoneDrag: drag | undefined = drags.pop();
  if (undoneDrag) {
    undoneDrags.push(undoneDrag);
  }
  canvas.dispatchEvent(canvasUpdate);
}
function redo(): void {
  const redoneDrag: drag | undefined = undoneDrags.pop();
  if (redoneDrag) {
    drags.push(redoneDrag);
  }
  canvas.dispatchEvent(canvasUpdate);
}
function drawCanvas(): void {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const i of drags) {
      drawDrag(i, ctx);
    }
    toolPreview.draw(ctx);
  }
}

// Triggers for drawing and updating canvas
canvas.addEventListener("tool-changed", function () {
  drawCanvas();
});

canvas.addEventListener("mouseout", (e) => {
  toolPreview.active = false;
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mouseenter", (e) => {
  toolPreview.active = true;
  toolPreview.updatePosition(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mousedown", (e) => {
  console.log(drags);
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  drags.push(currentDrag);
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  if (currentDrag.lines.length == 0) {
    drags.pop();
  } else {
    currentDrag = {
      lines: [],
      thickness: currentThickness,
      color: currentColor,
    };
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && ctx) {
    const start: point = { x: cursor.x, y: cursor.y };
    const end: point = { x: e.offsetX, y: e.offsetY };
    const newLine: line = { start, end };
    addLine(currentDrag, newLine);
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    undoneDrags.length = 0;
    canvas.dispatchEvent(canvasUpdate);
  }
  toolPreview.updatePosition(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("drawing-changed", function () {
  drawCanvas();
});

// Buttons
const colorPicker = addColorPicker(app);
// Handle color changes

colorPicker.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  currentColor = target.value;
  currentDrag.color = currentColor;
  canvas.dispatchEvent(toolChanged);
  // Update line color or apply it wherever necessary
});
const thicknessSlider = addThicknessSlider(app);
thicknessSlider.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  currentThickness = +target.value; // Convert string to number
  console.log("Line thickness set to:", currentThickness); // Feedback for verification
  currentDrag.thickness = currentThickness;
  canvas.dispatchEvent(toolChanged);
});

const _clearButton = createButton("clear", app, () => {
  clear();
});
const _undoButton = createButton("undo", app, () => {
  undo();
});
const _redoButton = createButton("redo", app, () => {
  redo();
});
