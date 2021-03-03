import { BehaviorSubject } from 'rxjs';
import { CopyAction } from '../actions/copy.action';
import { DeleteKeyPressed } from '../actions/delete-key-pressed.action';
import { PasteAction } from '../actions/paste.action';
import { DiagramEngineCore } from '../engine.core';
import { NodeModel, PointModel, PortModel, LinkModel } from '../models';

export class KeyboardManager {
  protected engine: DiagramEngineCore;
  clipboard$ = new BehaviorSubject<(NodeModel | PointModel | PortModel | LinkModel)[]>([]);

  constructor(_diagramEngine: DiagramEngineCore) {
    this.engine = _diagramEngine;
  }

  onKeyDown(event: KeyboardEvent) {
      const deleteKeyPressedAction = new DeleteKeyPressed(this.engine, event.keyCode);
      this.engine.startFiringAction(deleteKeyPressedAction);
      this.engine.fireAction();
      this.engine.stopFiringAction();
  }

  onCopy() {
    const copyAction = new CopyAction(this.engine);
    this.clipboard$.next(copyAction.copiedModels);
    this.engine.startFiringAction(copyAction);
    this.engine.fireAction();
    this.engine.stopFiringAction();
  }

  onPaste() {
    const pasteAction = new PasteAction(this.clipboard$.value);
    this.engine.startFiringAction(pasteAction);
    this.engine.fireAction();
    this.engine.stopFiringAction();
  }
}
