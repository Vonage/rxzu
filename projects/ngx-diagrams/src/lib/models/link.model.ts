import { BaseModel, BaseModelState } from './base.model';
import { DiagramModel } from './diagram.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import { ID, IDS } from '../interfaces/types';
import { Coords } from '../interfaces/coords.interface';
import { mapToArray } from '../utils/tool-kit.util';

export interface LinkModelState<S = any, P extends PointModel = PointModel> {
	ports: { [id: string]: { parentId: ID; io: 'in' | 'out' } };
	points: P[];
}

const DEFAULT_STATE: Partial<LinkModelState> = {
	ports: {},
	points: []
};

export class LinkModel<S = any, P extends PointModel = PointModel> extends BaseModel<LinkModelState<S, P>> {
	private name: string;

	constructor(linkType: string, id?: string, initialState?: Partial<S>, logPrefix = '[Link]') {
		super(linkType, id, { ...DEFAULT_STATE, ...initialState, points: [new PointModel(), new PointModel()] }, logPrefix);
	}

	setName(name: string) {
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	doClone(lookupTable = {}, clone) {
		const { points } = this.get();
		clone.update({ points: points.map((point: PointModel) => point.clone(lookupTable)) });
	}

	getPorts(io: 'in' | 'out'): { id: ID; parentId: ID; io: 'in' | 'out' }[] {
		return mapToArray(this.get('ports'), true).filter(val => val.io === io);
	}

	getPortIds(io: 'in' | 'out'): ID[] {
		return this.getPorts(io).map(p => p.id);
	}

	hasPort(port: PortModel, io: 'in' | 'out'): boolean {
		const { ports } = this.get();
		return ports[port.id] && ports[port.id].io === io;
	}

	getSourcePortInfo(): { id: ID; parentId: ID } | null {
		return this.getPorts('out')[0];
	}

	getTargetPortInfo(): { id: ID; parentId: ID } | null {
		return this.getPorts('in')[0];
	}

	isLastPoint(point: P) {
		const index = this.getPointIndex(point);
		return index === this.get(s => s.points).length - 1;
	}

	getPointIndex(point: P) {
		return this.get(s => s.points).indexOf(point);
	}

	getPointModel(id: ID): P | null {
		for (const point of this.get(s => s.points)) {
			if (point.id === id) {
				return point;
			}
		}
		return null;
	}

	getFirstPoint(): PointModel {
		return this.get(s => s.points)[0];
	}

	getLastPoint(): PointModel {
		const { points } = this.get();
		return points[points.length - 1];
	}

	setPorts(...newPorts: PortModel[]): void {
		const { ports } = this.get();
		newPorts.forEach(port => {
			if (ports[port.id] !== null) {
				port.removeLink(this.id);
				delete ports[port.id];
			} else {
				const sourceOrTarget = this.getPorts(port.get('io'))[0];
				if (sourceOrTarget) {
					delete ports[sourceOrTarget.id];
				}
				port.addLink(this.id);
				ports[port.id] = { parentId: port.getParentId(), io: port.get('io') };
			}
		});

		this.update({ ports } as Partial<LinkModelState<S, P>>);
	}

	point({ x, y }: Coords): P {
		return this.addPoint(this.generatePoint({ x, y }));
	}

	getPoints(): P[] {
		return this.get('points');
	}

	setPoints(...points: P[]) {
		points.forEach(point => {
			point.update({});
		});
		this.update({ points } as Partial<LinkModelState<S, P>>);
	}

	removePoint(pointModel: P) {
		const points = this.get('points');
		points.splice(this.getPointIndex(pointModel), 1);
		this.update({ points } as Partial<LinkModelState<S, P>>);
	}

	removePointsBefore(pointModel: P) {
		const points = this.get('points');
		points.splice(0, this.getPointIndex(pointModel));
		this.update({ points } as Partial<LinkModelState<S, P>>);
	}

	removePointsAfter(pointModel: P) {
		const points = this.get('points');
		points.splice(this.getPointIndex(pointModel) + 1);
		this.update({ points } as Partial<LinkModelState<S, P>>);
	}

	removeMiddlePoints() {
		const points = this.get('points');
		if (points.length > 2) {
			points.splice(0, points.length - 2);
		}
	}

	addPoint(pointModel: P, index = 1): P {
		const points = this.get('points');
		points.splice(index, 0, pointModel);
		this.update({ points } as Partial<LinkModelState<S, P>>);
		return pointModel;
	}

	generatePoint({ x = 0, y = 0 }: Coords): P {
		return new PointModel({ coords: { x, y }, parentId: this.id }) as P;
	}
}
