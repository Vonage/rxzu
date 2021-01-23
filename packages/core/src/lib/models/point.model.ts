import { Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { SerializedPointModel } from '../interfaces/serialization.interface';
import { createValueState, ValueState } from '../state';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class PointModel extends BaseModel<LinkModel> {
  protected coords$: ValueState<Coords>;

  constructor(link: LinkModel, coords: Coords, id?: string, logPrefix = '[Point]') {
    super(link.getType(), id, logPrefix);
    this.coords$ = createValueState(coords, this.entityPipe('coords'));
    this.setParent(link);
  }

  serialize(): SerializedPointModel {
    return {
      ...super.serialize(),
      coords: this.getCoords()
    };
  }

  isConnectedToPort(): boolean {
    return this.getParent()?.getPortForPoint(this) !== null;
  }

  getLink(): LinkModel | null {
    return this.getParent();
  }

  destroy() {
    this.getParent()?.removePoint(this);
    super.destroy();
  }

  setCoords(newCoords: Partial<Coords>) {
    this.coords$.set({ ...this.getCoords(), ...newCoords }).emit();
  }

  selectCoords(): Observable<Coords> {
    return this.coords$.value$;
  }

  getCoords(): Coords {
    return this.coords$.value;
  }

  selectX(): Observable<number> {
    return this.coords$.select((coords) => coords.x);
  }

  selectY(): Observable<number> {
    return this.coords$.select((coords) => coords.y);
  }
}
