import { line } from "./dataTypes.ts";

export function wash(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  stroke: line,
  color: string,
  thickness: number,
) {
  ctx.beginPath();
  ctx.moveTo(stroke.start.x, stroke.start.y);
  ctx.lineTo(stroke.end.x, stroke.end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
}
