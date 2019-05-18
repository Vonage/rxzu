import { BaseEntity } from '../base.entity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { PaintedEvent, ParentChangeEvent, SelectionEvent } from '../interfaces/event.interface';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {
	private readonly _type: string;
	private readonly _parent: BehaviorSubject<X> = new BehaviorSubject(null);
	private readonly _parent$: Observable<X> = this._parent.asObservable();
	private readonly _selected: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _selected$: Observable<boolean> = this._selected.asObservable();
	private readonly _painted: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private readonly _painted$: Observable<boolean> = this._painted.asObservable();

	constructor(type?: string, id?: string, logPrefix = '[Base]') {
		super(id, logPrefix);
		this._type = type;
	}

	getParent(): X {
		return this._parent.getValue();
	}

	setParent(parent: X): void {
		this._parent.next(parent);
	}

	parentChanges(): Observable<ParentChangeEvent<X>> {
		return this._parent$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(p => new ParentChangeEvent<X>(this, p))
		);
	}

	getPainted(): boolean {
		return this._painted.getValue();
	}

	setPainted(painted: boolean = true) {
		this._painted.next(painted);
	}

	paintChanges(): Observable<PaintedEvent> {
		return this._painted$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(p => new PaintedEvent(this, p))
		);
	}

	getType(): string {
		return this._type;
	}

	getSelected(): boolean {
		return this._selected.getValue();
	}

	selectSelected(): Observable<boolean> {
		return this._selected.asObservable();
	}

	setSelected(selected: boolean = true) {
		this._selected.next(selected);
	}

	selectionChanges(): Observable<SelectionEvent> {
		return this._selected$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(s => new SelectionEvent(this, s)),
			this.withLog('selectionChanges')
		);
	}

	getSelectedEntities(): BaseModel[] {
		return this._selected.value ? [this] : [];
	}
}
