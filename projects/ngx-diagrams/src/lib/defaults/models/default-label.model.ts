import { LabelModel } from '../../models/label.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, takeUntil } from 'rxjs/operators';

export class DefaultLabelModel extends LabelModel {
	private _label: BehaviorSubject<string> = new BehaviorSubject('');
	label$: Observable<string> = this._label.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));

	constructor(label: string = 'NO LABEL', type: string = 'default') {
		super(type);
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
