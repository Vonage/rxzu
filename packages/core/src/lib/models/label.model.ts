import { Coords, LabelModelOptions } from '../interfaces';
import { createValueState, ValueState } from '../state';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class LabelModel extends BaseModel<LinkModel> {
  protected coords$: ValueState<Coords>;
  protected rotation$: ValueState<number>;
  protected text$: ValueState<string | null>;

  constructor(options: LabelModelOptions) {
    super(options);

    this.coords$ = createValueState(
      options.coords ?? { x: 0, y: 0 },
      this.entityPipe('coords')
    );

    this.rotation$ = createValueState(
      options.rotation ?? 0,
      this.entityPipe('rotation')
    );

    this.text$ = createValueState(
      options.text ?? null,
      this.entityPipe('text')
    );
  }

  getRotation() {
    return this.rotation$.value;
  }

  getCoords() {
    return this.coords$.value;
  }

  destroy() {
    super.destroy();
  }

  setRotation(angle: number) {
    this.rotation$.set(angle).emit();
  }

  selectRotation() {
    return this.rotation$.value$;
  }

  setCoords(newCoords: Partial<Coords>) {
    this.coords$.set({ ...this.coords$.value, ...newCoords }).emit();
  }

  selectCoords() {
    return this.coords$.value$;
  }

  setText(text: string) {
    this.text$.set(text).emit();
  }

  getText() {
    return this.text$.value;
  }

  selectText() {
    return this.text$.value$;
  }
}
