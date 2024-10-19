import { drawLine } from "./drawCommands.ts";
export interface point {
  x: number;
  y: number;
}
export interface line {
  start: point;
  end: point;
}
export interface drag {
  lines: line[];
  thickness: number;
  color: string;
}
export function addLine(arg: drag, newLine: line) {
  arg.lines.push(newLine);
}
export function drawDrag(arg: drag, ctx: CanvasRenderingContext2D) {
  for (const segment of arg.lines) {
    drawLine(ctx, segment, arg.color, arg.thickness);
  }
}
