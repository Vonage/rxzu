import { BaseMouseAction } from './base-mouse.action';
import { DiagramModel } from '../models/diagram.model';

export class SelectingAction extends BaseMouseAction {
  mouseX2: number;
  mouseY2: number;

  dimensions: {
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  };

  constructor(mouseX: number, mouseY: number) {
    super(mouseX, mouseY);
    this.mouseX2 = mouseX;
    this.mouseY2 = mouseY;
    this.dimensions = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      right: 0,
      bottom: 0,
    };
  }

  getBoxDimensions() {
    this.dimensions = {
      left: this.mouseX2 > this.mouseX ? this.mouseX : this.mouseX2,
      top: this.mouseY2 > this.mouseY ? this.mouseY : this.mouseY2,
      width: Math.abs(this.mouseX2 - this.mouseX),
      height: Math.abs(this.mouseY2 - this.mouseY),
      right: this.mouseX2 < this.mouseX ? this.mouseX : this.mouseX2,
      bottom: this.mouseY2 < this.mouseY ? this.mouseY : this.mouseY2,
    };
    return this.dimensions;
  }

  containsElement(
    topLeftPoint: { x: number; y: number },
    bottomRightPoint: { x: number; y: number },
    diagramModel: DiagramModel
  ): boolean {
    const z = diagramModel.getZoomLevel() / 100.0;
    const dimensions = this.getBoxDimensions();

    // check if box contain top left point
    const isContainsTopLeftPoint =
      topLeftPoint.x * z + diagramModel.getOffsetX() > dimensions.left &&
      topLeftPoint.x * z + diagramModel.getOffsetX() < dimensions.right &&
      topLeftPoint.y * z + diagramModel.getOffsetY() > dimensions.top &&
      topLeftPoint.y * z + diagramModel.getOffsetY() < dimensions.bottom;

    // check if box contain bottom right point
    const isContainBottomRightPoint =
      bottomRightPoint.x * z + diagramModel.getOffsetX() > dimensions.left &&
      bottomRightPoint.x * z + diagramModel.getOffsetX() < dimensions.right &&
      bottomRightPoint.y * z + diagramModel.getOffsetY() > dimensions.top &&
      bottomRightPoint.y * z + diagramModel.getOffsetY() < dimensions.bottom;

    // only if box contains both top left and bottom right points, the element is contains in the box
    return isContainsTopLeftPoint && isContainBottomRightPoint;
  }
}
