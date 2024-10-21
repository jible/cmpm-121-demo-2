import { drawLine } from "./drawCommands.ts";
export interface point {
  x: number;
  y: number;
}
export interface line {
  start: point;
  end: point;
}
export class drag {
  lines: line[] = [];
  thickness: number = 1;
  color: string = "";
  constructor(thick: number, color: string) {
    this.thickness = thick;
    this.color = color;
  }
  addLine(newLine: line) {
    this.lines.push(newLine);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const segment of this.lines) {
      drawLine(ctx, segment, this.color, this.thickness);
    }
  }
}

export class stamp {
  emoji: string = "😂";
  color: string = '#000000';
  size: number = 1;
  x: number = 0;
  y: number = 0;
  constructor(_emoji: string, _size: number, _x: number, _y: number) {}
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.font = `${this.size * 7}px monospace`;
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

export interface action {
  draw(ctx: CanvasRenderingContext2D): void;
  color:string;
}
