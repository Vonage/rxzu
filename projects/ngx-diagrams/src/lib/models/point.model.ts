import { BaseModel } from './base.model';
import { LinkModel } from './link.model';

export class PointModel extends BaseModel<LinkModel> {
	x: number;
	y: number;

	constructor(link: LinkModel, points: { x: number; y: number }) {
		super();
		this.x = points.x;
		this.y = points.y;
		this.setParent(link);
	}

	isConnectedToPort() {
		return this.getParent().getPortForPoint(this) !== null;
	}

	getLink(): LinkModel {
		return this.getParent();
	}

	remove() {
		if (this.getParent()) {
			this.getParent().removePoint(this);
		}

		super.remove();
	}

	getX(): number {
		return this.x;
	}

	getY(): number {
		return this.y;
	}

	isLocked() {
		return this.isLocked() || this.getParent().isLocked();
	}
}
