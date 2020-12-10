import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Coords } from '../../../interfaces';
import { LabelModel } from '../../../models/label.model';
import { PointModel } from '../../../models/point.model';
import { PathFinding } from '../../../plugins/smart-routing.plugin';
import { createValueState } from '../../../utils';
import { generateCurvePath, generateDynamicPath } from '../../../utils/tool-kit.util';
import { DefaultLinkModel } from '../../models/default-link.model';

@Component({
	selector: 'ngdx-default-link',
	templateUrl: './default-link.component.html',
	styleUrls: ['./default-link.component.scss'],
})
export class DefaultLinkComponent extends DefaultLinkModel implements AfterViewInit, OnInit {
	@ViewChild('labelLayer', { read: ViewContainerRef, static: true })
	labelLayer: ViewContainerRef;

	path$ = createValueState<string>(null, this.entityPipe('path'));
	points$ = createValueState<PointModel[]>([], this.entityPipe('points'));

	pathFinding: PathFinding; // only set when smart routing is active

	constructor(private cdRef: ChangeDetectorRef) {
		super({ type: 'ngdx-default-link' });
	}

	trackByPoints(i: number, point: PointModel) {
		return point.id;
	}

	ngOnInit() {
		if (this.diagramEngine.getSmartRouting()) {
			this.pathFinding = this.diagramEngine.getPathfinding();
		}
	}

	ngAfterViewInit() {
		const firstPCoords$ = this.getFirstPoint().selectCoords();
		const lastPCoords$ = this.getLastPoint().selectCoords();

		// Observe link coords and update drawing accordingly
		combineLatest([firstPCoords$, lastPCoords$])
			.pipe(takeUntil(this.onEntityDestroy()))
			.subscribe(([firstPCoords, lastPCoords]) => {
				const points = [firstPCoords, lastPCoords];

				if (this.diagramEngine.getSmartRouting()) {
					// first step: calculate a direct path between the points being linked
					const directPathCoords = this.pathFinding.calculateDirectPath(firstPCoords, lastPCoords);
					const routingMatrix = this.diagramEngine.getRoutingMatrix();

					// now we need to extract, from the routing matrix, the very first walkable points
					// so they can be used as origin and destination of the link to be created
					const smartLink = this.pathFinding.calculateLinkStartEndCoords(routingMatrix, directPathCoords);

					if (smartLink) {
						const { start, end, pathToStart, pathToEnd } = smartLink;
						// second step: calculate a path avoiding hitting other elements
						const simplifiedPath = this.pathFinding.calculateDynamicPath(routingMatrix, start, end, pathToStart, pathToEnd);
						const smartPath = generateDynamicPath(simplifiedPath);
						this.path$.set(smartPath).emit();
					}
				} else {
					// handle regular links
					// draw the smoothing
					// if the points are too close, just draw a straight line
					const isHorizontal = Math.abs(firstPCoords.x - lastPCoords.x) > Math.abs(firstPCoords.y - lastPCoords.y);
					const xOrY = isHorizontal ? 'x' : 'y';
					let isStraight = false;
					if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
						isStraight = true;
					}

					const path = generateCurvePath(firstPCoords, lastPCoords, isStraight ? 0 : this.curvyness);
					this.path$.set(path).emit();
				}

				const label = this.getLabel();
				// update label position
				if (label) {
					label.setCoords(this.calcCenterOfPath(firstPCoords, lastPCoords));

					// TODO: check whether we want the label to rotate along with the line
					// label.setRotation(this.calcLabelIncline(firstPCoords, lastPCoords));
				}

				// TODO: handle the multiple lines in between the points
				// https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/widgets/DefaultLinkWidget.tsx#L344-L371

				this.cdRef.detectChanges();
			});

		// observe link label and draw/remove accordingly
		this.selectLabel()
			.pipe(filter(Boolean))
			.subscribe((label: LabelModel) => {
				this.diagramEngine.generateWidgetForLabel(label, this.labelLayer);
				this.cdRef.detectChanges();
			});
	}

	calcLabelIncline(firstPoint: Coords, secondPoint: Coords): number {
		const dy = secondPoint.y - firstPoint.y;
		const dx = secondPoint.x - firstPoint.x;

		if (dx === 0) {
			return 0;
		}

		let inclineAngel = (Math.atan(dy / dx) * 180) / Math.PI;

		if (inclineAngel < 0) {
			inclineAngel += 180;
		}

		return inclineAngel;
	}

	calcCenterOfPath(firstPoint: Coords, secondPoint: Coords): Coords {
		return { x: (firstPoint.x + secondPoint.x) / 2 + 20, y: (firstPoint.y + secondPoint.y) / 2 + 20 };
	}

	selectPath(): Observable<string> {
		return this.path$.value$;
	}
}
