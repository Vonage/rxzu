import { Component, AfterViewInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DefaultLinkModel, PointModel, generateCurvePath, Coords } from 'ngx-diagrams';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';

@Component({
	selector: 'custom-link',
	templateUrl: './custom-link.component.html',
	styleUrls: ['./custom-link.component.scss'],
})
export class CustomLinkComponent extends DefaultLinkModel implements AfterViewInit {
	@ViewChild('labelLayer', { read: ViewContainerRef, static: true }) labelLayer: ViewContainerRef;

	_path$: BehaviorSubject<string> = new BehaviorSubject(null);
	path$: Observable<string> = this._path$.asObservable();
	points$: BehaviorSubject<PointModel[]> = new BehaviorSubject([]);

	constructor() {
		super('custom-link');
	}

	ngAfterViewInit() {
		const firstPCoords$ = this.getFirstPoint().selectCoords();
		const lastPCoords$ = this.getLastPoint().selectCoords();

		combineLatest([firstPCoords$, lastPCoords$]).subscribe(([firstPCoords, lastPCoords]) => {
			const points = [firstPCoords, lastPCoords];

			const isHorizontal = Math.abs(firstPCoords.x - lastPCoords.x) > Math.abs(firstPCoords.y - lastPCoords.y);
			const xOrY = isHorizontal ? 'x' : 'y';

			// draw the smoothing
			// if the points are too close, just draw a straight line
			let isStraight = false;
			if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 150) {
				isStraight = true;
			}

			const path = generateCurvePath(firstPCoords, lastPCoords, isStraight ? 0 : 200);
			this._path$.next(path);

			if (!this.getTargetPort()) {
				const danglingPoint = this.generatePoint(lastPCoords);
				this.points$.next([danglingPoint]);
			}
		});
	}

	calcCenterOfPath(firstPoint: Coords, secondPoint: Coords): Coords {
		return { x: (firstPoint.x + secondPoint.x) / 2, y: (firstPoint.y + secondPoint.y) / 2 };
	}
}
