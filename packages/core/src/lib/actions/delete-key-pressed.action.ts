import { DiagramEngine } from '../engine.core';
import {
  BaseModel,
  LinkModel,
  NodeModel,
  PointModel,
  PortModel,
} from '../models';
import { BaseAction } from './base.action';

export class DeleteKeyPressedAction extends BaseAction {
  deletedModels: (NodeModel | PointModel | PortModel | LinkModel)[];

  constructor(diagramEngine: DiagramEngine, event: KeyboardEvent) {
    super();

    this.deletedModels = [];
    const isNotLocked = (
      item: BaseModel
    ): item is NodeModel | PointModel | PortModel =>
      !diagramEngine.isModelLocked(item);

    this.deletedModels = diagramEngine
      .getDiagramModel()
      .getSelectedItems()
      .filter(isNotLocked);
  }
}
