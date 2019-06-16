import {
	arrayCoerece,
	createEvent,
	isArray,
	isFunction,
	isObject,
	log as _log,
	LOG_LEVEL,
	mapToArray,
	projectorCoerce,
	UID,
	withLog as _withLog
} from './utils/tool-kit.util';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, mapTo, takeUntil } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { ID, IDS, UpdateStateCallback } from './interfaces/types';
import { BaseEvent } from './interfaces/event.interface';

export type EntityState<S> = S & {
	locked: boolean;
};

export class BaseEntity<S> {
	/**
	 * a prefix to make logs easier
	 * TODO: replace with redux devtools
	 * @internal
	 */
	private _logPrefix;
	private _id: ID;
	private _listeners: { [name: string]: Subscription } = {};
	private state$: BehaviorSubject<Readonly<EntityState<S>>>;
	private destroyed: Subject<void> = new Subject();

	log = (message: string, ...args: any): void => _log(`${this._logPrefix} ${message}: `, LOG_LEVEL.LOG, ...args);

	constructor(id?: ID, initialState?: Partial<EntityState<S>>, logPrefix = '') {
		this.onInit(id, initialState, logPrefix);
	}

	onInit(id?: ID, initialState?: Partial<EntityState<S>>, logPrefix = ''): void {
		this._id = id || UID();
		this._logPrefix = `${logPrefix}`;
		this.update({ locked: false, ...initialState });
	}

	private _addListeners(listeners: { [name: string]: Subscription }): void {
		this._listeners = {
			...this._listeners,
			...listeners
		};
	}
	private _select<R>(project: (store: EntityState<S>) => R): Observable<R> {
		return this.state$.asObservable().pipe(
			takeUntil(this.destroyed),
			map(project),
			distinctUntilChanged()
		);
	}

	private _set(newStateFn: (state: Readonly<EntityState<S>>) => EntityState<S>) {
		this.state$
			? this.state$.next(newStateFn(this.get()))
			: (this.state$ = new BehaviorSubject<Readonly<EntityState<S>>>(newStateFn({} as Readonly<EntityState<S>>)));
	}

	get id(): ID {
		return this._id;
	}

	get<K extends keyof EntityState<S>>(key: K): EntityState<S>[K];
	get<R>(project: UpdateStateCallback<EntityState<S>, R>): R;
	get(): EntityState<S>;
	get<R>(project?: UpdateStateCallback<EntityState<S>, R> | keyof EntityState<S>): R | EntityState<S> {
		return projectorCoerce(project)(this.state$.getValue());
	}

	select<K extends keyof EntityState<S>>(key: K): Observable<EntityState<S>[K]>;
	select<R>(project: UpdateStateCallback<EntityState<S>, R>): Observable<R>;
	select(): Observable<EntityState<S>>;
	select<R>(project?: UpdateStateCallback<EntityState<S>, R> | keyof EntityState<S>): Observable<R | EntityState<S>> {
		return this._select<R>(projectorCoerce(project));
	}

	update(cb: UpdateStateCallback<EntityState<S>>);
	update(state: Partial<EntityState<S>>);
	update(stateOrCb: Partial<EntityState<S>> | UpdateStateCallback<EntityState<S>>): void {
		const oldState = this.state$ ? this.state$.getValue() : ({} as Readonly<EntityState<S>>);
		let newState;
		if (isFunction(stateOrCb)) {
			newState = stateOrCb(oldState);
		} else if (isObject(stateOrCb)) {
			newState = stateOrCb;
		} else {
			throw Error(`only callback or partial state allowed`);
		}
		this._set(s => ({ ...s, ...newState }));
	}

	getByIds<X extends BaseEntity<any>, K extends keyof EntityState<S> = any>(key: K, ids?: IDS): X[];
	getByIds<X extends BaseEntity<any>, R = any>(project: UpdateStateCallback<EntityState<S>, R>, ids?: IDS): X[];
	getByIds<X extends BaseEntity<any>, R = any>(project: UpdateStateCallback<EntityState<S>, R> | keyof EntityState<S>, ids?: IDS): X[] {
		const val = projectorCoerce(project)(this.state$.getValue());
		if (isArray<X>(val)) {
			return val.filter(e => !ids || arrayCoerece(ids).includes(e.id));
		} else if (isObject(val)) {
			return mapToArray<X>(val as any).filter(e => !ids || arrayCoerece(ids).includes(e.id));
		}
		console.log('this property is not an array nor an object');
		return [];
	}

	selectByIds<X extends BaseEntity<any>, K extends keyof EntityState<S>>(key: K, ids?: IDS): Observable<X[]>;
	selectByIds<X extends BaseEntity<any>, R = any>(project: UpdateStateCallback<EntityState<S>, R>, ids?: IDS): Observable<X[]>;
	selectByIds<X extends BaseEntity<any>, R = any>(
		project: UpdateStateCallback<EntityState<S>, R> | keyof EntityState<S>,
		ids?: IDS
	): Observable<X[]> {
		return this.select(project as UpdateStateCallback<S, R>).pipe(
			map(entities => {
				if (isArray<X>(entities)) {
					return entities.filter(e => !ids || arrayCoerece(ids).includes(e.id));
				} else if (isObject(entities)) {
					return mapToArray<X>(entities as any).filter(e => !ids || arrayCoerece(ids).includes(e.id));
				}
			})
		);
	}

	doClone(lookupTable: { [s: string]: any } = {}, clone: any) {
		/*noop*/
	}

	clone(lookupTable: { [s: string]: any } = {}) {
		// try and use an existing clone first
		if (lookupTable[this.id]) {
			return lookupTable[this.id];
		}
		const clone = this.constructor.prototype.constructor(this.id, this.get());
		lookupTable[this.id] = clone;

		this.doClone(lookupTable, clone);
		return clone;
	}

	isLocked(): boolean {
		return this.get('locked');
	}

	lock(): void {
		this.update(s => ({ ...s, locked: true }));
	}

	unlock(): void {
		this.update(s => ({ ...s, locked: false }));
	}

	destroy() {
		this.log(`entity ${this.id} destroyed`);
		this.destroyed.next();
		this.destroyed.complete();
	}

	onDestroy(): Observable<BaseEvent> {
		return this.destroyed.pipe(mapTo(createEvent(this.id, this.get())));
	}

	onLockChange(): Observable<BaseEvent<{ locked: boolean }>> {
		return this.select('locked').pipe(map(locked => createEvent(this.id, { locked })));
	}

	registerListener<R extends keyof EntityState<S> = keyof EntityState<S>>(name: R, cb: (state: EntityState<S>[R]) => void): () => void {
		const disposeFn = () => {
			this._listeners[name as string].unsubscribe();
			delete this._listeners[name as string];
		};
		if (this._listeners[name as string]) {
			return disposeFn;
		}
		this._addListeners({ [name]: this.select(name).subscribe(cb) });
		return disposeFn;
	}
}
