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
const ctx = canvas.getContext("2d");
// Events
const canvasUpdate: Event = new Event("drawing-changed");
const toolChanged: Event = new Event("tool-changed");
// tool settings
let currentColor: string = "#000000"; // Default color
let currentThickness: number = 1;

// --------------------------------------------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------------------------------------------
import { point, line, drag, action, stamp } from "./dataTypes.ts";
import { wash } from "./drawCommands.ts";
import {
  addColorPicker,
  addThicknessSlider,
  createButton,
} from "./settingButtons.ts";
// --------------------------------------------------------------------------------------------------------
// Setting up cursor and preview
// --------------------------------------------------------------------------------------------------------

const pen = {
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
      if (currentAction instanceof drag) {
        ctx.fillStyle = currentColor;
        ctx.font = `32px monospace`;
        ctx.fillText("*", this.x - 8, this.y + 16);
      } else if (currentAction instanceof stamp) {
        ctx.font = `${7 * currentThickness}px monospace`;

        const metrics = ctx.measureText(this.currentStamp);
        const textWidth = metrics.width;
        const textHeight =
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        // Calculate position to draw text centered on the mouse
        const x = this.x - textWidth / 2;
        const y = this.y + textHeight / 2;
        ctx.fillText(this.currentStamp, x, y);
      }
    }
  },
};

function drawCanvas(): void {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const i of actions) {
      i.draw(ctx);
    }
    pen.draw(ctx);
  }
}
// --------------------------------------------------------------------------------------------------------
// Establishing arrays for storing lines
// --------------------------------------------------------------------------------------------------------
let actions: action[] = [];
let undoneActions: action[] = [];
let currentAction: action = new drag(currentThickness, currentColor);

// --------------------------------------------------------------------------------------------------------
// Triggers for drawing and updating canvas
// --------------------------------------------------------------------------------------------------------
canvas.addEventListener("tool-changed", function () {
  if (currentAction instanceof stamp) {
    currentAction.emoji = pen.currentStamp;

    currentAction.size = currentThickness;
  } else if (currentAction instanceof drag) {
    currentAction.thickness = currentThickness;
    currentAction.color = currentColor;
  }
  drawCanvas();
});

canvas.addEventListener("mouseout", () => {
  pen.previewActive = false;
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mouseenter", (e) => {
  pen.previewActive = true;
  pen.updatePosition(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mousedown", (e) => {
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  pen.penDown = true;
  if (currentAction instanceof stamp) {
    currentAction.x = pen.x;
    currentAction.y = pen.y;
  }
  actions.push(currentAction);
});

canvas.addEventListener("mouseup", (e) => {
  pen.penDown = false;
  if (currentAction instanceof drag) {
    if (currentAction.lines.length == 0) {
      actions.pop();
    } else {
      currentAction = new drag(currentThickness, currentColor);
    }
  } else if (currentAction instanceof stamp) {
    if (ctx) {
      pen.updatePosition(e.offsetX, e.offsetY);

      ctx.font = `${7 * currentThickness}px monospace`;
      const metrics = ctx.measureText(pen.currentStamp);
      const textWidth = metrics.width;
      const textHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      // Calculate position to draw text centered on the mouse
      const x = pen.x - textWidth / 2;
      const y = pen.y + textHeight / 2;

      currentAction.x = x;
      currentAction.y = y;
    }

    currentAction = new stamp(pen.currentStamp, currentThickness, pen.x, pen.y);
  }
  canvas.dispatchEvent(canvasUpdate);
});

canvas.addEventListener("mousemove", (e) => {
  if (pen.penDown) {
    if (currentAction instanceof drag) {
      const start: point = { x: pen.x, y: pen.y };
      const end: point = { x: e.offsetX, y: e.offsetY };
      const newLine: line = { start, end };
      currentAction.addLine(newLine);
      pen.updatePosition(e.offsetX, e.offsetY);
      undoneActions.length = 0;
      canvas.dispatchEvent(canvasUpdate);
    } else if (currentAction instanceof stamp) {
      if (ctx) {
        pen.updatePosition(e.offsetX, e.offsetY);

        ctx.font = `${7 * currentThickness}px monospace`;
        const metrics = ctx.measureText(pen.currentStamp);
        const textWidth = metrics.width;
        const textHeight =
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        // Calculate position to draw text centered on the mouse
        const x = pen.x - textWidth / 2;
        const y = pen.y + textHeight / 2;

        currentAction.x = x;
        currentAction.y = y;
      }
    }
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
  currentAction = new drag(currentThickness, currentColor);
  if (ctx) {
    wash(canvas, ctx);
  }
  actions = [];
  undoneActions = [];
}
function undo(): void {
  const undoneDrag: action | undefined = actions.pop();
  if (undoneDrag) {
    undoneActions.push(undoneDrag);
  }
  canvas.dispatchEvent(canvasUpdate);
}
function redo(): void {
  const redoneDrag: action | undefined = undoneActions.pop();
  if (redoneDrag) {
    actions.push(redoneDrag);
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
const _penMode = createButton("Pen Mode", app, () => {
  if (currentAction instanceof stamp) {
    currentAction = new drag(currentThickness, currentColor);
  }
});
const _stampMode = createButton("Stamp Mode", app, () => {
  if (currentAction instanceof drag) {
    currentAction = new stamp(pen.currentStamp, currentThickness, 0, 0);
  }
});

const colorPicker = addColorPicker(app);
colorPicker.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  currentColor = target.value;
  canvas.dispatchEvent(toolChanged);
  // Set Pen mode
});

const thicknessSlider = addThicknessSlider(app);
thicknessSlider.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  currentThickness = +target.value; // Convert string to number
  canvas.dispatchEvent(toolChanged);
});

// emoji buttons
const startingEmojis: string[] = ["😂", "🚀", "🎲"];
const emojiButtons: HTMLElement[] = [];
for (const emoji of startingEmojis) {
  emojiButtons.push(
    createButton(emoji, app, () => {
      pen.currentStamp = emoji;
      if (currentAction instanceof drag) {
        currentAction = new stamp(emoji, currentThickness, 0, 0);
      }
      canvas.dispatchEvent(toolChanged);
    })
  );
}

const _newstamp = createButton("new stamp", app, () => {
  // prompt player for new emoji
  // make sure emoji doesn't already have a button.
  // if it has a button do nothing.
  // if it doesnt have a button make a new button for that emoji.
  // put it between the new emoji button and the last emoji button.
  const newEmoji = prompt("Choose a new stamp");
  if (!newEmoji) {
    return;
  }
  for (const emojiButton of emojiButtons) {
    if (newEmoji == emojiButton.innerHTML) {
      return;
    }
  }
  // This proves the emoji exists and isn't already used.

  emojiButtons.push(
    createButton(newEmoji, app, () => {
      pen.currentStamp = newEmoji;
      if (currentAction instanceof drag) {
        currentAction = new stamp(newEmoji, currentThickness, 0, 0);
      }
      canvas.dispatchEvent(toolChanged);
    })
  );
});
