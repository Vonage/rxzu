import { DeleteKeyPressed } from '../actions/delete-key-pressed.action';
import { DiagramEngineCore } from '../engine.core';

export class KeyboardManager {
  protected engine: DiagramEngineCore;

  constructor(_diagramEngine: DiagramEngineCore) {
    this.engine = _diagramEngine;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 8 || event.keyCode === 46) {
      const deleteKeyPressedAction = new DeleteKeyPressed(this.engine);
      this.engine.startFiringAction(deleteKeyPressedAction);
    }
  }


}
