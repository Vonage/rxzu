import { Observable, combineLatest, of } from 'rxjs';
import {
  takeUntil,
  switchMap,
  pluck,
  take,
  filter,
  map,
  catchError,
  switchMapTo,
} from 'rxjs/operators';
import { SelectingAction } from '../actions';
import { DiagramEngine } from '../engine.core';
import { BaseModel, LabelModel, NodeModel, PortModel } from '../models';
import { createValueState, ValueState } from '../state';

export class CanvasManager {
  protected canvas$: ValueState<HTMLElement | null>;
  protected engine: DiagramEngine;

  constructor(
    protected _diagramEngine: DiagramEngine,
    protected _canvas?: HTMLElement
  ) {
    this.canvas$ = createValueState<HTMLElement | null>(_canvas || null);
    this.engine = _diagramEngine;
  }

  /**
   * Determine the width and height of the node passed in.
   * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
   */
  getNodeDimensions(node: NodeModel) {
    const nodeElement = this.getModelElement(node);
    if (!nodeElement) {
      return null;
    }
    const nodeRect = nodeElement.getBoundingClientRect();

    return {
      width: nodeRect.width,
      height: nodeRect.height,
    };
  }

  getRelativePoint(x: number, y: number) {
    const canvas = this.getCanvas();
    const canvasRect = canvas.getBoundingClientRect();
    return { x: x - canvasRect.left, y: y - canvasRect.top };
  }

  getZoomAwareRelativePoint(event: MouseEvent): { x: number; y: number } {
    const point = this.getRelativePoint(event.clientX, event.clientY);
    return {
      x:
        (point.x - this.engine.getDiagramModel().getOffsetX()) /
        (this.engine.getDiagramModel().getZoomLevel() / 100.0),
      y:
        (point.y - this.engine.getDiagramModel().getOffsetY()) /
        (this.engine.getDiagramModel().getZoomLevel() / 100.0),
    };
  }

  getModelElement(model: BaseModel): HTMLElement {
    const canvas = this.getCanvas();
    const selector = canvas.querySelector(
      `[data-type="${model.type}"][data-id="${model.id}"]`
    );
    if (selector === null) {
      throw new Error(
        `Cannot find [${model.type}] element with id [${model.id}]`
      );
    }
    return selector as HTMLElement;
  }

  getPortCenter(port: PortModel) {
    const sourceElement = this.getModelElement(port);
    const diagramModel = this.engine.getDiagramModel();
    if (!sourceElement || !diagramModel) {
      return null;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

    if (!rel) {
      return null;
    }

    return {
      x:
        sourceElement.offsetWidth / 2 +
        (rel.x - diagramModel.getOffsetX()) /
          (diagramModel.getZoomLevel() / 100.0),
      y:
        sourceElement.offsetHeight / 2 +
        (rel.y - diagramModel.getOffsetY()) /
          (diagramModel.getZoomLevel() / 100.0),
    };
  }

  setCanvas(canvas: HTMLElement) {
    this.canvas$.set(canvas);
  }

  getCanvas() {
    if (!this.canvas$.value) {
      throw new Error(
        '[RxZu] No canvas found, please use `setCanvas` to assign one.'
      );
    }

    return this.canvas$.value;
  }

  selectCanvas() {
    return this.canvas$.select();
  }

  setObservers<T extends BaseModel>(widget: any, model: T): ResizeObserver[] {
    const observers: ResizeObserver[] = [];

    const element = this.engine.getFactory().getHTMLElement(widget);
    if (model instanceof NodeModel || model instanceof PortModel) {
      const resizeObserver = new ResizeObserver(
        (entries: ResizeObserverEntry[]) => {
          if (entries?.length > 0) {
            // get the new width and height of the node
            const { width, height } = entries[0].contentRect;
            if (width && height) {
              // update the new width and height of the node in the model
              model.setDimensions({ width, height });
              if (model instanceof PortModel) {
                const coords = this.getPortCoords(model);
                if (coords) {
                  model.updateCoords(coords);
                }
              }
            }
          }
        }
      );

      resizeObserver.observe(element);

      observers.push(resizeObserver);
    }

    return observers;
  }

  paintNodes(nodesHost: any, promise: true): Promise<boolean>;
  paintNodes(nodesHost: any): Observable<boolean>;
  paintNodes(
    nodesHost: any,
    promise = false
  ): Observable<boolean> | Promise<boolean> {
    const diagramModel = this.engine.getDiagramModel();
    const observable = diagramModel.selectNodes().pipe(
      takeUntil(diagramModel.onEntityDestroy()),
      switchMap((nodes) => {
        const nodesPainted$ = [];

        for (const node of nodes.values()) {
          if (node.getPainted().isPainted) continue;

          node.setParent(diagramModel);

          nodesPainted$.push(this.paintModel(node, nodesHost));
        }

        return combineLatest(nodesPainted$);
      }),
      filter((val) => val !== null),
      map(() => true),
      catchError((err) => {
        console.error(err);
        return of(true);
      })
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLinks(linksHost: any, promise: true): Promise<void>;
  paintLinks(linksHost: any): Observable<void>;
  paintLinks(
    linksHost: any,
    promise = false
  ): Observable<void> | Promise<void> {
    const diagramModel = this.engine.getDiagramModel();
    const observable = diagramModel.selectLinks().pipe(
      takeUntil(diagramModel.onEntityDestroy()),
      switchMap((links) => {
        const linksPainted$ = [];
        for (const link of Array.from(links.values())) {
          if (link.getPainted().isPainted) continue;

          const srcPort = link.getSourcePort();
          const targetPort = link.getTargetPort();

          if (srcPort) {
            // Attach link first point to source port
            const portCenter = this.getPortCenter(srcPort);
            if (portCenter) {
              link.getPoints()[0].setCoords(portCenter);
            }
          }

          // Attach link last point to target port, will occur only for complete links
          if (targetPort) {
            const portCenter = this.getPortCenter(targetPort);
            if (portCenter) {
              link
                .getPoints()
                [link.getPoints().length - 1].setCoords(portCenter);
            }
          }

          linksPainted$.push(
            this.paintModel(link, linksHost).pipe(
              switchMapTo(
                link.selectLabel().pipe(
                  filter(
                    (
                      label: LabelModel | null | undefined
                    ): label is LabelModel =>
                      label !== null && label !== undefined
                  ),
                  switchMap((label: LabelModel) =>
                    this.paintLabel(label, linksHost)
                  )
                )
              )
            )
          );
        }

        return combineLatest(linksPainted$).pipe(switchMapTo(of()));
      }),
      catchError((err) => {
        console.error(err);
        return of() as Observable<void>;
      })
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLabel(label: LabelModel, host: any): Observable<boolean> {
    return this.paintModel(label, host);
  }

  paintModel<T extends BaseModel>(
    model: T,
    host: any,
    promise: true
  ): Promise<boolean>;
  paintModel<T extends BaseModel>(model: T, host: any): Observable<boolean>;
  paintModel<T extends BaseModel>(
    model: T,
    host: any,
    promise = false
  ): Observable<boolean> | Promise<boolean> {
    const toPromise = (obs: Observable<boolean>) => {
      return promise ? obs.toPromise() : obs;
    };
    const factory = this.engine.getFactory();
    const diagramModel = this.engine.getDiagramModel();
    const widget = factory.generateWidget({
      model,
      host,
      diagramModel,
    });

    if (!widget) return toPromise(of(true));

    const element = factory.getHTMLElement(widget);
    this.setBaseAttributes(element, model);
    this.subscribeToModelChanges(element, model);
    const observers = this.setObservers(widget, model);

    model.onEntityDestroy().subscribe(() => {
      this.engine.getFactory().destroyWidget(widget);
      observers.forEach((observer) => observer.disconnect());
    });

    return toPromise(model.paintChanges().pipe(pluck('isPainted'), take(1)));
  }

  subscribeToModelChanges<T extends BaseModel>(element: HTMLElement, model: T) {
    if (model instanceof NodeModel) {
      // subscribe to node coordinates
      model
        .selectCoords()
        .pipe(takeUntil(model.onEntityDestroy()))
        .subscribe(({ x, y }) => {
          element.style.setProperty('left', `${x}px`);
          element.style.setProperty('top', `${y}px`);
        });
    }
  }

  setBaseAttributes<T extends BaseModel>(element: HTMLElement, model: T) {
    element.setAttribute('data-type', model.type);
    element.setAttribute('data-id', model.id);
    element.setAttribute('data-parent-id', model.getParent()?.id);
    element.setAttribute('data-namespace', model.namespace);
  }

  shouldDrawSelectionBox() {
    const actions = this.engine.getActionsManager().getCurrentAction();
    if (actions instanceof SelectingAction) {
      return actions.getBoxDimensions();
    }
    return false;
  }

  /**
   * Calculate rectangular coordinates of the port passed in.
   */
  getPortCoords(port: PortModel) {
    const sourceElement = this.getModelElement(port);
    const canvas = this.getCanvas();
    const diagramModel = this.engine.getDiagramModel();
    if (!sourceElement || !canvas || !diagramModel) {
      return null;
    }

    const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
    const canvasRect = canvas.getBoundingClientRect() as ClientRect;

    return {
      x:
        (sourceRect.x - diagramModel.getOffsetX()) /
          (diagramModel.getZoomLevel() / 100.0) -
        canvasRect.left,
      y:
        (sourceRect.y - diagramModel.getOffsetY()) /
          (diagramModel.getZoomLevel() / 100.0) -
        canvasRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
    };
  }

  /**
   * Calculate rectangular coordinates of the node passed in.
   */
  getNodeCoords(node: NodeModel) {
    const sourceElement = this.getModelElement(node);
    const canvas = this.getCanvas();
    const diagramModel = this.engine.getDiagramModel();
    if (!sourceElement || !canvas || !diagramModel) {
      return null;
    }

    const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
    const canvasRect = canvas.getBoundingClientRect() as ClientRect;

    return {
      x:
        (sourceRect.x - diagramModel.getOffsetX()) /
          (diagramModel.getZoomLevel() / 100.0) -
        canvasRect.left,
      y:
        (sourceRect.y - diagramModel.getOffsetY()) /
          (diagramModel.getZoomLevel() / 100.0) -
        canvasRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
    };
  }

  getNodeCenter(node: NodeModel) {
    const sourceElement = this.getModelElement(node);
    const diagramModel = this.engine.getDiagramModel();
    if (!sourceElement || !diagramModel) {
      return null;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

    if (!rel) {
      return null;
    }

    return {
      x:
        sourceElement.offsetWidth / 2 +
        (rel.x - diagramModel.getOffsetX()) /
          (diagramModel.getZoomLevel() / 100.0),
      y:
        sourceElement.offsetHeight / 2 +
        (rel.y - diagramModel.getOffsetY()) /
          (diagramModel.getZoomLevel() / 100.0),
    };
  }

  /**
   * @description get node rectangle points (top left, top right, bottom left, bottom right)
   */
  getNodeRectPoints(node: NodeModel) {
    if (!node) {
      console.warn('[RxZu] No input node were found');
      return;
    }

    const width = node.getWidth();
    const height = node.getHeight();

    // get top left point of node
    const { x, y } = node.getCoords();

    return {
      topLeft: { x, y },
      topRight: { x: x + width, y },
      bottomLeft: { x: x, y: y + height },
      bottomRight: { x: x + width, y: y + height },
    };
  }

  /**
   * @description get the bounding rectangle of the input group of nodes
   * @param nodes the group of nodes to calculate the retcangle
   * @param margin the desired margin to include when calc the rect (in px)
   * @returns the total width and height of the nodes, most top and most left points of the nodes group
   */
  getNodeLayersRect(nodes: NodeModel[], margin = 0) {
    if (!nodes || nodes.length === 0) {
      console.warn('[RxZu] No input nodes were found');
      return { width: 0, height: 0, top: 0, left: 0 };
    }

    const firstNode = nodes[0];
    const { x: firstNodeXCoords, y: firstNodeYCoords } = firstNode.getCoords();

    let rightNodeWidth = firstNode.getWidth();
    let bottomNodeHeight = firstNode.getHeight();

    let minX = firstNodeXCoords;
    let maxX = firstNodeXCoords;
    let minY = firstNodeYCoords;
    let maxY = firstNodeYCoords;

    // go over all nodes and calc the min, max points of all of them
    nodes.forEach((node) => {
      // get coords of current node
      const { x, y } = node.getCoords();

      // get client width and client height of current node
      const nodeElement = this.getModelElement(node);
      const { clientWidth, clientHeight } = nodeElement;

      // if this node located at the leftmost point
      if (x < minX) minX = x;

      // if this node located at the topmost point
      if (y < minY) minY = y;

      // if this node located at the rightmost point including the width
      if (x + clientWidth > maxX + rightNodeWidth) {
        maxX = x;
        rightNodeWidth = clientWidth;
      }
      // if this node located at the bottommost point including the height
      if (y + clientHeight > maxY + bottomNodeHeight) {
        maxY = y;
        bottomNodeHeight = clientHeight;
      }
    });

    // calc the rect, adding the desired margin.
    return {
      width: maxX - minX + rightNodeWidth + 2 * margin,
      height: maxY - minY + bottomNodeHeight + 2 * margin,
      top: minY - margin,
      left: minX - margin,
    };
  }
}
