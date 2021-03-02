import { CopyAction } from '../actions/copy.action';
import { DeleteKeyPressed } from '../actions/delete-key-pressed.action';
import { PasteAction } from '../actions/paste.action';
import { DiagramEngineCore } from '../engine.core';
import { NodeModel, PointModel, PortModel, LinkModel } from '../models';

export class KeyboardManager {
  protected engine: DiagramEngineCore;
  clipboard: (NodeModel | PointModel | PortModel | LinkModel)[]

  constructor(_diagramEngine: DiagramEngineCore) {
    this.engine = _diagramEngine;
    this.clipboard = []
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 8 || event.keyCode === 46) {
      const deleteKeyPressedAction = new DeleteKeyPressed(this.engine);
      this.engine.startFiringAction(deleteKeyPressedAction);
    }
  }

  onCopy() {
    const copyAction = new CopyAction(this.engine);
    this.clipboard = copyAction.copiedModels;
    this.engine.startFiringAction(copyAction);
  }

  onPaste() {
    const pasteAction = new PasteAction(this.clipboard);
    this.engine.startFiringAction(pasteAction);
  }
}
