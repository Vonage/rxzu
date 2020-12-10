import { BehaviorSubject, MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { BaseEntity } from '../base.entity';
import { ID, isArray, mapToEntries } from './tool-kit.util';
import { Entries, HashMap, TypedMap } from './types';

export class ValueState<T> {
	protected readonly stream$: BehaviorSubject<T>;

	readonly value$: Observable<T>;

	constructor(value?: T, operator?: OperatorFunction<T, any>) {
		this.stream$ = new BehaviorSubject(value);
		this.value$ = operator ? this.stream$.pipe(operator) : this.stream$.asObservable();
	}

	get value(): T {
		return this.stream$.getValue();
	}

	set(value: T): ValueState<T> {
		this.stream$.next(value);
		return this;
	}

	emit(): void {
		this.stream$.next(this.value);
	}

	select(): Observable<T>;
	select(project: (value: T) => T): Observable<T>;
	select<R>(project: (value: T) => R): Observable<R>;
	select<R>(project?: ((value: T) => T) | ((value: T) => R)): Observable<T | R> {
		let mapFn = project || (v => v);
		return this.value$.pipe(
			map(value => mapFn(value)),
			distinctUntilChanged()
		);
	}
}

export function createValueState<T>(value: T, operator?: OperatorFunction<T, any>): ValueState<T> {
	return new ValueState<T>(value, operator);
}

export class EntityState<T extends BaseEntity> extends ValueState<TypedMap<T>> {
	protected stream$: BehaviorSubject<TypedMap<T>>;

	value$: Observable<TypedMap<T>>;

	constructor(value?: TypedMap<T>, entityPipe?: MonoTypeOperatorFunction<TypedMap<T>>) {
		super(value, entityPipe);
	}

	destroy() {
		this.clear();
		this.stream$ = null;
		this.value$ = null;
	}

	clear(destroy: boolean = true) {
		if (destroy) {
			this.forEach(entity => entity.destroy());
		}

		this.value.clear();
		return this;
	}

	get(id: ID): T {
		return this.value.get(id);
	}

	has(id: ID): boolean {
		return this.value.has(id);
	}

	add(entity: T): EntityState<T> {
		this.value.set(entity.id, entity);
		return this;
	}

	addMany(entities: T[]): EntityState<T> {
		for (const entity of entities) {
			this.add(entity);
		}
		return this;
	}

	remove(id: ID, destroy: boolean = true): EntityState<T> {
		if (destroy) {
			this.value.get(id)?.destroy();
		}

		this.value.delete(id);
		return this;
	}

	array(): T[] {
		return Array.from(this.value.valuesArray());
	}

	array$(): Observable<T[]> {
		return this.select(value => value.valuesArray());
	}

	forEach(cb: (value: T, key: string, map: TypedMap<T>) => void): void {
		this.value.forEach(cb);
	}

	map<R = any>(cb: (value: T, index: number, array: T[]) => R): R[] {
		return this.array().map(cb);
	}
}

export function createEntityState<T extends BaseEntity>(
	value: HashMap<T> | Entries<T> = [],
	entityPipe: MonoTypeOperatorFunction<TypedMap<T>>
): EntityState<T> {
	if (isArray(value)) {
		return new EntityState(new TypedMap(value), entityPipe);
	} else {
		return new EntityState(new TypedMap(mapToEntries(value)), entityPipe);
	}
}
