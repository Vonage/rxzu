import { DiagramEngineCore } from '../engine.core';
import { LinkModel, NodeModel, PointModel, PortModel } from '../models';
import { BaseAction } from './base.action';

export class DeleteKeyPressed extends BaseAction {
  deletedModels: (NodeModel | PointModel | PortModel | LinkModel)[];

  constructor(diagramEngine: DiagramEngineCore, event: KeyboardEvent) {
    super();

    this.deletedModels = [];
    const options = diagramEngine.getDiagramModel().getKeyBindings().delete;
    const keyCodes = options?.keyCodes || [46, 8];
    const modifiers = {
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ...options?.modifiers
    };

    if (keyCodes.indexOf(event.keyCode) !== -1 &&
      (event.ctrlKey === modifiers.ctrlKey) &&
      (event.shiftKey === modifiers.shiftKey) &&
      (event.altKey === modifiers.altKey) &&
      (event.metaKey === modifiers.metaKey)) {

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
