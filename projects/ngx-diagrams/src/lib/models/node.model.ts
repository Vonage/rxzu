import { Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { Dimensions } from '../interfaces/dimensions.interface';
import { SerializedNodeModel } from '../interfaces/serialization.interface';
import { DiagramEngine } from '../services/engine.service';
import { createEntityState, createValueState } from '../utils';
import { ID } from '../utils/tool-kit.util';
import { EntityMap, HashMap } from '../utils/types';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';

export class NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
	protected diagramEngine$ = createValueState<DiagramEngine>(null, this.entityPipe('diagramEngine'));
	protected extras$ = createValueState<any>({}, this.entityPipe('extras'));
	protected ports$ = createEntityState<P>([], this.entityPipe('ports'));
	protected coords$ = createValueState<Coords>({ x: 0, y: 0 }, this.entityPipe('coords'));
	protected dimensions$ = createValueState<Dimensions>({ width: 0, height: 0 }, this.entityPipe('dimensions'));

	constructor(
		nodeType: string = 'default',
		id?: string,
		extras: HashMap<any> = {},
		x: number = 0,
		y: number = 0,
		width: number = 0,
		height: number = 0,
		logPrefix = '[Node]'
	) {
		super(nodeType, id, logPrefix);
		this.setExtras(extras);
		this.setDimensions({ width, height });
		this.setCoords({ x, y });
	}

	getDiagramEngine(): DiagramEngine {
		return this.diagramEngine$.value;
	}

	selectDiagramEngine(): Observable<DiagramEngine> {
		return this.diagramEngine$.value$;
	}

	setDiagramEngine(diagramEngine: DiagramEngine) {
		this.diagramEngine$.set(diagramEngine).emit();
	}

	getCoords(): Coords {
		return this.coords$.value;
	}

	setCoords({ x, y }: Coords) {
		const { x: oldX, y: oldY } = this.getCoords();

		this.getPorts().forEach(port => {
			port.getLinks().forEach(link => {
				const point = link.getPointForPort(port);
				const { x: pointX, y: pointY } = point.getCoords();
				point.setCoords({ x: pointX + x - oldX, y: pointY + y - oldY });
			});
		});

		this.coords$.set({ x, y }).emit();
	}

	serialize(): SerializedNodeModel {
		const serializedPorts = this.getPortsArray().map((port: P) => port.serialize());

		return {
			...super.serialize(),
			nodeType: this.getType(),
			extras: this.getExtras(),
			width: this.getWidth(),
			height: this.getHeight(),
			...this.getCoords(),
			ports: serializedPorts,
		};
	}

	// TODO: override selectionChanges and replace this with it (convert to rx)
	getSelectedEntities() {
		let entities = super.getSelectedEntities();

		// add the points of each link that are selected here
		if (this.getSelected()) {
			this.getPorts().forEach(port => {
				const points = port.getLinksArray().map(link => link.getPointForPort(port));
				entities = entities.concat(points);
			});
		}

		this.log('selectedEntities', entities);
		return entities;
	}

	// TODO: map to BaseEvent
	coordsChanges(): Observable<Coords> {
		return this.coords$.value$;
	}

	selectCoords(): Observable<Coords> {
		return this.coords$.value$;
	}

	selectX(): Observable<number> {
		return this.coords$.select(coords => coords.x);
	}

	selectY(): Observable<number> {
		return this.coords$.select(coords => coords.y);
	}

	/**
	 * Assign a port to the node and set the node as its getParent
	 * @returns the inserted port
	 */
	addPort(port: P): P {
		port.setParent(this);
		this.ports$.add(port).emit();
		return port;
	}

	removePort(portOrId: ID | P): string {
		const portId = typeof portOrId === 'string' ? portOrId : portOrId.id;
		this.ports$.remove(portId).emit();
		return portId;
	}

	getPort(id: ID): P {
		return this.ports$.get(id);
	}

	selectPorts(selector?: () => boolean | ID | ID[]): Observable<P[]> {
		// TODO: implement selector
		// TODO: create coerce func
		return this.ports$.array$().pipe(this.withLog('selectPorts'));
	}

	getPorts(): EntityMap<P> {
		return this.ports$.value;
	}

	getPortsArray(): P[] {
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
		return this.dimensions$.select(d => d.width).pipe(this.withLog('selectWidth'));
	}

	selectHeight(): Observable<number> {
		return this.dimensions$.select(d => d.height).pipe(this.withLog('selectHeight'));
	}

	setExtras(extras: any) {
		this.extras$.set(extras).emit();
	}

	getExtras() {
		return this.extras$.value;
	}

	selectExtras<E = any>(selector?: (extra: E) => E[keyof E] | string | string[]): Observable<E> {
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
