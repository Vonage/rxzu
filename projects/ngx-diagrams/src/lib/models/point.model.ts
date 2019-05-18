import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

export class PointModel extends BaseModel<LinkModel> {
	private readonly _coords: BehaviorSubject<Coords>;
	private readonly coords$: Observable<Coords>;

	constructor(link: LinkModel, { x, y }: Coords) {
		super();
		this._coords = new BehaviorSubject<Coords>({ x, y });
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

	setCoords(newCoords: Partial<Coords>) {
		this._coords.next({ ...this._coords.getValue(), ...newCoords });
	}

	selectCoords(): Observable<Coords> {
		return this.coords$.pipe(
			takeUntil(this.onEntityDestroy()),
			distinctUntilChanged()
		);
	}

	getCoords(): Coords {
		return this._coords.getValue();
	}

	selectX(): Observable<number> {
		return this.selectCoords().pipe(
			map(c => c.x),
			distinctUntilChanged()
		);
	}

	selectY(): Observable<number> {
		return this.selectCoords().pipe(
			map(c => c.y),
			distinctUntilChanged()
		);
	}
}
