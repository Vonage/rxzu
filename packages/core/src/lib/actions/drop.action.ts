import { SelectionModel } from '../interfaces/move-selection.interface';
import { BaseAction } from './base.action';

export class DropAction extends BaseAction {
  mouseEvent: MouseEvent;
  selection: SelectionModel[];

  constructor(event: MouseEvent, selection: SelectionModel[] = []) {
    super();
    this.mouseEvent = event;
    this.selection = selection;
  }
}
