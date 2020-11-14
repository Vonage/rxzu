import { BehaviorSubject, Observable } from 'rxjs';
import { PortModel } from './port.model';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { Coords } from '../interfaces/coords.interface';
import { DiagramEngine } from '../services/engine.service';
import { distinctUntilChanged, map, shareReplay, takeUntil } from 'rxjs/operators';
import { Dimensions } from '../interfaces/dimensions.interface';
import { ID, mapToArray } from '../utils/tool-kit.util';
import { SerializedNodeModel } from '../interfaces/serialization.interface';

export class NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
	private readonly _diagramEngine$: BehaviorSubject<DiagramEngine> = new BehaviorSubject<DiagramEngine>(null);
	private readonly _extras$: BehaviorSubject<{ [s: string]: any }> = new BehaviorSubject({});
	private readonly _ports$: BehaviorSubject<{ [s: string]: P }> = new BehaviorSubject({});
	private readonly _coords$: BehaviorSubject<Coords> = new BehaviorSubject<Coords>({ x: 0, y: 0 });
	private readonly _dimensions$: BehaviorSubject<Dimensions> = new BehaviorSubject<Dimensions>({ width: 0, height: 0 });

	private readonly diagramEngine$: Observable<{ [s: string]: any }> = this._diagramEngine$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);
	private readonly extras$: Observable<{ [s: string]: any }> = this._extras$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);
	private readonly ports$: Observable<{ [s: string]: P }> = this._ports$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);
	private readonly coords$: Observable<Coords> = this._coords$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);
	private readonly dimensions$: Observable<Dimensions> = this._dimensions$.pipe(
		takeUntil(this.onEntityDestroy()),
		distinctUntilChanged(),
		shareReplay(1)
	);

	constructor(
		nodeType: string = 'default',
		id?: string,
		extras: { [s: string]: any } = {},
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

	// TODO: implement better transition on auto arrange!
	transitionToCoords({ x, y }: Coords) {
		// const transitionCompleted = new ReplaySubject(1);
		// let { x: oldX, y: oldY } = this.getCoords();
		// console.log(x, y, oldX, oldY);
		// interval(0)
		// 	.pipe(takeUntil(transitionCompleted))
		// 	.subscribe(
		// 		() => {
		// 			if (oldX < x) {
		// 				oldX++;
		// 			} else if (oldX > x) {
		// 				oldX--;
		// 			}
		// 			if (y > oldY) {
		// 				oldY++;
		// 			} else if (y < oldY) {
		// 				oldY--;
		// 			}
		// 			Object.values(this._ports.getValue()).forEach(port => {
		// 				Object.values(port.getLinks()).forEach(link => {
		// 					const point = link.getPointForPort(port);
		// 					const { x: pointX, y: pointY } = point.getCoords();
		// 					point.setCoords({ x: pointX + x - oldX, y: pointY + y - oldY });
		// 				});
		// 			});
		// 			this._coords.next({ x: oldX, y: oldY });
		// 			if (x === oldX && y === oldY) {
		// 				transitionCompleted.next(true);
		// 				transitionCompleted.complete();
		// 			}
		// 		},
		// 		err => {
		// 			console.error(err);
		// 		},
		// 		() => {
		// 			console.log('finished transition');
		// 		}
		// 	);
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
		return this.coords$.pipe(takeUntil(this.onEntityDestroy()));
	}

	selectCoords(): Observable<Coords> {
		return this.coords$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged());
	}

	selectX(): Observable<number> {
		return this.selectCoords().pipe(
			map(c => c.x),
			this.withLog('selectX'),
			distinctUntilChanged()
		);
	}

	selectY(): Observable<number> {
		return this.selectCoords().pipe(
			map(c => c.y),
			this.withLog('selectY'),
			distinctUntilChanged()
		);
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
			takeUntil(this.onEntityDestroy()),
			distinctUntilChanged(),
			map(ports => mapToArray(ports)),
			this.withLog('selectPorts')
		);
	}

	getPorts(ids?: ID[]): { [s: string]: P | P[] } {
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
		return this.dimensions$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), this.withLog('DimensionChanges'));
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
			takeUntil(this.onEntityDestroy()),
			map(d => d.width),
			distinctUntilChanged(),
			this.withLog('selectWidth')
		);
	}

	selectHeight(): Observable<number> {
		return this.dimensions$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(d => d.height),
			distinctUntilChanged(),
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
		return this.extras$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged());
	}
}
