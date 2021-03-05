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
    const options = diagramEngine.getDiagramModel().getKeyBindings().delete;
    const keyCodes = options?.keyCodes || [46, 8];
    const modifiers = {
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ...options?.modifiers,
    };

    const code = Number(event.code);

    if (
      keyCodes.indexOf(code) !== -1 &&
      event.ctrlKey === modifiers.ctrlKey &&
      event.shiftKey === modifiers.shiftKey &&
      event.altKey === modifiers.altKey &&
      event.metaKey === modifiers.metaKey
    ) {
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
}
