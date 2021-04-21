import { BaseAction, SelectionModel } from '@rxzu/core';

export class DropAction extends BaseAction {
  mouseEvent: MouseEvent;
  selection: SelectionModel[];

  constructor(event: MouseEvent, selection: SelectionModel[] = []) {
    super();
    this.mouseEvent = event;
    this.selection = selection;
  }
}
