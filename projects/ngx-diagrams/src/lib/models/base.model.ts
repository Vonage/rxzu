import { BaseEntity, BaseEvent, createBaseEvent } from '../base.entity';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

export type ParentChangeEvent<T = BaseModel, P extends BaseModel = BaseModel> = BaseEvent<T> & {
	parent: P;
};
export type SelectionEvent<T = BaseModel> = BaseEvent<T> & { isSelected: boolean };
export type PaintedEvent<T = BaseModel> = BaseEvent<T> & { isPainted: boolean };

export function createParentEvent<T extends BaseModel = BaseModel, P extends BaseModel = BaseModel>(
	thisArg: T,
	parent: P
): ParentChangeEvent<T, P> {
	return {
		...createBaseEvent<T>(this),
		parent
	};
}
export function createSelectionEvent<T extends BaseModel = BaseModel>(thisArg: T, isSelected: boolean): SelectionEvent<T> {
	return {
		...createBaseEvent<T>(this),
		isSelected
	};
}
export function createPaintedEvent<T extends BaseModel = BaseModel>(thisArg: T, painted: boolean): PaintedEvent<T> {
	return {
		...createBaseEvent<T>(this),
		isPainted: painted
	};
}

export class BaseModel<X extends BaseModel = BaseModel> extends BaseEntity {
	private readonly _type: string;
	private readonly _parent: BehaviorSubject<X>;
	private readonly _parent$: Observable<X> = this._parent.asObservable();
	private readonly _selected: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _selected$: Observable<boolean> = this._selected.asObservable();
	private readonly _painted: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _painted$: Observable<boolean> = this._painted.asObservable();
	private readonly _removed: Subject<boolean> = new Subject();
	private readonly _removed$: Observable<boolean> = this._removed.asObservable();

	constructor(type?: string, id?: string) {
		super(id);
		this._type = type;
	}

	get locked() {
		return super.locked || this.parent.locked;
	}
	get parent(): X {
		return this._parent.value;
	}

	set parent(parent: X) {
		this._parent.next(parent);
	}

	parentChanges(): Observable<ParentChangeEvent> {
		this._parent$.pipe(map(p => createParentEvent<X>(this, p)));
	}

	get painted(): boolean {
		return this._painted.value;
	}

	set painted(painted: boolean = true) {
		this._painted.next(painted);
	}

	paintChanges(): Observable<PaintedEvent> {
		return this._painted$.pipe(map(p => createPaintedEvent(this, p)));
	}

	get type(): string {
		return this._type;
	}

	get selected(): boolean {
		return this._selected.value;
	}

	set selected(selected: boolean = true) {
		this._selected.next(selected);
	}

	selectionChanges(): Observable<SelectionEvent> {
		return this._selected$.pipe(map(s => createSelectionEvent(this, s)));
	}

	getSelectedEntities(): BaseModel<X>[] {
		return this._selected.value ? [this] : [];
	}

	get removed$(): Observable<boolean> {
		return this._removed$;
	}

	set removed(val: boolean) {
		this._removed.next(val);
	}
}
