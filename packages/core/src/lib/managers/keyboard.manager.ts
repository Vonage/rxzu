import { BehaviorSubject } from 'rxjs';
import { CopyAction } from '../actions/copy.action';
import { DeleteKeyPressedAction } from '../actions/delete-key-pressed.action';
import { PasteAction } from '../actions/paste.action';
import { DiagramEngine } from '../engine.core';
import { NodeModel, PointModel, PortModel, LinkModel } from '../models';

export class KeyboardManager {
  protected engine: DiagramEngine;
  protected clipboard$: BehaviorSubject<
    (NodeModel | PointModel | PortModel | LinkModel)[]
  >;

  constructor(_diagramEngine: DiagramEngine) {
    this.engine = _diagramEngine;
    this.clipboard$ = new BehaviorSubject<
      (NodeModel | PointModel | PortModel | LinkModel)[]
    >([]);
  }

  get actionsManager() {
    return this.engine.getActionsManager();
  }

  onKeyUp(event: KeyboardEvent) {
    const deleteKeyPressedAction = new DeleteKeyPressedAction(
      this.engine,
      event
    );
    this.actionsManager.startFiringAction(deleteKeyPressedAction);
    this.actionsManager.fireAction();
    this.actionsManager.stopFiringAction();
  }

  onCopy() {
    const copyAction = new CopyAction(this.engine);
    this.clipboard$.next(copyAction.copiedModels);
    this.actionsManager.startFiringAction(copyAction);
    this.actionsManager.fireAction();
    this.actionsManager.stopFiringAction();
  }

  onPaste() {
    const pasteAction = new PasteAction(this.clipboard$.getValue());
    this.actionsManager.startFiringAction(pasteAction);
    this.actionsManager.fireAction();
    this.actionsManager.stopFiringAction();
  }

  dispose() {
    this.clipboard$.complete();
  }
}
