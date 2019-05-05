import { UID } from './utils/tool-kit.util';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, mapTo, take, takeUntil } from 'rxjs/operators';

export interface BaseEvent<T extends BaseEntity = BaseEntity> {
	entity: T;
	stopPropagation: () => any;
	firing: boolean;
	id: string;
}

export interface LockEvent<T extends BaseEntity = BaseEntity> extends BaseEvent<T> {
	locked: boolean;
}

export function createBaseEvent<T extends BaseEntity = BaseEntity>(thisArg: T): BaseEvent<T> {
	return {
		id: UID(),
		entity: thisArg,
		firing: true,
		stopPropagation: () => (this.firing = false)
	};
}

export function createLockedEvent<T extends BaseEntity = BaseEntity>(thisArg: T, locked: boolean = false): LockEvent<T> {
	return {
		...createBaseEvent(this),
		locked
	};
}

export type BaseEntityType = 'node' | 'link' | 'port';

export class BaseEntity {
	protected _id: string;
	protected readonly _destroyed: Subject<void> = new Subject();
	protected readonly _destroyed$: Observable<void> = this._destroyed.asObservable();
	protected readonly _locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	protected readonly _locked$: Observable<boolean> = this._locked.asObservable();

	constructor(id?: string) {
		this._id = id || UID();
	}

	get id(): string {
		return this._id;
	}

	set id(id: string) {
		this._id = id;
	}

	lockChanges(): Observable<LockEvent> {
		return this._locked$.pipe(
			takeUntil(this._destroyed),
			map(locked => createLockedEvent(this, locked))
		);
	}

	get locked(): boolean {
		return this._locked.value;
	}

	setLocked(locked: boolean = true) {
		this._locked.next(locked);
	}

	public destroy() {
		this._destroyed.next();
		this._destroyed.complete();
	}

	onEntityDestroy(): Observable<BaseEvent<BaseEntity>> {
		return this._destroyed$.pipe(mapTo(createBaseEvent(this)));
	}
}
