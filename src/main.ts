/* Containers heirachy:
body{
  app{
    title
    canvastoolcontainer{
        allToolContainer{
            PenMods{
                colors

            }
            emojiControl...
            controlContainer
        }
        canvas
    }
  }
}
*/

// --------------------------------------------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------------------------------------------

import { action, drag, line, point, stamp } from "./dataTypes.ts";
import { wash } from "./drawCommands.ts";
import { addThicknessSlider, createButton } from "./settingButtons.ts";

import "./style.css";

// --------------------------------------------------------------------------------------------------------
// Content
// --------------------------------------------------------------------------------------------------------

const APP_NAME = "Kaku";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
const titleContainer = document.createElement("div");
titleContainer.className = "title-container";
titleContainer.innerHTML = APP_NAME;
app.appendChild(titleContainer);

const canvasToolContainer = createBaseContent("tool-canvas-container", app)
const allToolContainer = createBaseContent("control-container", canvasToolContainer)
const controlContainer = createBaseContent("nested-container", allToolContainer)
const emojiControlContainer = createBaseContent("nested-container", allToolContainer)
const emojiContainer = createBaseContent("nested-container", emojiControlContainer)
const penModifiers = createBaseContent("nested-container", allToolContainer)
const colorButtonsContainer = createBaseContent("nested-container", penModifiers)

function createBaseContent(className: string, container: HTMLDivElement) {
  const element = document.createElement("div");
  element.className = className;
  container.appendChild(element)
  return element
}

// Create canvas
const canvas = document.createElement("canvas");
canvas.className = "kaku-canvas";
canvas.width = 500;
canvas.height = 500;
canvasToolContainer.appendChild(canvas);
const ctx = canvas.getContext("2d");
// Events
const canvasUpdate: Event = new Event("drawing-changed");
export const toolChanged: Event = new Event("tool-changed");

// --------------------------------------------------------------------------------------------------------
// Setting up cursor and preview
// --------------------------------------------------------------------------------------------------------

const pen = {
  currentColor: "#000000", // Default color
  currentThickness: 1,
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
      ctx.fillStyle = pen.currentColor;
      if (currentAction instanceof drag) {
        ctx.font = `${this.currentThickness * 1.7}px monospace`;

        const metrics = ctx.measureText("*");
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent +
          metrics.actualBoundingBoxDescent;

        // Calculate position to draw text centered on the mouse
        const x = this.x - textWidth / 2;
        const y = this.y + textHeight / 2;

        ctx.fillText("*", x, y);
      } else if (currentAction instanceof stamp) {
        ctx.font = `${7 * pen.currentThickness}px monospace`;
        const metrics = ctx.measureText(this.currentStamp);
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent +
          metrics.actualBoundingBoxDescent;

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
let currentAction: action = new drag(pen.currentThickness, pen.currentColor);

// --------------------------------------------------------------------------------------------------------
// Triggers for drawing and updating canvas
// --------------------------------------------------------------------------------------------------------

function stopAction(e: MouseEvent) {
  if (pen.penDown) {
    pen.penDown = false;
    if (currentAction instanceof drag) {
      if (currentAction.lines.length == 0) {
        actions.pop();
      } else {
        currentAction = new drag(pen.currentThickness, pen.currentColor);
      }
    } else if (currentAction instanceof stamp) {
      if (ctx) {
        pen.updatePosition(e.offsetX, e.offsetY);

        ctx.font = `${7 * pen.currentThickness}px monospace`;
        const metrics = ctx.measureText(pen.currentStamp);
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent +
          metrics.actualBoundingBoxDescent;

        const x = pen.x - textWidth / 2;
        const y = pen.y + textHeight / 2;

        currentAction.x = x;
        currentAction.y = y;
      }

      currentAction = new stamp(
        pen.currentStamp,
        pen.currentThickness,
        pen.x,
        pen.y,
      );
    }
    canvas.dispatchEvent(canvasUpdate);
  }
}

canvas.addEventListener("tool-changed", function () {
  if (currentAction instanceof stamp) {
    currentAction.emoji = pen.currentStamp;

    currentAction.size = pen.currentThickness;
  } else if (currentAction instanceof drag) {
    currentAction.thickness = pen.currentThickness;
    currentAction.color = pen.currentColor;
  }
  drawCanvas();
});

canvas.addEventListener("mouseout", (e) => {
  pen.previewActive = false;
  stopAction(e);
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
  currentAction.color = pen.currentColor;
  if (currentAction instanceof stamp) {
    currentAction.x = pen.x;
    currentAction.y = pen.y;
  }
  actions.push(currentAction);
});

canvas.addEventListener("mouseup", (e) => {
  stopAction(e);
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

        ctx.font = `${7 * pen.currentThickness}px monospace`;
        const metrics = ctx.measureText(pen.currentStamp);
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent +
          metrics.actualBoundingBoxDescent;

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

createButton("Clear", controlContainer, () => {
  currentAction = new drag(pen.currentThickness, pen.currentColor);
  if (ctx) {
    wash(canvas, ctx);
  }
  actions = [];
  undoneActions = [];
});

createButton("Undo", controlContainer, () => {
  const undoneDrag: action | undefined = actions.pop();
  if (undoneDrag) {
    undoneActions.push(undoneDrag);
  }
  canvas.dispatchEvent(canvasUpdate);
});

createButton("Redo", controlContainer, () => {
  const redoneDrag: action | undefined = undoneActions.pop();
  if (redoneDrag) {
    actions.push(redoneDrag);
  }
  canvas.dispatchEvent(canvasUpdate);
});

const penMode = createButton("Pen Mode", controlContainer, () => {
  if (currentAction instanceof stamp) {
    penMode.classList.toggle("active")
    stampMode.classList.toggle("active")
    currentAction = new drag(pen.currentThickness, pen.currentColor);
  }
});
penMode.classList.add("active");

const stampMode = createButton("Stamp Mode", controlContainer, () => {
  if (currentAction instanceof drag) {
    stampMode.classList.toggle("active")
    penMode.classList.toggle("active")
    currentAction = new stamp(pen.currentStamp, pen.currentThickness, 0, 0);
  }
});

export function addColorPicker(app: HTMLElement) {
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "colorPicker";
  colorPicker.value = "#000000";

  colorPicker.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    pen.currentColor = target.value;
    canvas.dispatchEvent(toolChanged);
  });

  colorPicker.addEventListener("click", (event) => {
    const target = event.target as HTMLInputElement;
    pen.currentColor = target.value;
    canvas.dispatchEvent(toolChanged);
  });
  // Insert the color picker into the DOM
  app.appendChild(colorPicker);
  return colorPicker;
}

createButton("New Color", penModifiers, () => {
  colorPickerButtons.push(addColorPicker(colorButtonsContainer));
});
const colorPickerButtons = [];

addColorPicker(colorButtonsContainer);

const thicknessSlider = addThicknessSlider(controlContainer);
thicknessSlider.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  pen.currentThickness = +target.value; // Convert string to number
  canvas.dispatchEvent(toolChanged);
});

pen.currentThickness = +thicknessSlider.value;
// emoji buttons
function createEmojiButton(emoji: string, parent: HTMLElement) {
  return createButton(emoji, parent, () => {
    pen.currentStamp = emoji;
    if (currentAction instanceof drag) {
      currentAction = new stamp(emoji, pen.currentThickness, 0, 0);
    }
    canvas.dispatchEvent(toolChanged);
  });
}

const startingEmojis: string[] = ["😂", "🚀", "🎲"];
const emojiButtons: HTMLElement[] = [];
for (const emoji of startingEmojis) {
  emojiButtons.push(createEmojiButton(emoji, emojiContainer));
}

createButton("New Stamp", emojiControlContainer, () => {
  const newEmoji = prompt("Choose a new stamp");
  if (!newEmoji) {
    return;
  }
  for (const emojiButton of emojiButtons) {
    if (newEmoji == emojiButton.innerHTML) {
      return;
    }
  }
  emojiButtons.push(createEmojiButton(newEmoji, emojiContainer));
});

createExportButton("Export with transparent background", true);
createExportButton("Export with selected color background", false);

function createExportButton(name: string, transparent: boolean) {
  createButton(
    name,
    controlContainer,
    () => {
      // Create a temporary canvas
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d")!;

      // Set the desired resolution
      tempCanvas.width = 1024;
      tempCanvas.height = 1024;

      if (ctx && !transparent) {
        ctx.fillStyle = pen.currentColor; // Set the fill color to your desired background color
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Covers the entire canvas area
      }

      // Draw the original canvas content onto the new canvas, scaling to fill the space
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

      // Create an anchor element for downloading
      const anchor = document.createElement("a");
      anchor.href = tempCanvas.toDataURL("image/png");
      anchor.download = "sketchpad_1024x1024.png";
      // Append, click, and remove the anchor
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
  );
}