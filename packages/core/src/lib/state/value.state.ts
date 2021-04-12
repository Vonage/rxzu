import { BehaviorSubject, Observable, OperatorFunction } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export class ValueState<T> {
  protected stream$: BehaviorSubject<T>;

  value$: Observable<T>;

  constructor(value: T, operator?: OperatorFunction<any, T>) {
    this.stream$ = new BehaviorSubject(value);
    this.value$ = operator
      ? this.stream$.pipe(operator)
      : this.stream$.asObservable();
  }

  get value(): T {
    return this.stream$.getValue();
  }

  set(value: T): ValueState<T> {
    this.stream$.next(value);
    return this;
  }

  select(): Observable<T>;
  select(project?: (value: T) => T): Observable<T>;
  select<R>(project?: (value: T) => R): Observable<R>;
  select<R>(
    project?: ((value: T) => T) | ((value: T) => R)
  ): Observable<T | R> {
    const mapFn = project || ((v) => v);
    return this.value$.pipe(
      map((value) => mapFn(value)),
      distinctUntilChanged()
    );
  }
}
