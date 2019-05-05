import { BaseEntity } from '../base.entity';
import { BehaviorSubject } from 'rxjs';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {
	private type: string;
	private selected$: BehaviorSubject<boolean>;
	private parent$: BehaviorSubject<X>;
	private painted$: BehaviorSubject<boolean>;

	constructor(type?: string, id?: string) {
		super(id);
		this.type = type;
		this.selected$ = new BehaviorSubject(false);
		this.painted$ = new BehaviorSubject(false);
		this.parent$ = new BehaviorSubject(null);
	}

	selectParent() {
		return this.parent$.asObservable();
	}

	getParent() {
		return this.parent$.getValue();
	}

	setParent(parent: X) {
		this.parent$.next(parent);
	}

	getSelectedEntities(): BaseModel<X>[] {
		return this.selected$.getValue() ? [this] : [];
	}

	isPainted() {
		return this.painted$.getValue();
	}

	setPainted(painted: boolean = true) {
		this.painted$.next(painted);
	}

	getType() {
		return this.type;
	}

	getID() {
		return this.id;
	}

	isSelected() {
		return this.selected$.getValue();
	}

	setSelected(selected: boolean = true) {
		this.selected$.next(selected);
	}

	public remove() {
		// TODO: event bus?
		// https://github.com/projectstorm/react-diagrams/blob/master/src/models/BaseModel.ts#L79-L83
	}
}
