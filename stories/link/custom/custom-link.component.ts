import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Coords, DefaultLinkModel, generateCurvePath } from 'ngx-diagrams';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'custom-link',
	templateUrl: './custom-link.component.html',
	styleUrls: ['./custom-link.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomLinkComponent extends DefaultLinkModel implements AfterViewInit {
	@ViewChild('labelLayer', { read: ViewContainerRef, static: true })
	labelLayer: ViewContainerRef;

	_path$: BehaviorSubject<string> = new BehaviorSubject('');
	path$ = this._path$.pipe(
		this.entityPipe('path'),
		tap(() => this.cd.detectChanges())
	);

	hover = false;

	constructor(private cd: ChangeDetectorRef) {
		super({ type: 'custom-link', logPrefix: '[CustomLink]' });
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
		});
	}

	calcCenterOfPath(): Coords {
		const firstPointCoords = this.getFirstPoint().getCoords();
		const lastPointCoords = this.getLastPoint().getCoords();
		return { x: (firstPointCoords.x + lastPointCoords.x) / 2, y: (firstPointCoords.y + lastPointCoords.y) / 2 };
	}

	deleteLink() {
		this.destroy();
	}
}
