import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Host,
  Inject,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  MODEL,
  Coords,
  LinkModel,
  generateCurvePath,
  PointModel,
} from '@rxzu/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'custom-link',
  templateUrl: './custom-link.component.html',
  styleUrls: ['./custom-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomLinkComponent implements AfterViewInit {
  @ViewChild('labelLayer', { read: ViewContainerRef, static: true })
  labelLayer!: ViewContainerRef;
  centerOfLink$: BehaviorSubject<Coords>;

  constructor(
    @Inject(MODEL) @Host() public model: LinkModel,
    private cdRef: ChangeDetectorRef
  ) {
    this.centerOfLink$ = new BehaviorSubject(
      this.calcCenterOfPath(
        this.model.getFirstPoint().getCoords(),
        this.model.getLastPoint().getCoords()
      )
    );
    this.model.setPainted(true);
  }

  trackByPoints(i: number, point: PointModel) {
    return point.id;
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
          isStraight ? 0 : 30
        );

        this.model.setPath(path);
        this.centerOfLink$.next(
          this.calcCenterOfPath(firstPCoords, lastPCoords)
        );

        this.cdRef.detectChanges();
      });
  }

  calcCenterOfPath(firstPoint: Coords, secondPoint: Coords): Coords {
    return {
      x: (firstPoint.x + secondPoint.x) / 2 + 20,
      y: (firstPoint.y + secondPoint.y) / 2 + 20,
    };
  }

  deleteLink() {
    this.model.destroy();
  }
}
