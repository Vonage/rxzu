import { BaseAction } from './base.action';
import { DiagramModel } from '../models/diagram.model';
import { Coordinates } from '../interfaces/coords.interface.js';

export class SelectingAction extends BaseAction {
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
	}

	getBoxDimensions() {
		this.dimensions = {
			left: this.mouseX2 > this.mouseX ? this.mouseX : this.mouseX2,
			top: this.mouseY2 > this.mouseY ? this.mouseY : this.mouseY2,
			width: Math.abs(this.mouseX2 - this.mouseX),
			height: Math.abs(this.mouseY2 - this.mouseY),
			right: this.mouseX2 < this.mouseX ? this.mouseX : this.mouseX2,
			bottom: this.mouseY2 < this.mouseY ? this.mouseY : this.mouseY2
		};
		return this.dimensions;
	}

	containsElement({ x, y }: Coordinates, diagramModel: DiagramModel): boolean {
		const z = diagramModel.getZoomLevel() / 100.0;
		const dimensions = this.getBoxDimensions();

		return (
			x * z + diagramModel.getOffsetX() > dimensions.left &&
			x * z + diagramModel.getOffsetX() < dimensions.right &&
			y * z + diagramModel.getOffsetY() > dimensions.top &&
			y * z + diagramModel.getOffsetY() < dimensions.bottom
		);
	}
}
