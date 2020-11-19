import { LabelModel } from '../../models/label.model';
import { BehaviorSubject, Observable } from 'rxjs';

export class DefaultLabelModel extends LabelModel {
	private _label: BehaviorSubject<string> = new BehaviorSubject('');
	label$: Observable<string> = this._label.pipe(this.entityPipe('label'));

	constructor(label: string = 'NO LABEL', type: string = 'default', id?: string, logPrefix: string = '[DefaultLabel]') {
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
