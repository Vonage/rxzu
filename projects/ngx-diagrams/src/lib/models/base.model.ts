import { BaseEntity, EntityState } from '../base.entity';
import { Observable } from 'rxjs';
import { ID } from '../interfaces/types';
import { map } from 'rxjs/operators';
import { BaseEvent } from '../interfaces/event.interface';
import { createEvent } from '../utils/tool-kit.util';

export type BaseModelState<S = any> = EntityState<S> & {
	parentId: ID;
	active: boolean;
	painted: boolean;
	extras: any;
};

const DEFAULT_STATE: Partial<BaseModelState> = {
	parentId: null,
	active: false,
	painted: false,
	extras: null
};

export class BaseModel<S = any> extends BaseEntity<BaseModelState<S>> {
	private readonly type: string;

	constructor(type?: string, id?: string, initialState?: Partial<BaseModelState<S>>, logPrefix = '[Base]') {
		super(id, { ...DEFAULT_STATE, ...initialState }, logPrefix);
		this.type = type;
	}

	setPainted(val = true): void {
		this.update({ painted: val } as BaseModelState);
	}

	setActive(val = true): void {
		this.update({ active: val } as BaseModelState);
	}

	isActive(): boolean {
		return this.get('active');
	}

	isPainted(): boolean {
		return this.get('painted');
	}

	getType(): string {
		return this.type;
	}

	getActiveItems(): BaseEntity<any>[] {
		return this.get('active') ? [this] : []; // TODO: find solution to unknown issue
	}

	selectActiveItems(): Observable<BaseEntity<any>[]> {
		return this.select('active').pipe(map(active => (active ? [this] : [])));
	}

	getParentId(): ID {
		return this.get('parentId');
	}

	onPaintChange(): Observable<BaseEvent<{ painted: boolean }>> {
		return this.select('painted').pipe(map(painted => createEvent(this.id, { painted })));
	}

	onActiveChange(): Observable<BaseEvent<{ active: boolean }>> {
		return this.select('active').pipe(map(active => createEvent(this.id, { active })));
	}

	onParentChange(): Observable<BaseEvent<{ parentId: ID }>> {
		return this.select('parentId').pipe(map(parentId => createEvent(this.id, { parentId })));
	}
}
