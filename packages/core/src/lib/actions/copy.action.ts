import { DiagramEngine } from '../engine.core';
import {
  BaseModel,
  LinkModel,
  NodeModel,
  PointModel,
  PortModel,
} from '../models';
import { BaseAction } from './base.action';

export class CopyAction extends BaseAction {
  copiedModels: (NodeModel | PointModel | PortModel | LinkModel)[];

  constructor(diagramEngine: DiagramEngine) {
    super();
    const isNotLocked = (
      item: BaseModel
    ): item is NodeModel | PointModel | PortModel =>
      !diagramEngine.isModelLocked(item);

    this.copiedModels = diagramEngine
      .getDiagramModel()
      .getSelectedItems()
      .filter(isNotLocked);
  }

}
