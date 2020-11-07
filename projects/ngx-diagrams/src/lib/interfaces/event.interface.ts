import { ID, UID } from '../utils/tool-kit.util';
import { BaseEntity } from '../base.entity';

// region events
export class BaseEvent<T extends BaseEntity> {
	entity: T;
	entityId: ID;
	stopPropagation: () => any;
	firing: boolean;
	id: ID;
	propogate: boolean;

	constructor(entity: T, options?: any) {
		this.id = UID();
		this.entity = entity;
		this.entityId = entity.id;
		this.firing = true;
		this.stopPropagation = () => (this.firing = false);
		this.propogate = options ? options.propagate : null;
	}
}
export class LockEvent<T extends BaseEntity = BaseEntity> extends BaseEvent<T> {
	locked: boolean;

	constructor(entity: T, locked: boolean = false) {
		super(entity);
		this.locked = locked;
	}
}
export class ParentChangeEvent<P extends BaseEntity = BaseEntity, T extends BaseEntity = BaseEntity> extends BaseEvent<T> {
	parent: P;

	constructor(entity: T, parent: P) {
		super(entity);
		this.parent = parent;
	}
}
export class SelectionEvent<T extends BaseEntity = BaseEntity> extends BaseEvent<T> {
	isSelected: boolean;

	constructor(entity: T, selected: boolean) {
		super(entity);
		this.isSelected = selected;
	}
}
export class PaintedEvent<T extends BaseEntity = BaseEntity> extends BaseEvent<T> {
	isPainted: boolean;

	constructor(entity: T, painted: boolean = false) {
		super(entity);
		this.isPainted = painted;
	}
}
// endregion
