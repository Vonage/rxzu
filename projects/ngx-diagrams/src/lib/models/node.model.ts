import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { PortModel } from './port.model';
import { BaseModel, BaseModelState } from './base.model';
import { DiagramModel } from './diagram.model';
import { Coords } from '../interfaces/coords.interface.js';
import { DiagramEngine } from '../services/engine.service';
import { distinctUntilChanged, flatMap, map, mergeMap, pairwise, switchMap, takeUntil } from 'rxjs/operators';
import { Dimensions } from '../interfaces/dimensions.interface';
import { createEvent, mapToArray } from '../utils/tool-kit.util';
import { ID, IDS } from '../interfaces/types';
import { BaseEntity } from '../base.entity';
import { BaseEvent } from '../interfaces/event.interface';

export type NodeModelState<S = any, P extends PortModel = PortModel> = BaseModelState<S> & {
	ports: { [id: string]: P };
	coords: Coords;
	dimensions: Dimensions;
};

const DEFAULT_STATE: Partial<NodeModelState> = {
	ports: {},
	coords: { x: 0, y: 0 },
	dimensions: { width: 0, height: 0 }
};

export class NodeModel<S = any, P extends PortModel = PortModel> extends BaseModel<NodeModelState<S, P>> {
	id: ID;
	diagramEngine: DiagramEngine;

	constructor(nodeType?: string, id?: string, initialState?: Partial<S>, logPrefix = '[Node]') {
		super(nodeType, id, { ...DEFAULT_STATE, ...initialState }, logPrefix);
	}

	onInit(id?: string, initialState?, logPrefix = '[Node]') {
		super.onInit(id, initialState, logPrefix);
		this.registerActiveListener();
	}

	registerActiveListener(): void {
		this.registerListener('active', active => mapToArray(this.get('ports')).forEach(p => p.update({ active })));
	}

	setCoords({ x, y }: Coords) {
		const {
			coords: { x: oldX, y: oldY },
			ports
		} = this.get();

		// TODO: ports and links should be connected in diagram model
		// Object.values(ports).forEach(port => {
		// 	Object.values(port.get('links')).forEach(link => {
		// 		const point = link.getPointForPort(port);
		// 		const { x: pointX, y: pointY } = point.get('coords');
		// 		point.update({ coords: { x: pointX + x - oldX, y: pointY + y - oldY }});
		// 	});
		// });

		this.update({ coords: { x, y } } as Partial<NodeModelState<S, P>>);
	}

	selectActiveItems(): Observable<BaseEntity<any>[]> {
		return combineLatest(
			super.selectActiveItems(),
			this.select(s => s.ports).pipe(
				flatMap(ports => mapToArray(ports).map(p => p.selectActiveItems())),
				flatMap(activeIds => activeIds)
			)
		).pipe(map(([active, activePorts]) => [...active, ...activePorts]));
	}

	getActiveItems() {
		// add the points of each link that are active here
		if (this.isActive()) {
			return [...super.getActiveItems(), ...this.getPorts().reduce((acc, port) => [...acc, ...port.getActiveItems()], [])];
		}

		return [];
	}

	selectPorts(id?: IDS): Observable<P[]> {
		return this.selectByIds<P>(s => s.ports, id);
	}
	getPorts(id?: IDS): P[] {
		return this.getByIds<P>(s => s.ports, id);
	}
	/**
	 * Assign a port to the node and set the node as its getParent
	 * @returns the inserted port
	 */
	addPort(port: P): P {
		port.update({ parentId: this.id });
		this.update({ ports: { ...this.get('ports'), [port.id]: port } } as Partial<NodeModelState<S, P>>);
		return port;
	}

	onDimensionChange(): Observable<BaseEvent<Dimensions>> {
		return this.select('dimensions').pipe(map(dim => createEvent(this.id, { ...dim })));
	}
}
