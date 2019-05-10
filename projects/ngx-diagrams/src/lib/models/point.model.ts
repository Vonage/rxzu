import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';

export class PointModel extends BaseModel<LinkModel> {
	private x$: BehaviorSubject<number>;
	private y$: BehaviorSubject<number>;

	constructor(link: LinkModel, points: { x: number; y: number }) {
		super();
		this.x$ = new BehaviorSubject(points.x);
		this.y$ = new BehaviorSubject(points.y);
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

	selectX(): Observable<number> {
		return this.x$.asObservable();
	}

	getX(): number {
		return this.x$.getValue();
	}

	selectY(): Observable<number> {
		return this.y$.asObservable();
	}

	getY(): number {
		return this.y$.getValue();
	}

	setX(x: number) {
		this.x$.next(x);
	}

	setY(y: number) {
		this.y$.next(y);
	}

	updateLocation(points: { x: number; y: number }) {
		this.setX(points.x);
		this.setY(points.y);
	}
}
