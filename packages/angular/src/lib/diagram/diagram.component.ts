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
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SelectingAction, MouseManager, DiagramModel, DiagramModelOptions } from '@rxzu/core';
import { ZonedClass, OutsideZone } from '../utils';
import { EngineService } from '../engine.service';
import { RegistryService } from '../registry.service';
import { FactoryService } from '../factory.service';

@Component({
  selector: 'rxzu-diagram',
  exportAs: 'RxzuDiagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss'],
  providers: [EngineService, RegistryService, FactoryService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RxZuDiagramComponent
  implements AfterViewInit, OnDestroy, ZonedClass {
  @Input('model') diagramModel: DiagramModel | null = null;
  @Input() options?: DiagramModelOptions;
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

  mouseManager?: MouseManager;
  selectionBox$?: Observable<SelectingAction | null>;
  destroyed$ = new ReplaySubject<boolean>(1);

  get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  constructor(
    public readonly diagramEngine: EngineService,
    public ngZone: NgZone,
    protected renderer: Renderer2,
    protected cdRef: ChangeDetectorRef,
    protected elRef: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit() {
    this.diagramModel = this.diagramModel && this.diagramEngine.setModel(this.diagramModel) || this.diagramEngine.createModel(this.options);

    if (!this.canvas) {
      return;
    }
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
      map((a) => {
        if (
          a &&
          a.action &&
          a.action instanceof SelectingAction &&
          a.state === 'firing'
        ) {
          return a.action as SelectingAction;
        } else {
          return null;
        }
      }),
      tap(() => this.cdRef.detectChanges())
    );
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

  zoomToFit(additionalZoomFactor?: number): void {
    this.diagramEngine.zoomToFit(additionalZoomFactor);
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

    return this.host.querySelector('.rxzu-nodes-layer');
  }

  protected getLinksLayer(): HTMLDivElement | null {
    if (!this.host) {
      return null;
    }

    return this.host.querySelector('.rxzu-links-layer');
  }
}
