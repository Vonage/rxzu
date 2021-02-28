import { BaseAction } from "./base.action";

export type BaseActionState = 'started' | 'firing' | 'stopped';
export class BaseMouseAction extends BaseAction {
  mouseX: number;
  mouseY: number;
  ms: number;

  constructor(mouseX: number, mouseY: number) {
    super();
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.ms = new Date().getTime();
  }
}
