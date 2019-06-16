import { BaseModel, BaseModelState } from './base.model';
import { LinkModel } from './link.model';
import { Coords } from '../interfaces/coords.interface';

export type PointModelState<S = any> = BaseModelState<S> & {
	coords: Coords;
	connected: boolean;
};

const DEFAULT_STATE: PointModelState = {
	coords: { x: 0, y: 0 },
	connected: false
};

export class PointModel<S = any> extends BaseModel<PointModelState<S>> {
	constructor(initialState?: Partial<PointModelState>, type?: string, id?: string) {
		super(type, id, { ...DEFAULT_STATE, ...initialState });
	}

	isConnectedToPort() {
		return this.get('connected');
		// return this.getParent().getPortForPoint(this) !== null;
	}

	getLinkId() {
		return this.getParentId();
		// return this.getParent();
	}
}
