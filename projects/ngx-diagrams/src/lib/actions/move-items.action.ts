import { BaseAction } from './base.action';
import { PointModel } from '../models/point.model';
import { NodeModel } from '../models/node.model';
import { DiagramEngine } from '../services/engine.service';
import { SelectionModel } from '../models/move-selection.model';

export class MoveItemsAction extends BaseAction {
	selectionModels: SelectionModel[];
	moved: boolean;

	constructor(mouseX: number, mouseY: number, diagramEngine: DiagramEngine) {
		super(mouseX, mouseY);
		this.moved = false;
		diagramEngine.getDiagramModel().getSelectedItems();
		let selectedItems = diagramEngine.getDiagramModel().getSelectedItems();

		// dont allow items which are locked to move
		selectedItems = selectedItems.filter(item => {
			return !diagramEngine.isModelLocked(item);
		});

		this.selectionModels = selectedItems.map((item: PointModel | NodeModel) => {
			return {
				model: item,
				initialX: item.getX(),
				initialY: item.getY()
			};
		});
	}
}
