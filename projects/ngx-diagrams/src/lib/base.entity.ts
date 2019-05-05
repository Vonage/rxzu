import { UID } from './utils/tool-kit.service';
import { BehaviorSubject } from 'rxjs';

export type BaseEntityType = 'node' | 'link' | 'port';

export class BaseEntity {
	public id: string;
	public locked$: BehaviorSubject<boolean>;

	constructor(id?: string) {
		this.id = id || UID();
		this.locked$ = new BehaviorSubject(false);
	}

	getID() {
		return this.id;
	}

	isLocked() {
		return this.locked$;
	}

	setLocked(locked: boolean = true) {
		this.locked$.next(locked);
		// TODO: handle instance events somehow, maybe event bus?
		// https://github.com/projectstorm/react-diagrams/blob/master/src/BaseEntity.ts#L109-L112
	}
}
