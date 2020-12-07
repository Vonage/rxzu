import { BehaviorSubject, Observable } from 'rxjs';
import { LinkModel } from '../../models/link.model';

export class DefaultLinkModel extends LinkModel {
	private _width$ = new BehaviorSubject(3);
	private _color$ = new BehaviorSubject('rgba(255,255,255,0.5)');
	private _curvyness$ = new BehaviorSubject(50);

	width$ = this._width$.asObservable().pipe(this.entityPipe('width'));
	color$ = this._color$.asObservable().pipe(this.entityPipe('color'));
	curvyness$ = this._curvyness$.asObservable().pipe(this.entityPipe('curvyness'));

	constructor({ type = 'default', id, logPrefix = '[DefaultLink]' }: { type?: string; id?: string; logPrefix?: string } = {}) {
		super(type, id, logPrefix);
	}

	setWidth(width: number) {
		this._width$.next(width);
	}

	setColor(color: string) {
		this._color$.next(color);
	}

	selectWidth(): Observable<number> {
		return this.width$;
	}

	selectColor(): Observable<string> {
		return this.color$;
	}

	setCurvyness(curvyness: number) {
		this._curvyness$.next(curvyness);
	}

	get color() {
		return this._color$.getValue();
	}

	get width() {
		return this._width$.getValue();
	}

	get curvyness() {
		return this._curvyness$.getValue();
	}
}
