import { BaseEntity } from '../base.entity';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {
	private type: string;
	private selected$: BehaviorSubject<boolean>;
	private parent$: BehaviorSubject<X>;
	private painted$: BehaviorSubject<boolean>;
	private destroyed$: ReplaySubject<boolean>;

	constructor(type?: string, id?: string) {
		super(id);
		this.type = type;
		this.selected$ = new BehaviorSubject(false);
		this.painted$ = new BehaviorSubject(false);
		this.parent$ = new BehaviorSubject(null);
		this.destroyed$ = new ReplaySubject(0);
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

	isDestroyed() {
		return this.destroyed$.asObservable();
	}

	public remove() {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}
}
