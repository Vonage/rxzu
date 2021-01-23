import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Coords } from '../interfaces/coords.interface';
import { Dimensions } from '../interfaces/dimensions.interface';
import { SerializedNodeModel } from '../interfaces/serialization.interface';
import { createValueState, createEntityState } from '../state';
import { ID } from '../utils/tool-kit.util';
import { EntityMap, HashMap } from '../utils/types';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';

export class NodeModel extends BaseModel<
  DiagramModel
> {
  protected extras$ = createValueState<any>({}, this.entityPipe('extras'));
  protected ports$ = createEntityState<PortModel>([], this.entityPipe('ports'));
  protected coords$ = createValueState<Coords>(
    { x: 0, y: 0 },
    this.entityPipe('coords')
  );
  protected dimensions$ = createValueState<Dimensions>(
    { width: 0, height: 0 },
    this.entityPipe('dimensions')
  );

  constructor(
    nodeType = 'default',
    id?: string,
    extras: HashMap<any> = {},
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    logPrefix = '[Node]'
  ) {
    super(nodeType, id, logPrefix);
    this.setExtras(extras);
    this.setDimensions({ width, height });
    this.setCoords({ x, y });

    // once node finish painting itself, subscribe to ports change and update their coords
    this.paintChanges()
      .pipe(filter((paintE) => !!paintE.isPainted))
      .subscribe(() => {
        this.selectPorts()
          .pipe(takeUntil(this.destroyed$))
          .subscribe((ports) => {
            ports.forEach((port) => {
              if (port.getPainted().isPainted && this.getParent()) {
                const diagramEngine = this.getParent()?.getDiagramEngine();
                if (diagramEngine) {
                  const portSize = diagramEngine.getPortCoords(port);
                  const portCenter = diagramEngine.getPortCenter(port);
                  port.updateCoords({ ...portSize, ...portCenter });
                }
              }
            });
          });
      });
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

  serialize(): SerializedNodeModel {
    const serializedPorts = this.getPortsArray().map(port =>
      port.serialize()
    );

    return {
      ...super.serialize(),
      nodeType: this.getType(),
      type: this.getType(),
      extras: this.getExtras(),
      width: this.getWidth(),
      height: this.getHeight(),
      ...this.getCoords(),
      ports: serializedPorts,
    };
  }

  getSelectedEntities(): (NodeModel | PointModel)[] {
    let entities: (NodeModel | PointModel)[] = super.getSelectedEntities() as NodeModel[];

    const isPoint = (point: PointModel | null): point is PointModel => !!point;
    // add the points of each link that are selected here
    if (this.getSelected()) {
      this.getPorts().forEach((port) => {
        const points = port
          .getLinksArray()
          .map((link) => link.getPointForPort(port)).filter(isPoint);
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
    return id && this.ports$.get(id) || undefined;
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
    super.destroy();
    this.removeAllPorts();
  }

  removeAllPorts(): void {
    this.ports$.clear().emit();
  }
}
