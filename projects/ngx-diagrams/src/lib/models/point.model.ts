import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { map } from 'rxjs/operators';
import { SerializedPointModel } from '../interfaces/serialization.interface';

export class PointModel extends BaseModel<LinkModel> {
	private readonly _coords: BehaviorSubject<Coords>;
	private readonly coords$: Observable<Coords>;

	constructor(link: LinkModel, { x, y }: Coords, id?: string, logPrefix: string = '[Point]') {
		super(link.getType(), id, logPrefix);
		this._coords = new BehaviorSubject<Coords>({ x, y });
		this.coords$ = this._coords.pipe(this.entityPipe('coords'));
		this.setParent(link);
	}

	serialize(): SerializedPointModel {
		return {
			...super.serialize(),
			coords: this.getCoords(),
		};
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
		return this.coords$;
	}

	getCoords(): Coords {
		return this._coords.getValue();
	}

	selectX(): Observable<number> {
		return this.selectCoords().pipe(map(c => c.x));
	}

	selectY(): Observable<number> {
		return this.selectCoords().pipe(map(c => c.y));
	}
}
