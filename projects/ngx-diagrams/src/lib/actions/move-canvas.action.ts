import { BaseAction } from './base.action';
import { DiagramModel } from '../models/diagram.model';

export class MoveCanvasAction extends BaseAction {
	initialOffsetX: number;
	initialOffsetY: number;

	constructor(mouseX: number, mouseY: number, diagramModel: DiagramModel<any>) {
		super(mouseX, mouseY);
		const {
			offset: { x: offsetX, y: offsetY }
		} = diagramModel.get();
		this.initialOffsetX = offsetX;
		this.initialOffsetY = offsetY;
	}
}
