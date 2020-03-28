import { LinkModel } from '../../models/link.model';
import { BehaviorSubject } from 'rxjs';

export class DefaultLinkModel extends LinkModel {
	width$: BehaviorSubject<number>;
	color$: BehaviorSubject<string>;
	curvyness$: BehaviorSubject<number>;

	constructor(type: string = 'default') {
		super(type);
		this.color$ = new BehaviorSubject('rgba(255,255,255,0.5)');
		this.width$ = new BehaviorSubject(3);
		this.curvyness$ = new BehaviorSubject(50);
	}

	setWidth(width: number) {
		this.width$.next(width);
	}

	setColor(color: string) {
		this.color$.next(color);
	}

	setCurvyness(curvyness: number) {
		this.curvyness$.next(curvyness);
	}

	get color() {
		return this.color$.getValue();
	}

	get width() {
		return this.width$.getValue();
	}

	get curvyness() {
		return this.curvyness$.getValue();
	}
}
