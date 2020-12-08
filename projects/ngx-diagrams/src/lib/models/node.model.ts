import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Coords } from '../interfaces/coords.interface';
import { Dimensions } from '../interfaces/dimensions.interface';
import { SerializedNodeModel } from '../interfaces/serialization.interface';
import { DiagramEngine } from '../services/engine.service';
import { ID, mapToArray } from '../utils/tool-kit.util';
import { HashMap } from '../utils/types';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';

export class NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
	protected readonly _diagramEngine$ = new BehaviorSubject<DiagramEngine>(null);
	protected readonly _extras$ = new BehaviorSubject<HashMap<any>>({});
	protected readonly _ports$ = new BehaviorSubject<HashMap<P>>({});
	protected readonly _coords$ = new BehaviorSubject<Coords>({ x: 0, y: 0 });
	protected readonly _dimensions$ = new BehaviorSubject<Dimensions>({ width: 0, height: 0 });

	protected readonly diagramEngine$ = this._diagramEngine$.pipe(this.entityPipe('diagramEngine'));
	protected readonly extras$ = this._extras$.pipe(this.entityPipe('extras'));
	protected readonly ports$ = this._ports$.pipe(this.entityPipe('ports'));
	protected readonly coords$ = this._coords$.pipe(this.entityPipe('coords'));
	protected readonly dimensions$ = this._dimensions$.pipe(this.entityPipe('dimensions'));

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

	getDiagramEngine() {
		return this._diagramEngine$.getValue();
	}

	selectDiagramEngine() {
		return this.diagramEngine$;
	}

	setDiagramEngine(diagramEngine: DiagramEngine) {
		this._diagramEngine$.next(diagramEngine);
	}

	getCoords(): Coords {
		return this._coords$.getValue();
	}

	setCoords({ x, y }: Coords) {
		const { x: oldX, y: oldY } = this.getCoords();

		Object.values(this._ports$.getValue()).forEach(port => {
			Object.values(port.getLinks()).forEach(link => {
				const point = link.getPointForPort(port);
				const { x: pointX, y: pointY } = point.getCoords();
				point.setCoords({ x: pointX + x - oldX, y: pointY + y - oldY });
			});
		});

		this._coords$.next({ x, y });
	}

	serialize(): SerializedNodeModel {
		const serializedPorts = Object.values(this.getPorts()).map((port: P) => port.serialize());
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
			Object.values(this._ports$.getValue()).forEach(port => {
				const links = Object.values(port.getLinks());
				entities = entities.concat(
					links.map(link => {
						return link.getPointForPort(port);
					})
				);
			});
		}

		this.log('selectedEntities', entities);
		return entities;
	}

	// TODO: map to BaseEvent
	coordsChanges(): Observable<Coords> {
		return this.coords$;
	}

	selectCoords(): Observable<Coords> {
		return this.coords$;
	}

	selectX(): Observable<number> {
		return this.coords$.pipe(map(c => c.x));
	}

	selectY(): Observable<number> {
		return this.coords$.pipe(map(c => c.y));
	}

	/**
	 * Assign a port to the node and set the node as its getParent
	 * @returns the inserted port
	 */
	addPort(port: P): P {
		port.setParent(this);
		this._ports$.next({ ...this._ports$.getValue(), [port.id]: port });
		return port;
	}

	removePort(port: P): string {
		const updatedPorts = this._ports$.getValue();

		delete updatedPorts[port.id];
		this._ports$.next({ ...updatedPorts });

		port.destroy();

		return port.id;
	}

	getPort(id: ID): P {
		return this._ports$.value[id];
	}

	selectPorts(selector?: () => boolean | ID | ID[]): Observable<P[]> {
		// TODO: implement selector
		// TODO: create coerce func
		return this.ports$.pipe(
			map(ports => mapToArray(ports)),
			this.withLog('selectPorts')
		);
	}

	getPorts(): HashMap<P | P[]> {
		return this._ports$.getValue();
	}

	setDimensions({ width, height }: Dimensions) {
		this._dimensions$.next({ width, height });
	}

	getDimensions(): Dimensions {
		return this._dimensions$.getValue();
	}

	// TODO: return BaseEvent extension
	dimensionChanges(): Observable<Dimensions> {
		return this.dimensions$;
	}

	getHeight(): number {
		return this._dimensions$.getValue().height;
	}

	setHeight(height: number) {
		return this._dimensions$.next({ width: this.getWidth(), height });
	}

	getWidth(): number {
		return this._dimensions$.getValue().width;
	}

	setWidth(width: number) {
		return this._dimensions$.next({ width, height: this.getHeight() });
	}

	selectWidth(): Observable<number> {
		return this.dimensions$.pipe(
			map(d => d.width),
			this.withLog('selectWidth')
		);
	}

	selectHeight(): Observable<number> {
		return this.dimensions$.pipe(
			map(d => d.height),
			this.withLog('selectHeight')
		);
	}

	setExtras(extras: any) {
		this._extras$.next(extras);
	}

	getExtras() {
		return this._extras$.getValue();
	}

	selectExtras<E = any>(selector?: (extra: E) => E[keyof E] | string | string[]) {
		// TODO: impl selector
		return this.extras$;
	}
}
