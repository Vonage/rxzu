import { Component, AfterViewInit } from '@angular/core';
import { DefaultLinkModel } from '../../models/default-link.model';
import { generateCurvePath } from '../../../utils/tool-kit.util';
import { combineLatest, BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ngdx-default-link',
	templateUrl: './default-link.component.html',
	styleUrls: ['./default-link.component.scss']
})
export class DefaultLinkComponent extends DefaultLinkModel implements AfterViewInit {
	path$: BehaviorSubject<string> = new BehaviorSubject(null);

	constructor() {
		super('ngdx-default-link');
	}

	ngAfterViewInit() {
		const lastPX$ = this.getLastPoint().selectX();
		const lastPY$ = this.getLastPoint().selectY();

		const firstPX$ = this.getFirstPoint().selectX();
		const firstPY$ = this.getFirstPoint().selectY();

		combineLatest(lastPX$, lastPY$, firstPX$, firstPY$).subscribe(([lastPX, lastPY, firstPX, firstPY]) => {
			const path = generateCurvePath({ x: firstPX, y: firstPY }, { x: lastPX, y: lastPY }, this.curvyness);
			this.path$.next(path);
		});
	}
}
