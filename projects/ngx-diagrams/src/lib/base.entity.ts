import { ID, log as _log, withLog as _withLog, UID, LOG_LEVEL } from './utils/tool-kit.util';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, mapTo, takeUntil } from 'rxjs/operators';
import { BaseEvent, LockEvent } from './interfaces/event.interface';

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export interface DestroyOptions {
	propagate?: boolean;
	emit?: boolean;
}

export class BaseEntity {
	private _id: ID;
	/**
	 * a prefix to make logs more easier
	 */
	private _logPrefix: string;
	private _destroyed: Subject<DestroyOptions> = new Subject();
	private _destroyed$: Observable<DestroyOptions> = this._destroyed.asObservable();
	private _locked: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private _locked$: Observable<boolean> = this._locked.asObservable();

	constructor(id?: ID, logPrefix = '') {
		this._id = id || UID();
		this._logPrefix = `${logPrefix}`;
	}

	public get id(): ID {
		return this._id;
	}

	public set id(id: ID) {
		this._id = id;
	}

	log(message: string, ...args: any): void {
		_log(`${this._logPrefix} ${message}: `, LOG_LEVEL.LOG, ...args);
	}

	withLog(message: string, ...args: any): any {
		return _withLog(`${this._logPrefix} ${message}: `, LOG_LEVEL.LOG, ...args);
	}

	getLocked(): boolean {
		return this._locked.getValue();
	}

	setLocked(locked: boolean = true) {
		this._locked.next(locked);
	}

	// tslint:disable-next-line
	doClone(lookupTable: { [s: string]: any } = {}, clone: any) {
		/*noop*/
	}

	clone(lookupTable: { [s: string]: any } = {}) {
		// try and use an existing clone first
		if (lookupTable[this.id]) {
			return lookupTable[this.id];
		}
		const clone = { ...this };
		clone.id = UID();
		// clone.clearListeners();
		lookupTable[this.id] = clone;

		this.doClone(lookupTable, clone);
		return clone;
	}

	public lockChanges(): Observable<LockEvent> {
		return this._locked$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(locked => new LockEvent(this, locked)),
			this.withLog('lockChanges')
		);
	}

	public destroy(options?: DestroyOptions) {
		this.log('entity destroyed');
		this._destroyed.next(options);
		this._destroyed.complete();
	}

	public onEntityDestroy(): Observable<BaseEvent<BaseEntity>> {
		return this._destroyed$.pipe(mapTo(new BaseEvent(this)));
	}
}
