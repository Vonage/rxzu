import { BaseEntity } from '../base.entity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PaintedEvent,
  ParentChangeEvent,
  SelectionEvent,
} from '../interfaces/event.interface';

export class BaseModel<X extends BaseEntity = BaseEntity> extends BaseEntity {
  protected readonly _type: string;
  protected readonly _parent$ = new BehaviorSubject<X>(null);
  protected readonly _selected$ = new BehaviorSubject(false);
  protected readonly _painted$ = new BehaviorSubject(false);
  protected readonly _hovered$ = new BehaviorSubject(false);

  protected readonly parent$ = this._parent$.pipe(
    this.entityPipe('ParentsChange'),
    map((p) => new ParentChangeEvent<X>(this, p))
  );
  protected readonly selected$: Observable<SelectionEvent>;
  protected readonly painted$: Observable<PaintedEvent>;
  protected readonly hovered$: Observable<boolean>;

  constructor(type?: string, id?: string, logPrefix = '[Base]') {
    super(id, logPrefix);
    this._type = type;
    this.selected$ = this._selected$.pipe(
      this.entityPipe('SelectedChange'),
      map((s) => new SelectionEvent(this, s))
    );

    this.painted$ = this._painted$.pipe(
      this.entityPipe('PaintedChange'),
      map((p) => new PaintedEvent(this, p))
    );

    this.hovered$ = this._hovered$.pipe(this.entityPipe('HoveredChange'));
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.getType(),
    };
  }

  getParent(): X {
    return this._parent$.getValue();
  }

  setParent(parent: X): void {
    this._parent$.next(parent);
  }

  parentChanges(): Observable<ParentChangeEvent<X>> {
    return this.parent$;
  }

  getPainted(): boolean {
    return this._painted$.getValue();
  }

  setPainted(painted: boolean = true) {
    this._painted$.next(painted);
  }

  getHovered(): boolean {
    return this._hovered$.getValue();
  }

  setHovered(painted: boolean = true) {
    this._hovered$.next(painted);
  }

  selectHovered() {
    return this.hovered$;
  }

  paintChanges(): Observable<PaintedEvent> {
    return this.painted$;
  }

  getType(): string {
    return this._type;
  }

  getSelected(): boolean {
    return this._selected$.getValue();
  }

  selectSelected(): Observable<boolean> {
    return this.selected$.pipe(map((e) => e.isSelected));
  }

  setSelected(selected: boolean = true) {
    this._selected$.next(selected);
  }

  selectionChanges(): Observable<SelectionEvent> {
    return this.selected$;
  }

  getSelectedEntities(): BaseModel[] {
    return this._selected$.value ? [this] : [];
  }
}
