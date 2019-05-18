import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DefaultLinkModel } from '../../models/default-link.model';
import { generateCurvePath } from '../../../utils/tool-kit.util';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { PointModel } from '../../../models/point.model';

@Component({
	selector: 'ngdx-default-link',
	templateUrl: './default-link.component.html',
	styleUrls: ['./default-link.component.scss']
})
export class DefaultLinkComponent extends DefaultLinkModel implements AfterViewInit {
	_path$: BehaviorSubject<string> = new BehaviorSubject(null);
	path$: Observable<string> = this._path$.asObservable();
	points$: BehaviorSubject<PointModel[]> = new BehaviorSubject([]);

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
			this._path$.next(path);

			if (!this.getTargetPort()) {
				const danglingPoint = this.generatePoint(lastPX, lastPY);
				this.points$.next([danglingPoint]);
			}

			// TODO: handle the multiple lines in between the points
			// https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/widgets/DefaultLinkWidget.tsx#L344-L371

			this.cdRef.detectChanges();
		});
	}
}
