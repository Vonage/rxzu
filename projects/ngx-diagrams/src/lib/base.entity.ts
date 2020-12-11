import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseEvent, LockEvent } from './interfaces/event.interface';
import { entityProperty as _entityProperty, ID, log as _log, LOG_LEVEL, UID, withLog as _withLog } from './utils/tool-kit.util';
import { HashMap } from './utils/types';

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export class BaseEntity {
	protected _id: ID;
	/**
	 * a prefix to make logs more easier
	 */
	protected _destroyed = new Subject<void>();
	protected _destroyed$ = this._destroyed.asObservable();
	protected _locked = new BehaviorSubject(false);
	protected _locked$ = this._locked.pipe(
		this.entityPipe('locked'),
		map(locked => new LockEvent(this, locked))
	);

	protected readonly _logPrefix: string;

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

	entityPipe(logMessage: string = '') {
		return _entityProperty(this.onEntityDestroy(), 0, `${this._logPrefix}: ${logMessage}`);
	}

	getLocked(): boolean {
		return this._locked.getValue();
	}

	setLocked(locked: boolean = true) {
		this._locked.next(locked);
	}

	// eslint-disable-next-line
	doClone(lookupTable: HashMap<any> = {}, clone: any) {
		/*noop*/
	}

	public clone(lookupTable: HashMap<any> = {}) {
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

	public serialize() {
		return {
			id: this.id,
			locked: this.getLocked(),
		};
	}

	public lockChanges(): Observable<LockEvent> {
		return this._locked$;
	}

	public destroy() {
		this.log('entity destroyed');
		this._destroyed.next();
		this._destroyed.complete();
	}

	public onEntityDestroy(): Observable<BaseEvent<BaseEntity>> {
		return this._destroyed$.pipe(map(opts => new BaseEvent(this, opts)));
	}
}
