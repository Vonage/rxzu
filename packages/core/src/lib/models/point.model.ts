import { Observable } from 'rxjs';
import { Coords, PointModelOptions } from '../interfaces';
import { createValueState, ValueState } from '../state';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class PointModel extends BaseModel<LinkModel> {
  protected coords$: ValueState<Coords>;

  constructor(options: PointModelOptions) {
    super({ ...options, logPrefix: '[Point]', name: 'point' });
    this.coords$ = createValueState(
      options.coords ?? { x: 0, y: 0 },
      this.entityPipe('coords')
    );
  }

  // serialize(): IPointModel {
  //   return {
  //     ...super.serialize(),
  //     coords: this.getCoords(),
  //   };
  // }

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
