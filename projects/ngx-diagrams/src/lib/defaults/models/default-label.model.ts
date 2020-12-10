import { Observable } from 'rxjs';
import { LabelModel } from '../../models/label.model';
import { createValueState } from '../../utils';

export class DefaultLabelModel extends LabelModel {
	protected label$ = createValueState<string>('', this.entityPipe('label'));

	constructor(label: string = 'NO LABEL', type: string = 'default', id?: string, logPrefix: string = '[DefaultLabel]') {
		super(type, id, logPrefix);
		this.setLabel(label);
	}

	setLabel(label: string) {
		this.label$.set(label).emit();
	}

	getLabel(): string {
		return this.label$.value;
	}

	selectLabel(): Observable<string> {
		return this.label$.value$;
	}
}
