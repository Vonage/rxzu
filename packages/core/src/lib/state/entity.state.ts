import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { BaseEntity } from '../base.entity';
import { EntityMap, ID } from '../utils';
import { ValueState } from './value.state';

export class EntityState<T extends BaseEntity> extends ValueState<
  EntityMap<T>
> {
  constructor(
    value: EntityMap<T>,
    entityPipe?: MonoTypeOperatorFunction<EntityMap<T>>
  ) {
    super(value, entityPipe);
  }

  destroy() {
    this.clear();
  }

  clear() {
    this.forEach((entity) => entity.destroy());
    this.value.clear();
    this.stream$.next(this.value);
    return this;
  }

  get(id: ID): T | undefined {
    return this.value.get(id);
  }

  has(id: ID): boolean {
    return this.value.has(id);
  }

  add(entity: T): EntityState<T> {
    this.value.set(entity.id, entity);
    this.stream$.next(this.value);
    return this;
  }

  addMany(entities: T[]): EntityState<T> {
    for (const entity of entities) {
      this.add(entity);
    }
    this.stream$.next(this.value);
    return this;
  }

  remove(id: ID, destroy = true): EntityState<T> {
    if (destroy) {
      this.value.get(id)?.destroy();
    }

    this.value.delete(id);
    this.stream$.next(this.value);
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
