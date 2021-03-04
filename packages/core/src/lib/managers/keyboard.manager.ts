import { BehaviorSubject } from 'rxjs';
import { CopyAction } from '../actions/copy.action';
import { DeleteKeyPressed } from '../actions/delete-key-pressed.action';
import { PasteAction } from '../actions/paste.action';
import { DiagramEngineCore } from '../engine.core';
import { NodeModel, PointModel, PortModel, LinkModel } from '../models';

export class KeyboardManager {
  protected engine: DiagramEngineCore;
  protected clipboard$: BehaviorSubject<(NodeModel | PointModel | PortModel | LinkModel)[]>;

  constructor(_diagramEngine: DiagramEngineCore) {
    this.engine = _diagramEngine;
    this.clipboard$ = new BehaviorSubject<(NodeModel | PointModel | PortModel | LinkModel)[]>([]);
  }

  onKeyUp(event: KeyboardEvent) {
      const deleteKeyPressedAction = new DeleteKeyPressed(this.engine, event);
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
    const pasteAction = new PasteAction(this.clipboard$.getValue());
    this.engine.startFiringAction(pasteAction);
    this.engine.fireAction();
    this.engine.stopFiringAction();
  }

  dispose() {
    this.clipboard$.complete();
  }
}
