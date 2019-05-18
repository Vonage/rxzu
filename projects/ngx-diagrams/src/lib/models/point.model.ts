import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coordinates } from '../interfaces/coords.interface';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

export class PointModel extends BaseModel<LinkModel> {
	private readonly _coords: BehaviorSubject<Coordinates>;
	private readonly coords$: Observable<Coordinates>;

	constructor(link: LinkModel, { x, y }: Coordinates) {
		super();
		this._coords = new BehaviorSubject<Coordinates>({ x, y });
		this.coords$ = this._coords.asObservable();
		this.setParent(link);
	}

	isConnectedToPort() {
		return this.getParent().getPortForPoint(this) !== null;
	}

	getLink(): LinkModel {
		return this.getParent();
	}

	destroy() {
		if (this.getParent) {
			this.getParent().removePoint(this);
		}

		super.destroy();
	}

	selectX(): Observable<number> {
		return this.coords$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(c => c.x),
			distinctUntilChanged()
		);
	}

	selectY(): Observable<number> {
		return this.coords$.pipe(
			takeUntil(this.onEntityDestroy()),
			map(c => c.y),
			distinctUntilChanged()
		);
	}

	setCoords(newCoords: Partial<Coordinates>) {
		this._coords.next({ ...this._coords.getValue(), ...newCoords });
	}

	getCoords(): Coordinates {
		return this._coords.getValue();
	}
}
