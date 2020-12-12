import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import {
  BaseAction,
  InvalidLinkDestroyed,
  LinkCreatedAction,
  MoveCanvasAction,
  SelectingAction,
} from '../../actions';
import { LooseLinkDestroyed } from '../../actions/loose-link-destroyed.action';
import { MoveItemsAction } from '../../actions/move-items.action';
import { Coords } from '../../interfaces/coords.interface';
import { BaseModel } from '../../models/base.model';
import { DiagramModel } from '../../models/diagram.model';
import { LinkModel } from '../../models/link.model';
import { NodeModel } from '../../models/node.model';
import { PointModel } from '../../models/point.model';
import { PortModel } from '../../models/port.model';
import { HashMap } from '../../utils/types';

@Component({
  selector: 'ngdx-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxDiagramComponent implements AfterViewInit, OnDestroy {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('model') diagramModel: DiagramModel;
  @Input() allowCanvasZoom = true;
  @Input() allowCanvasTranslation = true;
  @Input() inverseZoom = true;
  @Input() allowLooseLinks = true;
  @Input() maxZoomOut: number = null;
  @Input() maxZoomIn: number = null;
  @Input() portMagneticRadius = 30;
  @Input() smartRouting = false;

  @Output() actionStartedFiring = new EventEmitter<BaseAction>();
  @Output() actionStillFiring = new EventEmitter<BaseAction>();
  @Output() actionStoppedFiring = new EventEmitter<BaseAction>();

  @ViewChild('nodesLayer', { read: ViewContainerRef })
  nodesLayer: ViewContainerRef;

  @ViewChild('linksLayer', { read: ViewContainerRef })
  linksLayer: ViewContainerRef;

  @ViewChild('canvas', { read: ElementRef })
  canvas: ElementRef;

  layerStyles$ = defer(() =>
    combineLatest([
      this.diagramModel.selectOffsetX(),
      this.diagramModel.selectOffsetY(),
      this.diagramModel.selectZoomLevel(),
    ]).pipe(map(([x, y, zoom]) => this.createLayerStyle(x, y, zoom)))
  );

  protected nodes$: Observable<HashMap<NodeModel>>;
  protected links$: Observable<HashMap<LinkModel>>;
  protected action$ = new BehaviorSubject<BaseAction>(null);
  protected nodesRendered$: BehaviorSubject<boolean>;
  protected destroyed$ = new ReplaySubject<boolean>(1);

  constructor(
    protected renderer: Renderer2,
    protected cdRef: ChangeDetectorRef
  ) {}

  // TODO: handle destruction of container, resetting all observables to avoid memory leaks!
  ngAfterViewInit() {
    if (this.diagramModel) {
      this.initNodes();
      this.initLinks();
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * fire the action registered and notify subscribers
   */
  fireAction() {
    if (this.action$.value) {
      this.actionStillFiring.emit(this.action$.value);
    }
  }

  /**
   * Unregister the action, post firing and notify subscribers
   */
  stopFiringAction(shouldSkipEvent?: boolean) {
    if (!shouldSkipEvent) {
      this.actionStoppedFiring.emit(this.action$.value);
    }
    this.action$.next(null);
  }

  /**
   * Register the new action, pre firing and notify subscribers
   */
  startFiringAction(action: BaseAction) {
    this.action$.next(action);
    this.actionStartedFiring.emit(action);
  }

  selectAction() {
    return this.action$ as BehaviorSubject<SelectingAction>;
  }

  shouldDrawSelectionBox() {
    const action = this.action$.getValue();
    if (action instanceof SelectingAction) {
      action.getBoxDimensions();
      return true;
    }
    return false;
  }

  getMouseElement(event: MouseEvent): { model: BaseModel; element: Element } {
    const target = event.target as Element;

    // is it a port?
    let element = target.closest('[data-portid]');
    if (element) {
      // get the relevant node and return the port.
      const nodeEl = target.closest('[data-nodeid]');
      return {
        model: this.diagramModel
          .getNode(nodeEl.getAttribute('data-nodeid'))
          .getPort(element.getAttribute('data-portid')),
        element,
      };
    }

    // look for a point
    element = target.closest('[data-pointid]');
    if (element) {
      return {
        model: this.diagramModel
          .getLink(element.getAttribute('data-linkid'))
          .getPointModel(element.getAttribute('data-pointid')),
        element,
      };
    }

    // look for a link
    element = target.closest('[data-linkid]');
    if (element) {
      return {
        model: this.diagramModel.getLink(element.getAttribute('data-linkid')),
        element,
      };
    }

    // a node maybe
    element = target.closest('[data-nodeid]');
    if (element) {
      return {
        model: this.diagramModel.getNode(element.getAttribute('data-nodeid')),
        element,
      };
    }

    // just the canvas
    return null;
  }

  onMouseUp = (event: MouseEvent) => {
    const diagramEngine = this.diagramModel.getDiagramEngine();
    const action = this.action$.getValue();
    // are we going to connect a link to something?
    if (action instanceof MoveItemsAction) {
      const element = this.getMouseElement(event);
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

        if (el instanceof PortModel && !diagramEngine.isModelLocked(el)) {
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
              diagramEngine.getDiagramModel().addLink(newLink);
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
              this.startFiringAction(
                new LinkCreatedAction(event.clientX, event.clientY, link)
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
            this.startFiringAction(
              new LooseLinkDestroyed(event.clientX, event.clientY, link)
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
            this.startFiringAction(
              new InvalidLinkDestroyed(event.clientX, event.clientY, link)
            );
          } else if (
            Object.values(targetPort.getLinks()).some(
              (l: LinkModel) =>
                l !== link &&
                (l.getSourcePort() === sourcePort ||
                  l.getTargetPort() === sourcePort)
            )
          ) {
            // link is a duplicate
            link.destroy();
          }
        }
      });

      this.stopFiringAction();
    } else {
      this.stopFiringAction();
    }

    this.mouseUpListener();
    this.mouseMoveListener();
    this.action$.next(null);
  };

  /**
   * @description Mouse Move Event Handler
   * @param event MouseEvent
   */
  onMouseMove = (event: MouseEvent) => {
    const action = this.action$.getValue();

    if (action === null || action === undefined) {
      return;
    }

    if (action instanceof SelectingAction) {
      const relative = this.diagramModel
        .getDiagramEngine()
        .getRelativePoint(event.clientX, event.clientY);

      Object.values(this.diagramModel.getNodes()).forEach((node) => {
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

      Object.values(this.diagramModel.getLinks()).forEach((link) => {
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

      this.fireAction();
      this.action$.next(action);
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
                const portCenter = this.diagramModel
                  .getDiagramEngine()
                  .getPortCenter(port);
                selectionModel.model.setCoords(portCenter);
                selectionModel.magnet = port;
                return;
              }
            }
          }

          selectionModel.model.setCoords(gridRelativeCoords);

          if (selectionModel.model instanceof NodeModel) {
            // update port coordinates as well
            Object.values(selectionModel.model.getPorts()).forEach((port) => {
              const portCoords = this.diagramModel
                .getDiagramEngine()
                .getPortCoords(port);
              port.updateCoords(portCoords);
            });
          }

          if (this.diagramModel.getDiagramEngine().getSmartRouting()) {
            setTimeout(() => {
              this.diagramModel.getDiagramEngine().calculateRoutingMatrix();
            }, 1);
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

      this.fireAction();
    } else if (action instanceof MoveCanvasAction) {
      if (this.allowCanvasTranslation) {
        this.diagramModel.setOffset(
          action.initialOffsetX + (event.clientX - action.mouseX),
          action.initialOffsetY + (event.clientY - action.mouseY)
        );
        this.fireAction();
      }
    }
  };

  onMouseDown(event: MouseEvent) {
    if (event.button === 3) {
      return;
    }

    const selectedModel = this.getMouseElement(event);

    // canvas selected
    if (selectedModel === null) {
      // multiple selection
      if (event.shiftKey) {
        // initiate multiple selection selector
        const relative = this.diagramModel
          .getDiagramEngine()
          .getRelativePoint(event.clientX, event.clientY);
        this.startFiringAction(new SelectingAction(relative.x, relative.y));
      } else {
        // drag canvas action
        this.diagramModel.clearSelection();
        this.startFiringAction(
          new MoveCanvasAction(event.clientX, event.clientY, this.diagramModel)
        );
      }
    } else if (selectedModel.model instanceof PortModel) {
      // its a port element, we want to drag a link
      if (
        !selectedModel.model.isLocked() &&
        selectedModel.model.getCanCreateLinks()
      ) {
        const relative = this.diagramModel
          .getDiagramEngine()
          .getRelativeMousePoint(event);
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

          this.startFiringAction(
            new MoveItemsAction(
              event.clientX,
              event.clientY,
              this.diagramModel.getDiagramEngine()
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

      this.startFiringAction(
        new MoveItemsAction(
          event.clientX,
          event.clientY,
          this.diagramModel.getDiagramEngine()
        )
      );
    }

    // create mouseMove and mouseUp listeners
    this.mouseMoveListener = this.renderer.listen(
      document,
      'mousemove',
      this.onMouseMove
    );
    this.mouseUpListener = this.renderer.listen(
      document,
      'mouseup',
      this.onMouseUp
    );
  }

  onMouseWheel(event: WheelEvent) {
    if (this.allowCanvasZoom) {
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
      const heightDiff =
        clientHeight * zoomFactor - clientHeight * oldZoomFactor;

      // compute mouse coords relative to canvas
      const clientX = event.clientX - boundingRect.left;
      const clientY = event.clientY - boundingRect.top;

      // compute width and height increment factor
      const xFactor =
        (clientX - this.diagramModel.getOffsetX()) /
        oldZoomFactor /
        clientWidth;
      const yFactor =
        (clientY - this.diagramModel.getOffsetY()) /
        oldZoomFactor /
        clientHeight;

      const updatedXOffset =
        this.diagramModel.getOffsetX() - widthDiff * xFactor;
      const updatedYOffset =
        this.diagramModel.getOffsetY() - heightDiff * yFactor;

      this.diagramModel.setOffset(updatedXOffset, updatedYOffset);
    }
  }

  protected mouseUpListener = () => {};
  protected mouseMoveListener = () => {};

  protected createLayerStyle(
    x: number,
    y: number,
    zoom: number
  ): HashMap<string> {
    return { transform: `translate(${x}px, ${y}px) scale(${zoom / 100.0})` };
  }

  protected initNodes() {
    this.diagramModel.getDiagramEngine().setCanvas(this.canvas.nativeElement);
    this.diagramModel
      .getDiagramEngine()
      .setSmartRoutingStatus(this.smartRouting);

    this.nodes$ = this.diagramModel.selectNodes();
    this.links$ = this.diagramModel.selectLinks();
    this.nodesRendered$ = new BehaviorSubject(false);

    this.diagramModel.setMaxZoomIn(this.maxZoomIn);
    this.diagramModel.setMaxZoomOut(this.maxZoomOut);

    this.nodes$.pipe(takeUntil(this.destroyed$)).subscribe((nodes) => {
      this.nodesRendered$.next(false);

      Object.values(nodes).forEach((node) => {
        if (!node.getPainted()) {
          this.diagramModel
            .getDiagramEngine()
            .generateWidgetForNode(node, this.nodesLayer);
          this.cdRef.detectChanges();
        }
      });

      this.nodesRendered$.next(true);
    });
  }

  protected initLinks() {
    combineLatest([this.nodesRendered$, this.links$])
      .pipe(
        filter(([nodesRendered, _]) => !!nodesRendered),
        takeUntil(this.destroyed$)
      )
      .subscribe(([_, links]) => {
        Object.values(links).forEach((link) => {
          if (!link.getPainted() && link.getSourcePort().getPainted()) {
            if (link.getSourcePort() !== null) {
              const portCenter = this.diagramModel
                .getDiagramEngine()
                .getPortCenter(link.getSourcePort());
              link.getPoints()[0].setCoords(portCenter);

              const portCoords = this.diagramModel
                .getDiagramEngine()
                .getPortCoords(link.getSourcePort());
              link.getSourcePort().updateCoords(portCoords);
            }

            if (link.getTargetPort() !== null) {
              const portCenter = this.diagramModel
                .getDiagramEngine()
                .getPortCenter(link.getTargetPort());
              link
                .getPoints()
                [link.getPoints().length - 1].setCoords(portCenter);

              const portCoords = this.diagramModel
                .getDiagramEngine()
                .getPortCoords(link.getTargetPort());
              link.getTargetPort().updateCoords(portCoords);
            }

            this.diagramModel
              .getDiagramEngine()
              .generateWidgetForLink(link, this.linksLayer);
            this.cdRef.detectChanges();
          }
        });
      });
  }
}
