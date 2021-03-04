import { BaseMouseAction } from './base-mouse.action';
import { DiagramModel } from '../models/diagram.model';

export class MoveCanvasAction extends BaseMouseAction {
  initialOffsetX: number;
  initialOffsetY: number;

  constructor(mouseX: number, mouseY: number, diagramModel: DiagramModel) {
    super(mouseX, mouseY);
    this.initialOffsetX = diagramModel.getOffsetX();
    this.initialOffsetY = diagramModel.getOffsetY();
  }
}
