import {
  BaseModel,
  DiagramEngine,
  LabelModel,
  NodeModel,
  PortModel,
  SelectingAction,
  ValueState,
} from '@rxzu/core';
import { Observable, combineLatest, of, EMPTY } from 'rxjs';
import {
  takeUntil,
  switchMap,
  pluck,
  take,
  filter,
  map,
  catchError,
} from 'rxjs/operators';
import { createValueState } from '../state';

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
    this.canvas$.set(canvas).emit();
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
          if (!node.getPainted().isPainted) {
            nodesPainted$.push(
              node.paintChanges().pipe(pluck('isPainted'), take(1))
            );

            node.setParent(diagramModel);

            this.engine.getFactory().generateWidget({
              model: node,
              host: nodesHost,
              diagramModel,
            });
          }
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
      map((links) => {
        for (const link of links.values()) {
          if (!link.getPainted().isPainted) {
            const srcPort = link.getSourcePort();
            const targetPort = link.getTargetPort();

            if (!srcPort) {
              return;
            }

            // Attach link first point to source port
            const portCenter = this.getPortCenter(srcPort);

            if (!portCenter) {
              return;
            }

            link.getPoints()[0].setCoords(portCenter);

            // Attach link last point to target port, will occour only for complete links
            if (targetPort) {
              const portCenter = this.getPortCenter(targetPort);
              if (!portCenter) {
                return;
              }
              link
                .getPoints()
                [link.getPoints().length - 1].setCoords(portCenter);
            }

            this.engine.getFactory().generateWidget({
              model: link,
              host: linksHost,
              diagramModel,
            });

            // (canvas: HTMLElement | null | undefined): canvas is HTMLElement =>
            // Handle link label, if any
            link
              .selectLabel()
              .pipe(
                filter(
                  (label: LabelModel | null | undefined): label is LabelModel =>
                    label !== null && label !== undefined
                )
              )
              .subscribe((label) => this.paintLabel(label, linksHost));
          }
        }
      }),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLabel(label: LabelModel, host: any) {
    this.engine.getFactory().generateWidget({
      model: label,
      host,
      diagramModel: this.engine.getDiagramModel(),
    });
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
