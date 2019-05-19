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
		const firstPCoords$ = this.getFirstPoint().selectCoords();
		const lastPCoords$ = this.getLastPoint().selectCoords();

		combineLatest(firstPCoords$, lastPCoords$).subscribe(([firstPCoords, lastPCoords]) => {
			const points = [firstPCoords, lastPCoords];

			const isHorizontal = Math.abs(firstPCoords.x - lastPCoords.x) > Math.abs(firstPCoords.y - lastPCoords.y);
			const xOrY = isHorizontal ? 'x' : 'y';

			// draw the smoothing
			// if the points are too close, just draw a straight line
			let isStraight = false;
			if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
				isStraight = true;
			}

			const path = generateCurvePath(firstPCoords, lastPCoords, isStraight ? 0 : this.curvyness);
			this._path$.next(path);

			if (!this.getTargetPort()) {
				const danglingPoint = this.generatePoint(lastPCoords);
				this.points$.next([danglingPoint]);
			}

			// TODO: handle the multiple lines in between the points
			// https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/widgets/DefaultLinkWidget.tsx#L344-L371

			this.cdRef.detectChanges();
		});
	}
}
