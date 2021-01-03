import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  DiagramEngineCore,
  DiagramModel,
  SelectingAction,
  MouseManager,
  isNil,
} from '@rxzu/core';
import { ZonedClass, OutsideZone } from '../utils';

@Component({
  selector: 'ngdx-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RxZuDiagramComponent
  implements AfterViewInit, OnDestroy, ZonedClass {
  @Input('model') diagramModel: DiagramModel;
  @Input() allowCanvasZoom = true;
  @Input() allowCanvasTranslation = true;
  @Input() inverseZoom = true;
  @Input() allowLooseLinks = true;
  @Input() maxZoomOut: number = null;
  @Input() maxZoomIn: number = null;
  @Input() portMagneticRadius = 30;

  @ViewChild('nodesLayer', { read: ViewContainerRef })
  nodesLayer: ViewContainerRef;

  @ViewChild('linksLayer', { read: ViewContainerRef })
  linksLayer: ViewContainerRef;

  @ViewChild('canvas', { read: ElementRef })
  canvas: ElementRef;

  diagramEngine: DiagramEngineCore;
  mouseManager: MouseManager;
  protected destroyed$ = new ReplaySubject<boolean>(1);
  protected selectionBox$: Observable<SelectingAction>;

  get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  constructor(
    public ngZone: NgZone,
    protected renderer: Renderer2,
    protected cdRef: ChangeDetectorRef,
    protected elRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit() {
    if (this.diagramModel) {
      this.diagramEngine = this.diagramModel.getDiagramEngine();
      this.mouseManager = this.diagramEngine.getMouseManager();
      this.diagramEngine.setCanvas(this.canvas.nativeElement);

      this.diagramEngine.setup({
        ...this,
      });

      (this.diagramEngine.paintNodes(this.nodesLayer) as Observable<boolean>)
        .pipe(
          switchMap(
            () =>
              this.diagramEngine.paintLinks(this.linksLayer) as Observable<void>
          )
        )
        .subscribe(() => {
          this.initSubs();
          this.initSelectionBox();
          this.cdRef.detectChanges();
        });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  initSelectionBox() {
    this.selectionBox$ = this.diagramEngine.selectAction().pipe(
      map((a) => {
        if (
          !isNil(a) &&
          a.action instanceof SelectingAction &&
          a.state === 'firing'
        ) {
          return a.action;
        }

        return null;
      }),
      tap(() => this.cdRef.detectChanges())
    ) as Observable<SelectingAction>;
  }

  @OutsideZone
  onMouseUp(event: MouseEvent) {
    this.mouseManager.onMouseUp(event);
  }

  @OutsideZone
  onMouseMove(event: MouseEvent) {
    this.mouseManager.onMouseMove(event);
  }

  @OutsideZone
  onMouseDown(event: MouseEvent) {
    this.mouseManager.onMouseDown(event);
  }

  @OutsideZone
  onMouseWheel(event: WheelEvent) {
    this.mouseManager.onMouseWheel(event);
  }

  @OutsideZone
  protected setLayerStyles(x: number, y: number, zoom: number): void {
    const nodesLayer = this.getNodesLayer();
    const linksLayer = this.getLinksLayer();

    const style = 'transform';
    const value = `translate(${x}px, ${y}px) scale(${zoom / 100.0})`;

    this.renderer.setStyle(nodesLayer, style, value);
    this.renderer.setStyle(linksLayer, style, value);
  }

  protected initSubs() {
    combineLatest([
      this.diagramModel.selectOffsetX(),
      this.diagramModel.selectOffsetY(),
      this.diagramModel.selectZoomLevel(),
    ])
      .pipe(
        tap(([x, y, zoom]) => this.setLayerStyles(x, y, zoom)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  protected getNodesLayer(): HTMLDivElement {
    return this.host.querySelector('.ngdx-nodes-layer');
  }

  protected getLinksLayer(): HTMLDivElement {
    return this.host.querySelector('.ngdx-links-layer');
  }
}
