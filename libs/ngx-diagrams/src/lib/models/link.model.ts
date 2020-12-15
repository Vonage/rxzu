import { Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { SerializedLinkModel } from '../interfaces/serialization.interface';
import { DiagramEngine } from '../services/engine.service';
import { createValueState } from '../state/state';
import { ID } from '../utils/tool-kit.util';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { LabelModel } from './label.model';
import { PointModel } from './point.model';
import { PortModel } from './port.model';

export class LinkModel extends BaseModel<DiagramModel> {
  diagramEngine: DiagramEngine;

  // TODO: decide what should be reactive using RXJS
  protected name: string;
  protected sourcePort: PortModel | null;
  protected targetPort: PortModel | null;
  protected points: PointModel[];
  protected extras: any;

  protected label$ = createValueState<LabelModel>(null, this.entityPipe('label'));

  constructor(linkType = 'default', id?: string, logPrefix = '[Link]') {
    super(linkType, id, logPrefix);
    this.points = [new PointModel(this, { x: 0, y: 0 }), new PointModel(this, { x: 0, y: 0 })];
    this.extras = {};
    this.sourcePort = null;
    this.targetPort = null;
  }

  serialize(): SerializedLinkModel {
    const serializedPoints = this.points.map((point) => point.serialize());
    const label = this.getLabel()?.serialize();
    return {
      ...super.serialize(),
      name: this.getName(),
      sourcePort: this.getSourcePort().id,
      targetPort: this.getTargetPort().id,
      extras: this.getExtras(),
      points: serializedPoints,
      label
    };
  }

  setName(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getExtras(): any {
    return this.extras;
  }

  setExtras(extras: any) {
    this.extras = extras;
  }

  destroy() {
    if (this.sourcePort) {
      this.sourcePort.removeLink(this);
    }

    if (this.targetPort) {
      this.targetPort.removeLink(this);
    }

    super.destroy();
  }

  doClone(lookupTable = {}, clone) {
    clone.setPoints(
      this.getPoints().map((point: PointModel) => {
        return point.clone(lookupTable);
      })
    );
    if (this.sourcePort) {
      clone.setSourcePort(this.sourcePort.clone(lookupTable));
    }
    if (this.targetPort) {
      clone.setTargetPort(this.targetPort.clone(lookupTable));
    }
  }

  isLastPoint(point: PointModel) {
    const index = this.getPointIndex(point);
    return index === this.points.length - 1;
  }

  getPointIndex(point: PointModel) {
    return this.points.indexOf(point);
  }

  getPointModel(id: ID): PointModel | null {
    for (const point of this.points) {
      if (point.id === id) {
        return point;
      }
    }
    return null;
  }

  getPortForPoint(point: PointModel): PortModel {
    if (this.sourcePort !== null && this.getFirstPoint().id === point.id) {
      return this.sourcePort;
    }
    if (this.targetPort !== null && this.getLastPoint().id === point.id) {
      return this.targetPort;
    }
    return null;
  }

  getPointForPort(port: PortModel): PointModel {
    if (this.sourcePort !== null && this.sourcePort.id === port.id) {
      return this.getFirstPoint();
    }

    if (this.targetPort !== null && this.targetPort.id === port.id) {
      return this.getLastPoint();
    }

    return null;
  }

  getFirstPoint(): PointModel {
    return this.points[0];
  }

  getLastPoint(): PointModel {
    return this.points[this.points.length - 1];
  }

  setSourcePort(port: PortModel) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this.sourcePort !== null) {
      this.sourcePort.removeLink(this);
    }
    this.sourcePort = port;
  }

  getSourcePort(): PortModel {
    return this.sourcePort;
  }

  getTargetPort(): PortModel {
    return this.targetPort;
  }

  setTargetPort(port: PortModel) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this.targetPort !== null) {
      this.targetPort.removeLink(this);
    }
    this.targetPort = port;
  }

  point({ x, y }: Coords): PointModel {
    return this.addPoint(this.generatePoint({ x, y }));
  }

  getPoints(): PointModel[] {
    return this.points;
  }

  setPoints(points: PointModel[]) {
    points.forEach((point) => {
      point.setParent(this);
    });
    this.points = points;
  }

  setLabel(label: LabelModel) {
    label.setParent(this);
    this.label$.set(label).emit();
  }

  selectLabel(): Observable<LabelModel | null> {
    return this.label$.value$;
  }

  getLabel(): LabelModel {
    return this.label$.value;
  }

  resetLabel() {
    const currentLabel = this.getLabel();

    if (currentLabel) {
      currentLabel.setParent(null);
      currentLabel.setPainted(false);
    }

    this.setLabel(null);
  }

  removePoint(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel), 1);
  }

  removePointsBefore(pointModel: PointModel) {
    this.points.splice(0, this.getPointIndex(pointModel));
  }

  removePointsAfter(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel) + 1);
  }

  removeMiddlePoints() {
    if (this.points.length > 2) {
      this.points.splice(0, this.points.length - 2);
    }
  }

  addPoint<P extends PointModel>(pointModel: P, index = 1): P {
    pointModel.setParent(this);
    pointModel.setLocked(this.getLocked());
    this.points.splice(index, 0, pointModel);
    return pointModel;
  }

  generatePoint({ x = 0, y = 0 }: Coords): PointModel {
    return new PointModel(this, { x, y });
  }

  setLocked(locked = true) {
    super.setLocked(locked);
    this.points.forEach((point) => point.setLocked(locked));
  }
}
