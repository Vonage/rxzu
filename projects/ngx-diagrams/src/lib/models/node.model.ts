import * as Toolkit from '../utils/tool-kit.util';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortModel } from './port.model';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { DiagramEngine } from '../services/engine.service';

export class NodeModel extends BaseModel<DiagramModel> {
	id: string;
	diagramEngine: DiagramEngine;

	public readonly extras$: BehaviorSubject<{ [s: string]: any }>;
	public readonly ports$: BehaviorSubject<{ [s: string]: PortModel }>;
	public readonly x$: BehaviorSubject<number>;
	public readonly y$: BehaviorSubject<number>;
	public readonly width$: BehaviorSubject<number>;
	public readonly height$: BehaviorSubject<number>;

	constructor(
		nodeType: string = 'default',
		extras: { [s: string]: any } = {},
		x: number = 0,
		y: number = 0,
		width: number = 0,
		height: number = 0,
		id?: string
	) {
		super(nodeType, id);
		this.x$ = new BehaviorSubject(x);
		this.y$ = new BehaviorSubject(y);
		this.extras$ = new BehaviorSubject(extras);
		this.ports$ = new BehaviorSubject({});
		this.width$ = new BehaviorSubject(width);
		this.height$ = new BehaviorSubject(height);
	}

	setPosition(x: number, y: number) {
		// update ports position as well
		// https://github.com/projectstorm/react-diagrams/blob/master/src/models/NodeModel.ts#L31-L44

		this.x$.next(x);
		this.y$.next(y);
	}

	setX(x: number) {
		this.x$.next(x);
	}

	setY(y: number) {
		this.y$.next(y);
	}

	selectX() {
		return this.x$.asObservable();
	}

	selectY() {
		return this.y$.asObservable();
	}

	/**
	 * Assign a port to the node and set the node as its parent
	 * @returns the inserted port
	 */
	addPort<T extends PortModel>(port: T): T {
		port.parent = this;
		this.ports$.next({ ...this.ports$.value, [port.id]: port });
		return port;
	}

	getPort(name: string): PortModel {
		return this.ports$.value[name];
	}

	selectPorts(): Observable<{ [s: string]: PortModel }> {
		return this.ports$.asObservable();
	}

	getPorts(): { [s: string]: PortModel } {
		return this.ports$.value;
	}

	getPortByID(id: string): PortModel | null {
		const ports = this.ports$.value;
		return Object.values(ports).find(port => port.id === id);
	}

	updateDimensions({ width, height }: { width: number; height: number }) {
		this.width$.next(width);
		this.height$.next(height);
	}

	selectExtras() {
		return this.extras$;
	}

	getExtras() {
		return this.extras$.value;
	}

	setExtras(extras: any) {
		this.extras$.next(extras);
	}
}
