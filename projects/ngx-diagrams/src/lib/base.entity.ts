import { UID } from './utils/tool-kit.util';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, mapTo, takeUntil } from 'rxjs/operators';
import { BaseEvent, createBaseEvent, createLockedEvent, LockEvent } from './interfaces/event.interface';

export type BaseEntityType = 'node' | 'link' | 'port';

export class BaseEntity {
	private _id: string;
	private _destroyed: Subject<void> = new Subject();
	private _destroyed$: Observable<void> = this._destroyed.asObservable();
	private _locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private _locked$: Observable<boolean> = this._locked.asObservable();

	constructor(id?: string) {
		this._id = id || UID();
	}

	public get id(): string {
		return this._id;
	}

	public set id(id: string) {
		this._id = id;
	}

	// TODO: revert back to get locked()
	getLocked(): boolean {
		return this._locked.value;
	}

	// TODO: revert back to set locked()
	setLocked(locked: boolean = true) {
		this._locked.next(locked);
	}

	public lockChanges(): Observable<LockEvent> {
		return this._locked$.pipe(
			takeUntil(this._destroyed$),
			map(locked => createLockedEvent(this, locked))
		);
	}

	public destroy() {
		this._destroyed.next();
		this._destroyed.complete();
	}

	public onEntityDestroy(): Observable<BaseEvent<BaseEntity>> {
		return this._destroyed$.pipe(mapTo(createBaseEvent(this)));
	}
}
