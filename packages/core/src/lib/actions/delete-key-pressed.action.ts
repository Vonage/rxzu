import { DiagramEngineCore } from '../engine.core';
import { LinkModel, NodeModel, PointModel, PortModel } from '../models';
import { BaseAction } from './base.action';

export class DeleteKeyPressed extends BaseAction {
  deletedModels: (NodeModel | PointModel | PortModel | LinkModel)[];

  constructor(diagramEngine: DiagramEngineCore, keyCode: number) {
    super();
    this.deletedModels = [];
    const keyCodes = [46, 8];

    if (keyCodes.indexOf(keyCode) !== -1) {
      const isNotLocked = (
        item: NodeModel | PointModel | PortModel | LinkModel
      ): item is NodeModel | PointModel | PortModel =>
        !diagramEngine.isModelLocked(item);

      this.deletedModels = diagramEngine
        .getDiagramModel()
        .getSelectedItems()
        .filter(isNotLocked);

    }
  }
}
