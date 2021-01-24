import { Observable } from 'rxjs';
import { BaseEntity } from '../base.entity';
import {
  PaintedEvent,
  ParentChangeEvent,
  SelectionEvent,
} from '../interfaces/event.interface';
import { BaseModelOptions } from '../interfaces/options.interface';
import { createValueState, ValueState } from '../state';

export class BaseModel<E extends BaseEntity = BaseEntity> extends BaseEntity {
  protected readonly _type: string;

  protected parent$: ValueState<E>;
  protected selected$: ValueState<boolean>;
  protected hovered$: ValueState<boolean>;
  protected painted$: ValueState<PaintedEvent>;

  constructor(options: BaseModelOptions<any>) {
    super({ id: options.id, logPrefix: options.logPrefix });
    this._type = options.type;

    this.parent$ = createValueState(
      options.parent,
      this.entityPipe('ParentsChange')
    );

    this.selected$ = createValueState<boolean>(
      false,
      this.entityPipe('SelectedChange')
    );

    this.hovered$ = createValueState<boolean>(
      false,
      this.entityPipe('HoveredChange')
    );

    this.painted$ = createValueState<PaintedEvent>(
      new PaintedEvent(this, false),
      this.entityPipe('PaintedChange')
    );
  }

  // serialize(): IBaseModel {
  //   return {
  //     ...super.serialize(),
  //     type: this.getType(),
  //   };
  // }

  getParent(): E {
    return this.parent$.value;
  }

  setParent(parent: E): void {
    this.parent$.set(parent).emit();
  }

  parentChanges(): Observable<ParentChangeEvent<E>> {
    return this.parent$.select((p) => new ParentChangeEvent(this, p));
  }

  getPainted(): PaintedEvent {
    return this.painted$.value;
  }

  setPainted(painted = true): void {
    this.painted$.set(new PaintedEvent(this, painted)).emit();
  }

  paintChanges(): Observable<PaintedEvent> {
    return this.painted$.value$;
  }

  getHovered(): boolean {
    return this.hovered$.value;
  }

  setHovered(hovered = true): void {
    this.hovered$.set(hovered).emit();
  }

  selectHovered(): Observable<boolean> {
    return this.hovered$.select();
  }

  getType(): string {
    return this._type;
  }

  getSelected(): boolean {
    return this.selected$.value;
  }

  selectSelected(): Observable<boolean> {
    return this.selected$.select();
  }

  setSelected(selected = true): void {
    this.selected$.set(selected).emit();
  }

  selectionChanges(): Observable<SelectionEvent> {
    return this.selected$.select(
      (selected) => new SelectionEvent(this, selected)
    );
  }

  getSelectedEntities(): BaseModel<E>[] {
    return this.getSelected() ? [this] : [];
  }
}
