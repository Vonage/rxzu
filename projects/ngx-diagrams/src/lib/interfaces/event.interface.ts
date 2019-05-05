import { UID } from '../utils/tool-kit.util';
import { BaseEntity } from '../base.entity';

export interface BaseEvent<T extends BaseEntity> {
	entity: T;
	stopPropagation: () => any;
	firing: boolean;
	id: string;
}
export type LockEvent<T extends BaseEntity = BaseEntity> = BaseEvent<T> & { locked: boolean };
export type ParentChangeEvent<T extends BaseEntity = BaseEntity, P extends BaseEntity = BaseEntity> = BaseEvent<T> & {
	parent: P;
};
export type SelectionEvent<T extends BaseEntity = BaseEntity> = BaseEvent<T> & { isSelected: boolean };
export type PaintedEvent<T extends BaseEntity = BaseEntity> = BaseEvent<T> & { isPainted: boolean };

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
export function createParentEvent<T extends BaseEntity = BaseEntity, P extends BaseEntity = BaseEntity>(
	thisArg: T,
	parent: P
): ParentChangeEvent<T, P> {
	return {
		...createBaseEvent<T>(this),
		parent
	};
}
export function createSelectionEvent<T extends BaseEntity = BaseEntity>(thisArg: T, isSelected: boolean): SelectionEvent<T> {
	return {
		...createBaseEvent<T>(this),
		isSelected
	};
}
export function createPaintedEvent<T extends BaseEntity = BaseEntity>(thisArg: T, painted: boolean): PaintedEvent<T> {
	return {
		...createBaseEvent<T>(this),
		isPainted: painted
	};
}
