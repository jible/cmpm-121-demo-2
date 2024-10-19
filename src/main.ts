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

// --------------------------------------------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------------------------------------------
import { point, line, drag, addLine, drawDrag } from "./dataTypes.ts";
import { wash } from "./drawCommands.ts";
import {
  addColorPicker,
  addThicknessSlider,
  createButton,
} from "./settingButtons.ts";
// --------------------------------------------------------------------------------------------------------
// Setting up cursor and preview
// --------------------------------------------------------------------------------------------------------
enum penModes {
  PEN,
  STAMP,
}
const pen = {
  mode: penModes.PEN,
  currentStamp: "🎲",
  previewActive: false,
  penDown: false,
  x: 0,
  y: 0,
  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  },
  draw(ctx: CanvasRenderingContext2D) {
    if (this.previewActive) {
      ctx.fillStyle = currentColor;
      ctx.font = `32px monospace`;
      ctx.fillText("*", this.x - 8, this.y + 16);
    }
  },
};

function drawCanvas(): void {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const i of drags) {
      drawDrag(i, ctx);
    }
    pen.draw(ctx);
  }
}
// --------------------------------------------------------------------------------------------------------
// Establishing arrays for storing lines
// --------------------------------------------------------------------------------------------------------
let drags: drag[] = [];
let undoneDrags: drag[] = [];
let currentDrag: drag = {
  lines: [],
  thickness: currentThickness,
  color: currentColor,
};
const ctx = canvas.getContext("2d");
// --------------------------------------------------------------------------------------------------------
// Triggers for drawing and updating canvas
// --------------------------------------------------------------------------------------------------------
canvas.addEventListener("tool-changed", function () {
  drawCanvas();
});

canvas.addEventListener("mouseout", (e) => {
  pen.previewActive = false;
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mouseenter", (e) => {
  pen.previewActive = true;
  pen.updatePosition(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mousedown", (e) => {
  console.log(drags);
  pen.penDown = true;
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  drags.push(currentDrag);
});

canvas.addEventListener("mouseup", () => {
  pen.penDown = false;
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
  if (pen.penDown && ctx) {
    const start: point = { x: pen.x, y: pen.y };
    const end: point = { x: e.offsetX, y: e.offsetY };
    const newLine: line = { start, end };
    addLine(currentDrag, newLine);
    pen.x = e.offsetX;
    pen.y = e.offsetY;
    undoneDrags.length = 0;
    canvas.dispatchEvent(canvasUpdate);
  }
  pen.updatePosition(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("drawing-changed", function () {
  drawCanvas();
});

// --------------------------------------------------------------------------------------------------------
// Buttons and associated functions
// --------------------------------------------------------------------------------------------------------
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
const _clearButton = createButton("clear", app, () => {
  clear();
});
const _undoButton = createButton("undo", app, () => {
  undo();
});
const _redoButton = createButton("redo", app, () => {
  redo();
});

const colorPicker = addColorPicker(app);
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

// emoji buttons
const startingEmojis: string[] = ["😂", "🚀", "🎲"];
const emojiButtons: HTMLElement[] = [];
for (const emoji of startingEmojis) {
  emojiButtons.push(
    createButton(emoji, app, () => {
      // set to emoji mode- maybe send signal?
      // set emoji drawing tool to use current emoji
      pen.mode = penModes.STAMP;
      pen.currentStamp = emoji;
    })
  );
}
const _ = createButton("clear", app, () => {
  clear();
});
