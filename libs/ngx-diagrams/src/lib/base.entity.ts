import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseEvent, LockEvent } from './interfaces/event.interface';
import { createValueState } from './state/state';
import {
  entityProperty as _entityProperty,
  ID,
  log as _log,
  LOG_LEVEL,
  UID,
  withLog as _withLog
} from './utils/tool-kit.util';
import { HashMap } from './utils/types';

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export class BaseEntity {
  protected _id: ID;

  protected destroyed$ = new Subject<void>();
  protected locked$ = createValueState(false, this.entityPipe('locked'));

  protected readonly _logPrefix: string;

  constructor(id?: ID, logPrefix = '') {
    this._id = id || UID();
    this._logPrefix = `${logPrefix}`;
  }

  get id(): ID {
    return this._id;
  }

  set id(id: ID) {
    this._id = id;
  }

  log(message: string, ...args: any): void {
    _log(`${this._logPrefix} ${message}: `, LOG_LEVEL.LOG, ...args);
  }

  withLog(message: string, ...args: any): any {
    return _withLog(`${this._logPrefix} ${message}: `, LOG_LEVEL.LOG, ...args);
  }

  entityPipe<T>(logMessage = ''): MonoTypeOperatorFunction<T> {
    return _entityProperty<T>(this.onEntityDestroy(), 0, `${this._logPrefix}: ${logMessage}`);
  }

  getLocked(): boolean {
    return this.locked$.value;
  }

  setLocked(locked = true) {
    this.locked$.set(locked).emit();
  }

  // eslint-disable-next-line
  doClone(lookupTable: HashMap<any> = {}, clone: any) {
    /*noop*/
  }

  clone(lookupTable: HashMap<any> = {}) {
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

  serialize() {
    return {
      id: this.id,
      locked: this.getLocked()
    };
  }

  lockChanges(): Observable<LockEvent> {
    return this.locked$.select((locked) => new LockEvent(this, locked));
  }

  destroy() {
    this.log('entity destroyed');
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onEntityDestroy(): Observable<BaseEvent<BaseEntity>> {
    return this.destroyed$.pipe(map((opts) => new BaseEvent(this, opts)));
  }
}
