import { LinkModel } from '../../models/link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, takeUntil } from 'rxjs/operators';

export class DefaultLinkModel extends LinkModel {
	private _width$: BehaviorSubject<number> = new BehaviorSubject(3);
	private _color$: BehaviorSubject<string> = new BehaviorSubject('rgba(255,255,255,0.5)');
	private _curvyness$: BehaviorSubject<number> = new BehaviorSubject(50);
	width$: Observable<number> = this._width$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));
	color$: Observable<string> = this._color$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));
	curvyness$: Observable<number> = this._curvyness$.pipe(takeUntil(this.onEntityDestroy()), distinctUntilChanged(), shareReplay(1));

	constructor({ type = 'default' }: { type?: string } = {}) {
		super(type);
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
