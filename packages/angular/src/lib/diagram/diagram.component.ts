import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ActionsManager,
  CanvasManager,
  DiagramModel,
  EngineSetup,
  KeyboardManager,
  MouseManager,
  NodeModel,
  SelectingAction,
} from '@rxzu/core';
import { combineLatest, noop, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AnimationConfig } from '@rxzu/core';
import { EngineService } from '../engine.service';
import { FactoryService } from '../factory.service';
import { DIAGRAM_DEFAULT_OPTIONS } from '../injection.tokens';
import { RegistryService } from '../registry.service';
import { OutsideZone, ZonedClass } from '../utils';

@Component({
  selector: 'rxzu-diagram',
  exportAs: 'RxzuDiagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss'],
  providers: [EngineService, RegistryService, FactoryService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '1',
    class: 'rxzu-diagram',
  },
})
export class RxZuDiagramComponent implements OnInit, OnDestroy, ZonedClass {
  /** The name of the diagram, if not set will be `'default'` */
  @Input() name?: string;
  @Input() model!: DiagramModel;
  @Input() options?: Partial<EngineSetup>;

  @ViewChild('nodesLayer', { read: ViewContainerRef, static: true })
  nodesLayer?: ViewContainerRef;

  @ViewChild('linksLayer', { read: ViewContainerRef, static: true })
  linksLayer?: ViewContainerRef;

  selectionBox$?: Observable<SelectingAction | null>;
  mouseManager: MouseManager;
  keyboardManager: KeyboardManager;
  canvasManager: CanvasManager;
  actionsManager: ActionsManager;

  get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  constructor(
    public readonly diagramEngine: EngineService,
    public ngZone: NgZone,
    protected renderer: Renderer2,
    protected cdRef: ChangeDetectorRef,
    protected elRef: ElementRef<HTMLElement>,
    @Inject(DIAGRAM_DEFAULT_OPTIONS) protected defaultOptions: EngineSetup
  ) {
    this.mouseManager = this.diagramEngine.getMouseManager();
    this.keyboardManager = this.diagramEngine.getKeyboardManager();
    this.canvasManager = this.diagramEngine.getCanvasManager();
    this.actionsManager = this.diagramEngine.getActionsManager();
  }

  ngOnInit() {
    this.options = { ...this.defaultOptions, ...this.options };
    this.model =
      (this.model && this.diagramEngine.setModel(this.model)) ||
      this.diagramEngine.createModel({
        namespace: this.name || 'default',
        ...this.options,
      });

    this.canvasManager.setCanvas(this.host);

    this.diagramEngine.setup({
      ...this.options,
    } as EngineSetup);

    this.initNodes();
    this.initSelectionBox();
    this.initLayoutChanges();
    this.initAnimation();
  }

  ngOnDestroy() {
    if (this.keyboardManager) {
      this.keyboardManager.dispose();
    }

    this.model.destroy();
  }

  /**
   * zoom the canvas to fit all nodes inside the view.
   * @param additionalZoomFactor additional margins to the zooming factor
   */
  zoomToFit(additionalZoomFactor?: number): void {
    this.diagramEngine.zoomToFit(additionalZoomFactor);
  }

  /**
   *
   * @param nodes zoom the canvas to the selected nodes
   * @param margin additional margins to the zooming factor
   */
  zoomToNodes(nodes: NodeModel[], margin = 100): void {
    this.diagramEngine.zoomToNodes(nodes, margin);
  }

  @OutsideZone
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseDown(event) : noop();
  }

  @OutsideZone
  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    this.mouseManager ? this.mouseManager.onMouseWheel(event) : noop();
  }

  @OutsideZone
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keyboardManager ? this.keyboardManager.onKeyUp(event) : noop();
  }

  protected initNodes(): void {
    this.canvasManager
      .paintNodes(this.nodesLayer)
      .pipe(
        takeUntil(this.model.onEntityDestroy()),
        switchMap(() => {
          if (!this.diagramEngine) {
            return of(null);
          }

          return this.canvasManager.paintLinks(this.linksLayer);
        })
      )
      .subscribe();
  }

  protected initSelectionBox() {
    if (!this.diagramEngine) {
      return;
    }

    this.selectionBox$ = this.actionsManager.observeActions().pipe(
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
  protected onMouseUp(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseUp(event) : noop();
  }

  @HostListener('window:copy', ['$event'])
  protected onCopy(event: ClipboardEvent) {
    this.keyboardManager ? this.keyboardManager.onCopy() : noop();
  }

  @HostListener('window:paste', ['$event'])
  protected onPaste(event: ClipboardEvent) {
    this.keyboardManager ? this.keyboardManager.onPaste() : noop();
  }

  @OutsideZone
  protected onMouseMove(event: MouseEvent) {
    this.mouseManager ? this.mouseManager.onMouseMove(event) : noop();
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

  protected initLayoutChanges(): void {
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
        takeUntil(this.model.onEntityDestroy()),
        tap(([x, y, zoom]) => this.setLayerStyles(x, y, zoom))
      )
      .subscribe();
  }

  @OutsideZone
  protected initAnimation(): void {
    this.model
      .selectAnimation()
      .pipe(takeUntil(this.model.onEntityDestroy()))
      .subscribe((animate) => this.setAnimationStyles(animate));
  }

  protected setAnimationStyles(config: AnimationConfig | null): void {
    [this.getNodesLayer(), this.getLinksLayer()].forEach((layer) => {
      if (!config) {
        layer!.style.transition = 'none';
      } else {
        const transition = `transform ${config.timing}ms ${config.easing}`;
        layer!.style.transition = transition;
      }
    });
  }

  protected getNodesLayer(): HTMLDivElement | null {
    if (!this.host) {
      return null;
    }

    return this.nodesLayer?.element.nativeElement.parentElement;
  }

  protected getLinksLayer(): HTMLDivElement | null {
    if (!this.host) {
      return null;
    }

    return this.linksLayer?.element.nativeElement.parentElement;
  }
}
