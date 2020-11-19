import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Coords } from '../interfaces/coords.interface';
import { SerializedLabelModel } from '../interfaces/serialization.interface';

export class LabelModel extends BaseModel<LinkModel> {
	private readonly _coords: BehaviorSubject<Coords> = new BehaviorSubject<Coords>({ x: 0, y: 0 });
	private readonly _rotation: BehaviorSubject<number> = new BehaviorSubject(0);

	private readonly coords$: Observable<Coords> = this._coords.pipe(this.entityPipe('coords'));
	private readonly rotation$: Observable<number> = this._rotation.pipe(this.entityPipe('rotation'));

	constructor(type?: string, id?: string, logPrefix: string = '[Label]') {
		super(type, id, logPrefix);
	}

	serialize(): SerializedLabelModel {
		return {
			...super.serialize(),
			type: this.getType(),
			rotation: this.getRotation(),
			coords: this.getCoords(),
		};
	}

	getRotation() {
		return this._rotation.getValue();
	}

	getCoords() {
		return this._coords.getValue();
	}

	destroy() {
		super.destroy();
	}

	setRotation(angle: number) {
		this._rotation.next(angle);
	}

	selectRotation(): Observable<number> {
		return this.rotation$;
	}

	setCoords(newCoords: Partial<Coords>) {
		this._coords.next({ ...this._coords.getValue(), ...newCoords });
	}

	selectCoords(): Observable<Coords> {
		return this.coords$;
	}
}
