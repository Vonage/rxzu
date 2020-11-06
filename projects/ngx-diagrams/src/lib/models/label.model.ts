import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

export class LabelModel extends BaseModel<LinkModel> {
	private readonly _coords: BehaviorSubject<Coords>;
	private readonly coords$: Observable<Coords>;

	private readonly _rotation: BehaviorSubject<number>;
	private readonly rotation$: Observable<number>;

	constructor(type?: string, id?: string) {
		super(type, id);
		this._coords = new BehaviorSubject<Coords>({ x: 0, y: 0 });
		this.coords$ = this._coords.asObservable();

		this._rotation = new BehaviorSubject(0);
		this.rotation$ = this._rotation.asObservable();
	}

	destroy() {
		super.destroy();
	}

	setRotation(angle: number) {
		this._rotation.next(angle);
	}

	selectRotation(): Observable<number> {
		return this.rotation$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged());
	}

	setCoords(newCoords: Partial<Coords>) {
		this._coords.next({ ...this._coords.getValue(), ...newCoords });
	}

	selectCoords(): Observable<Coords> {
		return this.coords$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged());
	}
}
