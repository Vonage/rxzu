import * as Toolkit from '../utils/tool-kit.util';
import { BehaviorSubject } from 'rxjs';
import { PortModel } from './port.model';
import { BaseModel } from './base.model';
import { DiagramModel } from './diagram.model';
import { DiagramEngine } from '../services/engine.service';

export class NodeModel extends BaseModel<DiagramModel> {
	diagramEngine: DiagramEngine;
	x$: BehaviorSubject<number>;
	y$: BehaviorSubject<number>;
	_id: string;
	extras$: BehaviorSubject<{ [s: string]: any }>;
	ports$: BehaviorSubject<{ [s: string]: PortModel }>;

	constructor(nodeType: string = 'default', extras: { [s: string]: any } = {}, x: number = 0, y: number = 0, id?: string) {
		super(nodeType, id);
		this.x$ = new BehaviorSubject(x);
		this.y$ = new BehaviorSubject(y);
		this.extras$ = new BehaviorSubject(extras);
		this.ports$ = new BehaviorSubject({});
	}

	setPosition(x: number, y: number) {
		// update ports position as well
		// https://github.com/projectstorm/react-diagrams/blob/master/src/models/NodeModel.ts#L31-L44

		this.x$.next(x);
		this.y$.next(y);
	}

	/**
	 * Creates new port and adds it to the node, position will be
	 * decided based on the port type.
	 * @returns New port _id
	 */
	addPort(name: string, type: 'in' | 'out', id: string = Toolkit.UID()): string {
		const newPort = new PortModel(name, type, id);
		this.ports$.next({ ...this.ports$.getValue(), [newPort.id]: newPort });
		return newPort.id;
	}
}
