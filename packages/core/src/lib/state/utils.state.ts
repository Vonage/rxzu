import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { BaseEntity } from '../base.entity';
import { HashMap, Entries, ID, mapToEntries } from '../utils';
import { EntityState } from './entity.state';
import { ValueState } from './value.state';

export function createValueState<T>(
  value: T,
  operator?: OperatorFunction<any, T>
): ValueState<T> {
  return new ValueState<T>(value, operator);
}

export function createEntityState<T extends BaseEntity>(
  value: HashMap<T> | Entries<T> = [],
  entityPipe: MonoTypeOperatorFunction<Map<ID, T>>
): EntityState<T> {
  if (Array.isArray(value)) {
    return new EntityState(new Map(value), entityPipe);
  } else {
    return new EntityState(new Map(mapToEntries(value)), entityPipe);
  }
}
