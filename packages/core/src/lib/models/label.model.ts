import { Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { SerializedLabelModel } from '../interfaces/serialization.interface';
import { createValueState } from '../state';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class LabelModel extends BaseModel<LinkModel> {
  protected coords$ = createValueState<Coords>({ x: 0, y: 0 }, this.entityPipe('coords'));
  protected rotation$ = createValueState<number>(0, this.entityPipe('rotation'));

  constructor(type?: string, id?: string, logPrefix = '[Label]') {
    super(type, id, logPrefix);
  }

  serialize(): SerializedLabelModel {
    return {
      ...super.serialize(),
      type: this.getType(),
      rotation: this.getRotation(),
      coords: this.getCoords()
    };
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

  selectRotation(): Observable<number> {
    return this.rotation$.value$;
  }

  setCoords(newCoords: Partial<Coords>) {
    this.coords$.set({ ...this.coords$.value, ...newCoords }).emit();
  }

  selectCoords(): Observable<Coords> {
    return this.coords$.value$;
  }
}
