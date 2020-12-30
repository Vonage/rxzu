import { Observable } from 'rxjs';
import { LinkModel } from '../../models';
import { createValueState } from '../../state';

export class DefaultLinkModel extends LinkModel {
  width$ = createValueState<number>(3, this.entityPipe('width'));
  color$ = createValueState<string>('rgba(255, 255, 255, 0.5)', this.entityPipe('color'));
  curvyness$ = createValueState<number>(50, this.entityPipe('curvyness'));

  constructor({
    type = 'default',
    id,
    logPrefix = '[DefaultLink]'
  }: { type?: string; id?: string; logPrefix?: string } = {}) {
    super(type, id, logPrefix);
  }

  setWidth(width: number) {
    this.width$.set(width).emit();
  }

  setColor(color: string) {
    this.color$.set(color).emit();
  }

  selectWidth(): Observable<number> {
    return this.width$.value$;
  }

  selectColor(): Observable<string> {
    return this.color$.value$;
  }

  setCurvyness(curvyness: number) {
    this.curvyness$.set(curvyness).emit();
  }

  get color() {
    return this.color$.value;
  }

  get width() {
    return this.width$.value;
  }

  get curvyness() {
    return this.curvyness$.value;
  }
}
