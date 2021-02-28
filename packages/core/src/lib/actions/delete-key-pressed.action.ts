import { DiagramEngineCore } from '../engine.core';
import { LinkModel, NodeModel, PointModel, PortModel } from '../models';
import { BaseAction } from './base.action';

export class DeleteKeyPressed extends BaseAction {
  deletedModels: (NodeModel | PointModel | PortModel | LinkModel)[];

  constructor(diagramEngine: DiagramEngineCore) {
    super();
    const isNotLocked = (
      item: NodeModel | PointModel | PortModel | LinkModel
    ): item is NodeModel | PointModel | PortModel =>
      !diagramEngine.isModelLocked(item);

    this.deletedModels = diagramEngine
      .getDiagramModel()
      .getSelectedItems()
      .filter(isNotLocked);

    this.deletedModels.forEach(model => {
      model.destroy();
    })

  }


}
