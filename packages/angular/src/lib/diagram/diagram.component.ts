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
import { combineLatest, noop, Observable, of, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  DiagramEngineCore,
  SelectingAction,
  MouseManager,
  isNil,
  DiagramModel,
  BaseAction,
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
  @Input('model') diagramModel: DiagramModel | null = null;
  @Input() allowCanvasZoom = true;
  @Input() allowCanvasTranslation = true;
  @Input() inverseZoom = true;
  @Input() allowLooseLinks = true;
  @Input() maxZoomOut = 0;
  @Input() maxZoomIn = 0;
  @Input() portMagneticRadius = 30;

  @ViewChild('nodesLayer', { read: ViewContainerRef })
  nodesLayer?: ViewContainerRef;

  @ViewChild('linksLayer', { read: ViewContainerRef })
  linksLayer?: ViewContainerRef;

  @ViewChild('canvas', { read: ElementRef })
  canvas?: ElementRef;

  diagramEngine?: DiagramEngineCore;
  mouseManager?: MouseManager;
  selectionBox$?: Observable<SelectingAction>;
  destroyed$ = new ReplaySubject<boolean>(1);

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
    const model = this.diagramModel;
    if (!model || !this.canvas) {
      return;
    }

    this.diagramEngine = model.getDiagramEngine();

    this.mouseManager = this.diagramEngine.getMouseManager();
    this.diagramEngine.setCanvas(this.canvas.nativeElement);

    this.diagramEngine.setup({
      ...this,
    });

    (this.diagramEngine.paintNodes(this.nodesLayer) as Observable<boolean>)
      .pipe(
        switchMap(() => {
          if (!this.diagramEngine) {
            return of(null);
          }

          return this.diagramEngine.paintLinks(this.linksLayer) as Observable<
            void
          >;
        })
      )
      .subscribe(() => {
        this.initSubs();
        this.initSelectionBox();
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  initSelectionBox() {
    if (!this.diagramEngine) {
      return;
    }

    this.selectionBox$ = this.diagramEngine.selectAction().pipe(
      filter(
        (a: {
          action: BaseAction | null;
          state: string | null;
        }): a is { action: SelectingAction; state: 'firing' } =>
          !isNil(a) &&
          a.action instanceof SelectingAction &&
          a.state === 'firing'
      ),
      map((a) => {
        return a.action;
      }),
      tap(() => this.cdRef.detectChanges())
    ) as Observable<SelectingAction>;
  }

  @OutsideZone
  onMouseUp(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseUp(event) : noop();
  }

  @OutsideZone
  onMouseMove(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseMove(event) : noop();
  }

  @OutsideZone
  onMouseDown(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseDown(event) : noop();
  }

  @OutsideZone
  onMouseWheel(event: WheelEvent) {
    this.mouseManager ? this.mouseManager.onMouseWheel(event) : noop();
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
    const diagramModel = this.diagramEngine?.getDiagramModel();
    if (!diagramModel) {
      return;
    }

    combineLatest([
      diagramModel.selectOffsetX(),
      diagramModel.selectOffsetY(),
      diagramModel.selectZoomLevel(),
    ])
      .pipe(
        tap(([x, y, zoom]) => this.setLayerStyles(x, y, zoom)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  protected getNodesLayer(): HTMLDivElement | null {
    if (!this.host) {
      return null;
    }

    return this.host.querySelector('.ngdx-nodes-layer');
  }

  protected getLinksLayer(): HTMLDivElement | null {
    if (!this.host) {
      return null;
    }

    return this.host.querySelector('.ngdx-links-layer');
  }
}
