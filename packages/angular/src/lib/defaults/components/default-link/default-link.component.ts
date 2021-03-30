import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  OnInit,
  Optional,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { PointModel, generateCurvePath, Coords, LinkModel } from '@rxzu/core';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-link',
  templateUrl: './default-link.component.html',
  styleUrls: ['./default-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLinkComponent implements OnInit, AfterViewInit {
  @ViewChild('labelLayer', { read: ViewContainerRef, static: true })
  labelLayer!: ViewContainerRef;

  constructor(
    @Optional() @Host() @Inject(MODEL) public model: LinkModel,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.model.setPainted(true);
  }

  trackByPoints(i: number, point: PointModel) {
    return point.id;
  }

  onHover() {
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    const firstPCoords$ = this.model.getFirstPoint().selectCoords();
    const lastPCoords$ = this.model.getLastPoint().selectCoords();

    // Observe link coords and update drawing accordingly
    combineLatest([firstPCoords$, lastPCoords$])
      .pipe(takeUntil(this.model.onEntityDestroy()))
      .subscribe(([firstPCoords, lastPCoords]) => {
        const points = [firstPCoords, lastPCoords];

        // handle regular links
        // draw the smoothing
        // if the points are too close, just draw a straight line
        const isHorizontal =
          Math.abs(firstPCoords.x - lastPCoords.x) >
          Math.abs(firstPCoords.y - lastPCoords.y);
        const xOrY = isHorizontal ? 'x' : 'y';
        let isStraight = false;
        if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
          isStraight = true;
        }

        const path = generateCurvePath(
          firstPCoords,
          lastPCoords,
          isStraight ? 0 : 50
        );
        this.model.setPath(path);

        const label = this.model.getLabel();

        // update label position
        if (label) {
          label.setCoords(this.calcCenterOfPath(firstPCoords, lastPCoords));
        }

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
    return {
      x: (firstPoint.x + secondPoint.x) / 2 + 20,
      y: (firstPoint.y + secondPoint.y) / 2 + 20,
    };
  }
}
