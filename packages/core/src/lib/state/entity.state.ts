import { BehaviorSubject, Observable, MonoTypeOperatorFunction } from 'rxjs';
import { BaseEntity } from '../base.entity';
import { EntityMap, ID } from '../utils';
import { ValueState } from './value.state';

export class EntityState<T extends BaseEntity> extends ValueState<
  EntityMap<T>
> {
  protected stream$: BehaviorSubject<EntityMap<T>>;

  value$: Observable<EntityMap<T>>;

  constructor(
    value?: EntityMap<T>,
    entityPipe?: MonoTypeOperatorFunction<EntityMap<T>>
  ) {
    super(value, entityPipe);
  }

  destroy() {
    this.clear();
    this.stream$ = null;
    this.value$ = null;
  }

  clear(destroy = true) {
    if (destroy) {
      this.forEach((entity) => entity.destroy());
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

  remove(id: ID, destroy = true): EntityState<T> {
    if (destroy) {
      this.value.get(id)?.destroy();
    }

    this.value.delete(id);
    return this;
  }

  array(): T[] {
    return Array.from(this.value.values());
  }

  array$(): Observable<T[]> {
    return this.select((value) => Array.from(value.values()));
  }

  forEach(cb: (value: T, key: string, map: EntityMap<T>) => void): void {
    this.value.forEach(cb);
  }

  map<R>(cb: (value: T, index: number, array: T[]) => R): R[] {
    return this.array().map(cb);
  }
}
