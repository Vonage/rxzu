import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class PointModel extends BaseModel<LinkModel> {
	x: number;
	y: number;

	constructor(link: LinkModel, points: { x: number; y: number }) {
		super();
		this.x = points.x;
		this.y = points.y;
		this.parent = link;
	}

	isConnectedToPort() {
		return this.parent.getPortForPoint(this) !== null;
	}

	getLink(): LinkModel {
		return this.parent;
	}

	remove() {
		if (this.parent) {
			this.parent.removePoint(this);
		}

		super.remove();
	}

	getX(): number {
		return this.x;
	}

	getY(): number {
		return this.y;
	}
}
