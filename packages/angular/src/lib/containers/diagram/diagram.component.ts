import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import {
  BaseAction,
  BaseModel,
  Coords,
  DiagramEngineCore,
  DiagramModel,
  InvalidLinkDestroyed,
  LinkCreatedAction,
  LinkModel,
  LooseLinkDestroyed,
  MoveCanvasAction,
  MoveItemsAction,
  NodeModel,
  PointModel,
  PortModel,
  SelectingAction,
} from '@rxzu/core';
import { ZonedClass, OutsideZone } from '../../utils/decorators';

/** @dynamic */
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

  @Output() actionStartedFiring = new EventEmitter<BaseAction>();
  @Output() actionStillFiring = new EventEmitter<BaseAction>();
  @Output() actionStoppedFiring = new EventEmitter<BaseAction>();

  @ViewChild('nodesLayer', { read: ViewContainerRef })
  nodesLayer: ViewContainerRef;

  @ViewChild('linksLayer', { read: ViewContainerRef })
  linksLayer: ViewContainerRef;

  @ViewChild('canvas', { read: ElementRef })
  canvas: ElementRef;

  diagramEngine: DiagramEngineCore;
  protected destroyed$ = new ReplaySubject<boolean>(1);

  get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    public ngZone: NgZone,
    protected renderer: Renderer2,
    protected cdRef: ChangeDetectorRef,
    protected elRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit() {
    if (this.diagramModel) {
      this.diagramEngine = this.diagramModel.getDiagramEngine();
      this.diagramEngine.setCanvas(this.canvas.nativeElement);
      this.diagramEngine.setup({
        maxZoomIn: this.maxZoomIn,
        maxZoomOut: this.maxZoomOut,
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
          this.cdRef.detectChanges();
        });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  @OutsideZone
  onMouseUp(event: MouseEvent) {
    const action = this.diagramEngine.selectAction().getValue();
    // are we going to connect a link to something?
    if (action instanceof MoveItemsAction) {
      const element = this.diagramEngine.getMouseElement(event);
      action.selectionModels.forEach((model) => {
        // only care about points connecting to things
        if (!model || !(model.model instanceof PointModel)) {
          return;
        }

        let el: BaseModel;
        if (model.magnet) {
          el = model.magnet;
        } else if (element && element.model) {
          el = element.model;
        }

        if (el instanceof PortModel && !this.diagramEngine.isModelLocked(el)) {
          const link = model.model.getLink();
          if (link.getTargetPort() !== null) {
            // if this was a valid link already and we are adding a node in the middle, create 2 links from the original
            if (link.getTargetPort() !== el && link.getSourcePort() !== el) {
              const targetPort = link.getTargetPort();
              const newLink = link.clone({});
              newLink.setSourcePort(el);
              newLink.setTargetPort(targetPort);
              link.setTargetPort(el);
              targetPort.removeLink(link);
              newLink.removePointsBefore(
                newLink.getPoints()[link.getPointIndex(model.model)]
              );
              link.removePointsAfter(model.model);
              this.diagramModel.addLink(newLink);
              // if we are connecting to the same target or source, destroy tweener points
            } else if (link.getTargetPort() === el) {
              link.removePointsAfter(model.model);
            } else if (link.getSourcePort() === el) {
              link.removePointsBefore(model.model);
            }
          } else {
            link.setTargetPort(el);
            const targetPort = link.getTargetPort();
            const srcPort = link.getSourcePort();

            if (
              targetPort.id !== srcPort.id &&
              srcPort.canLinkToPort(targetPort)
            ) {
              // link is valid, fire the event
              this.actionStartedFiring.emit(
                this.diagramEngine.startFiringAction(
                  new LinkCreatedAction(event.clientX, event.clientY, link)
                )
              );
            }
          }
        }

        // reset current magent
        model.magnet = undefined;
      });

      // check for / destroy any loose links in any models which have been moved
      if (!this.allowLooseLinks) {
        action.selectionModels.forEach((model) => {
          // only care about points connecting to things
          if (!model || !(model.model instanceof PointModel)) {
            return;
          }

          const selectedPoint: PointModel = model.model;
          const link: LinkModel = selectedPoint.getLink();
          if (link.getSourcePort() === null || link.getTargetPort() === null) {
            link.destroy();
            this.actionStartedFiring.emit(
              this.diagramEngine.startFiringAction(
                new LooseLinkDestroyed(event.clientX, event.clientY, link)
              )
            );
          }
        });
      }

      // destroy any invalid links
      action.selectionModels.forEach((model) => {
        // only care about points connecting to things
        if (!model || !(model.model instanceof PointModel)) {
          return;
        }

        const link: LinkModel = model.model.getLink();
        const sourcePort: PortModel = link.getSourcePort();
        const targetPort: PortModel = link.getTargetPort();

        if (sourcePort !== null && targetPort !== null) {
          if (!sourcePort.canLinkToPort(targetPort)) {
            // link not allowed
            link.destroy();
            this.actionStartedFiring.emit(
              this.diagramEngine.startFiringAction(
                new InvalidLinkDestroyed(event.clientX, event.clientY, link)
              )
            );
          } else if (
            targetPort
              .getLinksArray()
              .some(
                (link) =>
                  link !== link &&
                  (link.getSourcePort() === sourcePort ||
                    link.getTargetPort() === sourcePort)
              )
          ) {
            // link is a duplicate
            link.destroy();
          }
        }
      });

      this.actionStoppedFiring.emit(this.diagramEngine.stopFiringAction());
    } else {
      this.actionStoppedFiring.emit(this.diagramEngine.stopFiringAction());
    }

    this.diagramEngine.setAction(null);
  }

  /**
   * @description Mouse Move Event Handler
   * @param event MouseEvent
   */
  @OutsideZone
  onMouseMove(event: MouseEvent) {
    const action = this.diagramEngine.selectAction().getValue();

    if (action === null || action === undefined) {
      return;
    }

    if (action instanceof SelectingAction) {
      const relative = this.diagramEngine.getRelativePoint(
        event.clientX,
        event.clientY
      );

      this.diagramModel.getNodes().forEach((node) => {
        if (
          (action as SelectingAction).containsElement(
            node.getCoords(),
            this.diagramModel
          )
        ) {
          node.setSelected();
        } else {
          node.setSelected(false);
        }
      });

      this.diagramModel.getLinks().forEach((link) => {
        let allSelected = true;

        link.getPoints().forEach((point) => {
          if (
            (action as SelectingAction).containsElement(
              point.getCoords(),
              this.diagramModel
            )
          ) {
            point.setSelected();
          } else {
            point.setSelected(false);
            allSelected = false;
          }
        });

        if (allSelected) {
          link.setSelected();
        }
      });

      action.mouseX2 = relative.x;
      action.mouseY2 = relative.y;

      this.actionStillFiring.emit(this.diagramEngine.fireAction());
      this.diagramEngine.setAction(null);
      return;
    } else if (action instanceof MoveItemsAction) {
      const coords: Coords = {
        x: event.clientX - action.mouseX,
        y: event.clientY - action.mouseY,
      };
      const amountZoom = this.diagramModel.getZoomLevel() / 100;
      action.selectionModels.forEach((selectionModel) => {
        // reset all previous magnets if any
        selectionModel.magnet = undefined;

        // in this case we need to also work out the relative grid position
        if (
          selectionModel.model instanceof NodeModel ||
          (selectionModel.model instanceof PointModel &&
            !selectionModel.model.isConnectedToPort())
        ) {
          const newCoords = {
            x: selectionModel.initialX + coords.x / amountZoom,
            y: selectionModel.initialY + coords.y / amountZoom,
          };
          const gridRelativeCoords = this.diagramModel.getGridPosition(
            newCoords
          );

          // magnetic inputs handling
          if (
            selectionModel.model instanceof PointModel &&
            this.portMagneticRadius
          ) {
            // get all ports on canvas, check distances, if smaller then defined radius, magnetize!
            const portsMap = this.diagramModel.getAllPorts({
              filter: (p) => p.getMagnetic(),
            });

            for (const port of portsMap.values()) {
              const portCoords = port.getCoords();
              const distance = Math.hypot(
                portCoords.x - newCoords.x,
                portCoords.y - newCoords.y
              );
              if (distance <= this.portMagneticRadius) {
                const portCenter = this.diagramEngine.getPortCenter(port);
                selectionModel.model.setCoords(portCenter);
                selectionModel.magnet = port;
                return;
              }
            }
          }

          selectionModel.model.setCoords(gridRelativeCoords);

          if (selectionModel.model instanceof NodeModel) {
            // update port coordinates as well
            selectionModel.model.getPorts().forEach((port) => {
              const portCoords = this.diagramEngine.getPortCoords(port);
              port.updateCoords(portCoords);
            });
          }
        } else if (selectionModel.model instanceof PointModel) {
          // will only run here when trying to create a point on an existing link
          // we want points that are connected to ports, to not necessarily snap to grid
          // this stuff needs to be pixel perfect, dont touch it
          const newCoords = this.diagramModel.getGridPosition({
            x: coords.x / amountZoom,
            y: coords.y / amountZoom,
          });
          selectionModel.model.setCoords({
            x: selectionModel.initialX + newCoords.x,
            y: selectionModel.initialY + newCoords.y,
          });
        }
      });

      this.actionStillFiring.emit(this.diagramEngine.fireAction());
    } else if (action instanceof MoveCanvasAction) {
      if (this.allowCanvasTranslation) {
        this.diagramModel.setOffset(
          action.initialOffsetX + (event.clientX - action.mouseX),
          action.initialOffsetY + (event.clientY - action.mouseY)
        );
        this.actionStillFiring.emit(this.diagramEngine.fireAction());
      }
    }
  }

  selectionAction() {
    return this.diagramEngine.selectAction() as BehaviorSubject<
      SelectingAction
    >;
  }

  @OutsideZone
  onMouseDown(event: MouseEvent) {
    if (event.button === 3) {
      return;
    }

    const selectedModel = this.diagramEngine.getMouseElement(event);

    // canvas selected
    if (selectedModel === null) {
      // multiple selection
      if (event.shiftKey) {
        // initiate multiple selection selector
        const relative = this.diagramEngine.getRelativePoint(
          event.clientX,
          event.clientY
        );
        this.actionStartedFiring.emit(
          this.diagramEngine.startFiringAction(
            new SelectingAction(relative.x, relative.y)
          )
        );
      } else {
        // drag canvas action
        this.diagramModel.clearSelection();
        this.actionStartedFiring.emit(
          this.diagramEngine.startFiringAction(
            new MoveCanvasAction(
              event.clientX,
              event.clientY,
              this.diagramModel
            )
          )
        );
      }
    } else if (selectedModel.model instanceof PortModel) {
      // its a port element, we want to drag a link
      if (
        !selectedModel.model.isLocked() &&
        selectedModel.model.getCanCreateLinks()
      ) {
        const relative = this.diagramEngine.getRelativeMousePoint(event);
        const sourcePort = selectedModel.model;
        const link = sourcePort.createLinkModel();

        // if we don't have a link then we have reached the max amount, or we cannot create new ones
        if (link) {
          link.setSourcePort(sourcePort);
          link.removeMiddlePoints();
          if (link.getSourcePort() !== sourcePort) {
            link.setSourcePort(sourcePort);
          }
          link.setTargetPort(null);

          link.getFirstPoint().setCoords(relative);
          link.getLastPoint().setCoords(relative);

          this.diagramModel.clearSelection();
          link.getLastPoint().setSelected();
          this.diagramModel.addLink(link);

          this.actionStartedFiring.emit(
            this.diagramEngine.startFiringAction(
              new MoveItemsAction(
                event.clientX,
                event.clientY,
                this.diagramEngine
              )
            )
          );
        }
      } else {
        this.diagramModel.clearSelection();
      }
    } else if (
      selectedModel.model instanceof PointModel &&
      selectedModel.model.isConnectedToPort()
    ) {
      this.diagramModel.clearSelection();
    } else {
      // its some other element, probably want to move it
      if (!event.shiftKey && !selectedModel.model.getSelected()) {
        this.diagramModel.clearSelection();
      }

      selectedModel.model.setSelected();

      this.actionStartedFiring.emit(
        this.diagramEngine.startFiringAction(
          new MoveItemsAction(event.clientX, event.clientY, this.diagramEngine)
        )
      );
    }

    this.createMouseListeners();
  }

  @OutsideZone
  onMouseWheel(event: WheelEvent) {
    if (!this.allowCanvasZoom) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const currentZoomLevel = this.diagramModel.getZoomLevel();

    const oldZoomFactor = currentZoomLevel / 100;
    let scrollDelta = this.inverseZoom ? -event.deltaY : event.deltaY;

    // check if it is pinch gesture
    if (event.ctrlKey && scrollDelta % 1 !== 0) {
      /* Chrome and Firefox sends wheel event with deltaY that
						 have fractional part, also `ctrlKey` prop of the event is true
						 though ctrl isn't pressed
					*/
      scrollDelta /= 3;
    } else {
      scrollDelta /= 60;
    }

    if (currentZoomLevel + scrollDelta > 10) {
      const newZoomLvl = currentZoomLevel + scrollDelta;
      this.diagramModel.setZoomLevel(newZoomLvl);
    }

    const updatedZoomLvl = this.diagramModel.getZoomLevel();
    const zoomFactor = updatedZoomLvl / 100;

    const boundingRect = (event.currentTarget as Element).getBoundingClientRect();
    const clientWidth = boundingRect.width;
    const clientHeight = boundingRect.height;

    // compute difference between rect before and after scroll
    const widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor;
    const heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor;

    // compute mouse coords relative to canvas
    const clientX = event.clientX - boundingRect.left;
    const clientY = event.clientY - boundingRect.top;

    // compute width and height increment factor
    const xFactor =
      (clientX - this.diagramModel.getOffsetX()) / oldZoomFactor / clientWidth;
    const yFactor =
      (clientY - this.diagramModel.getOffsetY()) / oldZoomFactor / clientHeight;

    const updatedXOffset = this.diagramModel.getOffsetX() - widthDiff * xFactor;
    const updatedYOffset =
      this.diagramModel.getOffsetY() - heightDiff * yFactor;

    this.diagramModel.setOffset(updatedXOffset, updatedYOffset);
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

  protected createMouseListeners() {
    const mouseUp$ = fromEvent<MouseEvent>(this.document, 'mouseup').pipe(
      tap((e) => this.onMouseUp(e)),
      take(1)
    );

    const mouseMove$ = fromEvent<MouseEvent>(this.document, 'mousemove').pipe(
      tap((e) => this.onMouseMove(e)),
      takeUntil(mouseUp$)
    );

    merge(mouseMove$, mouseUp$).pipe(takeUntil(this.destroyed$)).subscribe();
  }
}
