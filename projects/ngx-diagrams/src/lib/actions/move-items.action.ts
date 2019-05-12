import { BaseAction } from './base.action';
import { PointModel } from '../models/point.model';
import { NodeModel } from '../models/node.model';
import { DiagramEngine } from '../services/engine.service';
import { SelectionModel } from '../models/move-selection.model';
import { LinkModel } from '../models/link.model';

export class MoveItemsAction extends BaseAction {
	selectionModels: SelectionModel[];
	moved: boolean;

	constructor(mouseX: number, mouseY: number, diagramEngine: DiagramEngine) {
		super(mouseX, mouseY);
		this.moved = false;
		let selectedItems = diagramEngine.getDiagramModel().getSelectedItems();

		// dont allow items which are locked to move and links which generate their position based on points.
		selectedItems = selectedItems.filter(item => {
			return !diagramEngine.isModelLocked(item) && !(item instanceof LinkModel);
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
