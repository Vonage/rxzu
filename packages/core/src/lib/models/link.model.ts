import { Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { SerializedLinkModel } from '../interfaces/serialization.interface';
import { createValueState } from '../state';
import { ID } from '../utils/tool-kit.util';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { LabelModel } from './label.model';
import { PointModel } from './point.model';
import { PortModel } from './port.model';

export class LinkModel extends BaseModel<DiagramModel> {
  protected name$ = createValueState<string | undefined>(
    undefined,
    this.entityPipe('targetPort')
  );
  protected sourcePort$ = createValueState<PortModel | null>(
    null,
    this.entityPipe('targetPort')
  );
  protected targetPort$ = createValueState<PortModel | null>(
    null,
    this.entityPipe('targetPort')
  );
  protected extras$ = createValueState<any>({}, this.entityPipe('extras'));
  protected label$ = createValueState<LabelModel | null>(
    null,
    this.entityPipe('label')
  );
  path$ = createValueState<string | null>(null, this.entityPipe('path'));
  points$ = createValueState<PointModel[]>(
    [
      new PointModel(this, { x: 0, y: 0 }),
      new PointModel(this, { x: 0, y: 0 }),
    ],
    this.entityPipe('points')
  );

  constructor(linkType = 'default', id?: string, logPrefix = '[Link]') {
    super(linkType, id, logPrefix);
  }

  serialize(): SerializedLinkModel {
    const serializedPoints = this.points$.value.map((point) =>
      point.serialize()
    );
    const label = this.getLabel()?.serialize();
    return {
      ...super.serialize(),
      name: this.getName(),
      sourcePort: this.getSourcePort()?.id,
      targetPort: this.getTargetPort()?.id,
      extras: this.getExtras(),
      points: serializedPoints,
      label,
    };
  }

  setName(name: string) {
    this.name$.set(name).emit();
  }

  getName(): string | undefined {
    return this.name$.value;
  }

  setExtras(extras: any) {
    this.extras$.set(extras).emit();
  }

  getExtras() {
    return this.extras$.value;
  }

  selectExtras<E = any>(
    selector?: (extra: E) => E[keyof E] | string | string[]
  ): Observable<E> {
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
      currentLabel.setParent(null);
      currentLabel.setPainted(false);
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
    return new PointModel(this, { x, y });
  }

  setLocked(locked = true) {
    super.setLocked(locked);
    this.points$.value.forEach((point) => point.setLocked(locked));
  }
}
