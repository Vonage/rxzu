import { BaseAction } from './base.action';
import { PointModel } from '../models/point.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models/link.model';
import { DiagramEngineCore } from '../engine.core';
import { SelectionModel } from '../interfaces/move-selection.interface';

export class MoveItemsAction extends BaseAction {
  selectionModels: SelectionModel[];
  moved: boolean;

  constructor(mouseX: number, mouseY: number, diagramEngine: DiagramEngineCore) {
    super(mouseX, mouseY);
    this.moved = false;
    let selectedItems = diagramEngine.getDiagramModel().getSelectedItems();

    // dont allow items which are locked to move and links which generate their position based on points.
    selectedItems = selectedItems.filter((item) => {
      return !diagramEngine.isModelLocked(item) && !(item instanceof LinkModel);
    });

    this.selectionModels = selectedItems.map((item: PointModel | NodeModel) => {
      const { x: initialX, y: initialY } = item.getCoords();
      return {
        model: item,
        initialX,
        initialY
      };
    });
  }
}
