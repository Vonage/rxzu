import { Observable } from 'rxjs';
import { BaseEntity } from '../base.entity';
import { PaintedEvent, ParentChangeEvent, SelectionEvent } from '../interfaces/event.interface';
import { createValueState } from '../state/state';

export class BaseModel<E extends BaseEntity = BaseEntity> extends BaseEntity {
  protected readonly _type: string;

  protected parent$ = createValueState<E>(null, this.entityPipe('ParentsChange'));
  protected selected$ = createValueState<boolean>(false, this.entityPipe('SelectedChange'));
  protected hovered$ = createValueState<boolean>(false, this.entityPipe('HoveredChange'));
  protected painted$ = createValueState<boolean>(false, this.entityPipe('PaintedChange'));

  constructor(type?: string, id?: string, logPrefix = '[Base]') {
    super(id, logPrefix);
    this._type = type;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.getType()
    };
  }

  getParent(): E {
    return this.parent$.value;
  }

  setParent(parent: E): void {
    this.parent$.set(parent).emit();
  }

  parentChanges(): Observable<ParentChangeEvent<E>> {
    return this.parent$.select((p) => new ParentChangeEvent(this, p));
  }

  getPainted(): boolean {
    return this.painted$.value;
  }

  setPainted(painted = true): void {
    this.painted$.set(painted).emit();
  }

  getHovered(): boolean {
    return this.hovered$.value;
  }

  setHovered(painted = true): void {
    this.hovered$.set(painted).emit();
  }

  selectHovered(): Observable<boolean> {
    return this.hovered$.value$;
  }

  paintChanges(): Observable<PaintedEvent> {
    return this.painted$.select((p) => new PaintedEvent(this, p));
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
    return this.selected$.select((selected) => new SelectionEvent(this, selected));
  }

  getSelectedEntities(): BaseModel[] {
    return this.getSelected() ? [this] : [];
  }
}
