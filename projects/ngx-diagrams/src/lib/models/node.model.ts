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
		const oldX = this.x$.getValue();
		const oldY = this.y$.getValue();

		Object.values(this.ports$.getValue()).forEach(port => {
			Object.values(port.getLinks()).forEach(link => {
				const point = link.getPointForPort(port);
				point.setX(point.getX() + x - oldX);
				point.setY(point.getY() + y - oldY);
			});
		});

		this.x$.next(x);
		this.y$.next(y);
	}

	getSelectedEntities() {
		let entities = super.getSelectedEntities();

		// add the points of each link that are selected here
		if (this.getSelected()) {
			Object.values(this.ports$.getValue()).forEach(port => {
				const links = Object.values(port.getLinks());
				entities = entities.concat(
					links.map(link => {
						return link.getPointForPort(port);
					})
				);
			});
		}
		return entities;
	}

	setX(x: number) {
		this.x$.next(x);
	}

	setY(y: number) {
		this.y$.next(y);
	}

	getX() {
		return this.x$.getValue();
	}

	getY() {
		return this.y$.getValue();
	}

	selectX() {
		return this.x$.asObservable();
	}

	selectY() {
		return this.y$.asObservable();
	}

	/**
	 * Assign a port to the node and set the node as its getParent
	 * @returns the inserted port
	 */
	addPort<T extends PortModel>(port: T): T {
		port.setParent(this);
		this.ports$.next({ ...this.ports$.value, [port.id]: port });
		return port;
	}

	getPort(id: string): PortModel {
		return this.ports$.value[id];
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
