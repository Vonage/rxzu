import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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

	constructor(private cdRef: ChangeDetectorRef) {
		super('ngdx-default-link');
	}

	ngAfterViewInit() {
		const lastPX$ = this.getLastPoint().selectX();
		const lastPY$ = this.getLastPoint().selectY();

		const firstPX$ = this.getFirstPoint().selectX();
		const firstPY$ = this.getFirstPoint().selectY();

		combineLatest(lastPX$, lastPY$, firstPX$, firstPY$).subscribe(([lastPX, lastPY, firstPX, firstPY]) => {
			const points = [{ x: firstPX, y: firstPY }, { x: lastPX, y: lastPY }];

			const isHorizontal = Math.abs(firstPX - lastPX) > Math.abs(firstPY - lastPY);
			const xOrY = isHorizontal ? 'x' : 'y';

			// draw the smoothing
			// if the points are too close, just draw a straight line
			let isStraight = false;
			if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
				isStraight = true;
			}

			const path = generateCurvePath({ x: firstPX, y: firstPY }, { x: lastPX, y: lastPY }, isStraight ? 0 : this.curvyness);
			this.path$.next(path);
			this.cdRef.detectChanges();
		});
	}
}
