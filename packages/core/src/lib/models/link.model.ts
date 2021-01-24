import { Observable } from 'rxjs';
import { Coords, LinkModelOptions } from '../interfaces';
import { createValueState, ValueState } from '../state';
import { ID } from '../utils/tool-kit.util';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { LabelModel } from './label.model';
import { PointModel } from './point.model';
import { PortModel } from './port.model';

export class LinkModel extends BaseModel<DiagramModel> {
  protected name$: ValueState<string>;
  protected sourcePort$: ValueState<PortModel | null>;
  protected targetPort$: ValueState<PortModel | null>;
  protected extras$: ValueState<any>;
  protected label$: ValueState<LabelModel | null>;
  protected path$: ValueState<string | null>;
  points$: ValueState<PointModel[]>;

  constructor(options: LinkModelOptions) {
    super({ logPrefix: '[Link]', type: 'default', ...options });

    this.name$ = createValueState<string>(
      options.name ?? '',
      this.entityPipe('targetPort')
    );
    this.sourcePort$ = createValueState<PortModel | null>(
      options.sourcePort ?? null,
      this.entityPipe('targetPort')
    );
    this.targetPort$ = createValueState<PortModel | null>(
      options.targetPort ?? null,
      this.entityPipe('targetPort')
    );

    this.extras$ = createValueState(
      options.extras ?? {},
      this.entityPipe('extras')
    );

    this.label$ = createValueState<LabelModel | null>(
      options.label ?? null,
      this.entityPipe('label')
    );

    this.path$ = createValueState<string | null>(null, this.entityPipe('path'));
    this.points$ = createValueState(
      [new PointModel({ parent: this }), new PointModel({ parent: this })],
      this.entityPipe('points')
    );
  }

  // serialize(): ILinkModel & {
  //   sourcePortId: string | null;
  //   targetPortId: string | null;
  // } {
  //   const serializedPoints = this.points$.value.map((point) =>
  //     point.serialize()
  //   );
  //   const label = this.getLabel()?.serialize();
  //   return {
  //     ...super.serialize(),
  //     name: this.getName(),
  //     sourcePortId: this.getSourcePort()?.id ?? null,
  //     targetPortId: this.getTargetPort()?.id ?? null,
  //     extras: this.getExtras(),
  //     points: serializedPoints,
  //     label,
  //   };
  // }

  setName(name: string) {
    this.name$.set(name).emit();
  }

  getName(): string | undefined {
    return this.name$.value;
  }

  setExtras<E>(extras: Partial<E>) {
    this.extras$.set(extras).emit();
  }

  getExtras() {
    return this.extras$.value;
  }

  selectExtras<T>(
    selector?: (extra: Partial<T>) => T[keyof T] | string | string[]
  ): Observable<T> {
    return this.extras$.select(selector);
  }

  destroy() {
    this.resetLabel();
    this.sourcePort$.value?.removeLink(this);
    this.targetPort$.value?.removeLink(this);

    super.destroy();
  }

  doClone(lookupTable = {}, clone: this) {
    clone.setPoints(
      this.getPoints().map((point: PointModel) => {
        return point.clone(lookupTable);
      })
    );
    if (this.sourcePort$.value) {
      clone.setSourcePort(this.sourcePort$.value.clone(lookupTable));
    }
    if (this.targetPort$.value) {
      clone.setTargetPort(this.targetPort$.value.clone(lookupTable));
    }
  }

  isLastPoint(point: PointModel) {
    const index = this.getPointIndex(point);
    return index === this.points$.value.length - 1;
  }

  getPointIndex(point: PointModel) {
    return this.points$.value.indexOf(point);
  }

  getPointModel(id?: ID | null): PointModel | undefined {
    for (const point of this.points$.value) {
      if (point.id === id) {
        return point;
      }
    }
    return undefined;
  }

  getPortForPoint(point: PointModel): PortModel | null {
    if (
      this.sourcePort$.value !== null &&
      this.getFirstPoint().id === point.id
    ) {
      return this.sourcePort$.value;
    }

    if (
      this.targetPort$.value !== null &&
      this.getLastPoint().id === point.id
    ) {
      return this.targetPort$.value;
    }

    return null;
  }

  getPointForPort(port: PortModel): PointModel | null {
    if (
      this.sourcePort$.value !== null &&
      this.sourcePort$.value.id === port.id
    ) {
      return this.getFirstPoint();
    }

    if (
      this.targetPort$.value !== null &&
      this.targetPort$.value.id === port.id
    ) {
      return this.getLastPoint();
    }

    return null;
  }

  getFirstPoint(): PointModel {
    return this.points$.value[0];
  }

  getLastPoint(): PointModel {
    return this.points$.value[this.points$.value.length - 1];
  }

  setSourcePort(port: PortModel) {
    if (port !== null) {
      port.addLink(this);
    }

    this.getSourcePort()?.removeLink(this);

    this.sourcePort$.set(port).emit();
  }

  getSourcePort(): PortModel | null {
    return this.sourcePort$.value;
  }

  getTargetPort(): PortModel | null {
    return this.targetPort$.value;
  }

  setTargetPort(port: PortModel | null) {
    if (port !== null) {
      port.addLink(this);
    }

    this.getTargetPort()?.removeLink(this);

    this.targetPort$.set(port).emit();
  }

  point({ x, y }: Coords): PointModel {
    return this.addPoint(this.generatePoint({ x, y }));
  }

  getPoints(): PointModel[] {
    return this.points$.value;
  }

  selectPoints(): Observable<PointModel[]> {
    return this.points$.select();
  }

  setPoints(points: PointModel[]) {
    points.forEach((point) => {
      point.setParent(this);
    });
    this.points$.set(points).emit();
  }

  setLabel(label: LabelModel) {
    label.setParent(this);
    this.label$.set(label).emit();
  }

  selectLabel(): Observable<LabelModel | null> {
    return this.label$.value$;
  }

  getLabel(): LabelModel | null {
    return this.label$.value;
  }

  resetLabel() {
    const currentLabel = this.getLabel();

    if (currentLabel) {
      currentLabel.destroy();
    }
  }

  removePoint(pointModel: PointModel) {
    this.points$.value.splice(this.getPointIndex(pointModel), 1);
  }

  removePointsBefore(pointModel: PointModel) {
    this.points$.value.splice(0, this.getPointIndex(pointModel));
  }

  removePointsAfter(pointModel: PointModel) {
    this.points$.value.splice(this.getPointIndex(pointModel) + 1);
  }

  removeMiddlePoints() {
    if (this.points$.value.length > 2) {
      this.points$.value.splice(0, this.points$.value.length - 2);
    }
  }

  addPoint<P extends PointModel>(pointModel: P, index = 1): P {
    pointModel.setParent(this);
    pointModel.setLocked(this.getLocked());
    this.points$.value.splice(index, 0, pointModel);
    return pointModel;
  }

  generatePoint({ x = 0, y = 0 }: Coords): PointModel {
    return new PointModel({ parent: this, coords: { x, y } });
  }

  setLocked(locked = true) {
    super.setLocked(locked);
    this.points$.value.forEach((point) => point.setLocked(locked));
  }
}
