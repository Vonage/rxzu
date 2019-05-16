import { BaseEntity } from '../base.entity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	createPaintedEvent,
	createParentEvent,
	createSelectionEvent,
	PaintedEvent,
	ParentChangeEvent,
	SelectionEvent
} from '../interfaces/event.interface';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {
	private readonly _type: string;
	private readonly _parent: BehaviorSubject<X> = new BehaviorSubject(null);
	private readonly _parent$: Observable<X> = this._parent.asObservable();
	private readonly _selected: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _selected$: Observable<boolean> = this._selected.asObservable();
	private readonly _painted: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _painted$: Observable<boolean> = this._painted.asObservable();

	constructor(type?: string, id?: string) {
		super(id);
		this._type = type;
	}

	getParent(): X {
		return this._parent.value;
	}

	setParent(parent: X): void {
		this._parent.next(parent);
	}

	parentChanges(): Observable<ParentChangeEvent<X>> {
		return this._parent$.pipe(map(p => createParentEvent<X>(this, p)));
	}

	getPainted(): boolean {
		return this._painted.value;
	}

	setPainted(painted: boolean = true) {
		this._painted.next(painted);
	}

	paintChanges(): Observable<PaintedEvent> {
		return this._painted$.pipe(map(p => createPaintedEvent(this, p)));
	}

	getType(): string {
		return this._type;
	}

	getSelected(): boolean {
		return this._selected.value;
	}

	selectSelected(): Observable<boolean> {
		return this._selected.asObservable();
	}

	setSelected(selected: boolean = true) {
		this._selected.next(selected);
	}

	selectionChanges(): Observable<SelectionEvent> {
		return this._selected$.pipe(map(s => createSelectionEvent(this, s)));
	}

	getSelectedEntities(): BaseModel[] {
		return this._selected.value ? [this] : [];
	}

	public remove() {
		this.destroy();
	}
}
