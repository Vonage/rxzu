import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Coords, createValueState, DefaultLinkModel, generateCurvePath, PointModel } from '@rxzu/core';
import { combineLatest, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'custom-link',
  templateUrl: './custom-link.component.html',
  styleUrls: ['./custom-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CustomLinkComponent extends DefaultLinkModel implements AfterViewInit {
  @ViewChild('labelLayer', { read: ViewContainerRef, static: true })
  labelLayer: ViewContainerRef;

  path$ = createValueState<string>(null, this.entityPipe('path'));
  points$ = createValueState<PointModel[]>([], this.entityPipe('points'));

  constructor(private cdRef: ChangeDetectorRef) {
    super({ type: 'custom-link', logPrefix: '[CustomLink]' });
  }

  trackByPoints(i: number, point: PointModel) {
    return point.id;
  }

  ngOnInit() {
    this.setPainted(true);
  }

  ngAfterViewInit() {
    const firstPCoords$ = this.getFirstPoint().selectCoords();
    const lastPCoords$ = this.getLastPoint().selectCoords();

    // Observe link coords and update drawing accordingly
    combineLatest([firstPCoords$, lastPCoords$])
      .pipe(takeUntil(this.onEntityDestroy()))
      .subscribe(([firstPCoords, lastPCoords]) => {
        const points = [firstPCoords, lastPCoords];

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

        const label = this.getLabel();

        // update label position
        if (label) {
          label.setCoords(this.calcCenterOfPath());
        }

        this.cdRef.detectChanges();
      });

    this.setPainted(true);
  }

  calcLabelIncline(firstPoint: Coords, secondPoint: Coords): number {
    const dy = secondPoint.y - firstPoint.y;
    const dx = secondPoint.x - firstPoint.x;

    if (dx === 0) {
      return 0;
    }

    let inclineAngle = (Math.atan(dy / dx) * 180) / Math.PI;

    if (inclineAngle < 0) {
      inclineAngle += 180;
    }

    return inclineAngle;
  }

  calcCenterOfPath(): Coords {
    const firstPointCoords = this.getFirstPoint().getCoords();
    const lastPointCoords = this.getLastPoint().getCoords();
    return { x: (firstPointCoords.x + lastPointCoords.x) / 2, y: (firstPointCoords.y + lastPointCoords.y) / 2 };
  }

  selectPath(): Observable<string> {
    return this.path$.value$;
  }

  deleteLink() {
    this.destroy();
  }
}
