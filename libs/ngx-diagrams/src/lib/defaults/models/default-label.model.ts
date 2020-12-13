import { BehaviorSubject, Observable } from 'rxjs';
import { LabelModel } from '../../models/label.model';

export class DefaultLabelModel extends LabelModel {
  protected _label = new BehaviorSubject('');

  label$ = this._label.pipe(this.entityPipe('label'));

  constructor(
    label = 'NO LABEL',
    type = 'default',
    id?: string,
    logPrefix = '[DefaultLabel]'
  ) {
    super(type, id, logPrefix);
    this.setLabel(label);
  }

  setLabel(label: string) {
    this._label.next(label);
  }

  getLabel(): string {
    return this._label.getValue();
  }

  selectLabel(): Observable<string> {
    return this.label$;
  }
}
