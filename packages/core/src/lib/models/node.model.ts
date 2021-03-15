import { Observable } from 'rxjs';
import { Coords, NodeModelOptions, Dimensions } from '../interfaces';
import {
  createValueState,
  createEntityState,
  ValueState,
  EntityState,
} from '../state';
import { ID } from '../utils/tool-kit.util';
import { EntityMap } from '../utils/types';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import { DiagramEngine } from '../engine.core';

export class NodeModel extends BaseModel<DiagramModel> {
  protected extras$: ValueState<any>;
  protected ports$: EntityState<PortModel>;
  protected coords$: ValueState<Coords>;
  protected dimensions$: ValueState<Dimensions>;

  constructor(options: NodeModelOptions = {}) {
    super({ type: 'node', logPrefix: '[Node]', ...options });

    this.ports$ = createEntityState([], this.entityPipe('ports'));
    this.extras$ = createValueState(
      options.extras ?? {},
      this.entityPipe('extras')
    );
    this.coords$ = createValueState(
      options.coords ?? { x: 0, y: 0 },
      this.entityPipe('coords')
    );
    this.dimensions$ = createValueState(
      options.dimensions ?? { width: 0, height: 0 },
      this.entityPipe('dimensions')
    );
  }

  updatePortCoords(port: PortModel, engine: DiagramEngine) {
    if (port.getPainted().isPainted && this.getParent()) {
      const portSize = engine.getCanvasManager().getPortCoords(port);
      const portCenter = engine.getCanvasManager().getPortCenter(port);
      port.updateCoords(
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          ...portSize,
          ...portCenter,
        },
        engine
      );
    }
  }

  getCoords(): Coords {
    return this.coords$.value;
  }

  setCoords({ x, y }: Coords) {
    const { x: oldX, y: oldY } = this.getCoords();

    this.getPorts().forEach((port) => {
      port.getLinks().forEach((link) => {
        const point = link.getPointForPort(port);
        if (!point) return;
        const { x: pointX, y: pointY } = point.getCoords();
        point.setCoords({ x: pointX + x - oldX, y: pointY + y - oldY });
      });
    });

    this.coords$.set({ x, y }).emit();
  }

  // serialize(): INodeModel {
  //   const serializedPorts = this.getPortsArray().map((port) =>
  //     port.serialize()
  //   );

  //   return {
  //     ...super.serialize(),
  //     nodeType: this.getType(),
  //     type: this.getType(),
  //     extras: this.getExtras(),
  //     width: this.getWidth(),
  //     height: this.getHeight(),
  //     ...this.getCoords(),
  //     ports: serializedPorts,
  //   };
  // }

  getSelectedEntities(): any {
    let entities: (
      | NodeModel
      | PointModel
    )[] = super.getSelectedEntities() as NodeModel[];

    const isPoint = (point: PointModel | null): point is PointModel => !!point;

    // add the points of each link that are selected here
    if (this.getSelected()) {
      this.getPorts().forEach((port) => {
        const points = port
          .getLinksArray()
          .map((link) => link.getPointForPort(port))
          .filter(isPoint);
        entities = entities.concat(points);
      });
    }

    this.log('selectedEntities', entities);
    return entities;
  }

  coordsChanges(): Observable<Coords> {
    return this.coords$.value$;
  }

  selectCoords(): Observable<Coords> {
    return this.coords$.value$;
  }

  selectX(): Observable<number> {
    return this.coords$.select((coords) => coords.x);
  }

  selectY(): Observable<number> {
    return this.coords$.select((coords) => coords.y);
  }

  /**
   * Assign a port to the node and set the node as its getParent
   * @returns the inserted port
   */
  addPort(port: PortModel): PortModel {
    port.setParent(this);
    this.ports$.add(port).emit();
    return port;
  }

  removePort(portOrId: ID | PortModel): string {
    const portId = typeof portOrId === 'string' ? portOrId : portOrId.id;
    this.ports$.remove(portId).emit();
    return portId;
  }

  getPort(id?: ID | null): PortModel | undefined {
    return (id && this.ports$.get(id)) || undefined;
  }

  selectPorts(selector?: () => boolean | ID | ID[]): Observable<PortModel[]> {
    // TODO: implement selector
    // TODO: create coerce func
    return this.ports$.array$().pipe(this.withLog('selectPorts'));
  }

  getPorts(): EntityMap<PortModel> {
    return this.ports$.value;
  }

  getPortsArray(): PortModel[] {
    return this.ports$.array();
  }

  setDimensions(dimensions: Partial<Dimensions>) {
    this.dimensions$.set({ ...this.getDimensions(), ...dimensions }).emit();
  }

  getDimensions(): Dimensions {
    return this.dimensions$.value;
  }

  // TODO: return BaseEvent extension
  dimensionChanges(): Observable<Dimensions> {
    return this.dimensions$.select();
  }

  getHeight(): number {
    return this.getDimensions().height;
  }

  setHeight(height: number) {
    return this.setDimensions({ height });
  }

  getWidth(): number {
    return this.getDimensions().width;
  }

  setWidth(width: number) {
    return this.setDimensions({ width });
  }

  selectWidth(): Observable<number> {
    return this.dimensions$
      .select((d) => d.width)
      .pipe(this.withLog('selectWidth'));
  }

  selectHeight(): Observable<number> {
    return this.dimensions$
      .select((d) => d.height)
      .pipe(this.withLog('selectHeight'));
  }

  setExtras<E>(extras: Partial<E>) {
    this.extras$.set(extras).emit();
  }

  getExtras() {
    return this.extras$.value;
  }

  selectExtras<E>(
    selector?: (extra: E) => E[keyof E] | string | string[]
  ): Observable<E> {
    return this.extras$.select(selector);
  }

  destroy() {
    super.destroy();
    this.removeAllPorts();
  }

  removeAllPorts(): void {
    this.ports$.destroy();
  }
}
