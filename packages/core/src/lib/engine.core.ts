import { delay, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { BaseEntity } from './base.entity';
import { FactoriesManager } from './factories';
import { DiagramModel, PortModel, NodeModel, LabelModel } from './models';
import { createValueState, ValueState } from './state';
import { BaseAction, BaseActionState, SelectingAction } from './actions';
import { DiagramModelOptions, EngineSetup } from './interfaces';
import { MouseManager } from './managers';

export class DiagramEngineCore {
  protected canvas$: ValueState<HTMLElement | null>;
  protected action$ = new BehaviorSubject<{
    action: BaseAction | null;
    state: BaseActionState | null;
  }>({ action: null, state: null });

  protected factoriesManager: FactoriesManager;
  protected mouseManager: MouseManager;
  protected diagramModel: DiagramModel | undefined;

  constructor() {
    this.factoriesManager = this.createFactoriesManager();
    this.mouseManager = this.createMouseManager();
    this.canvas$ = createValueState<HTMLElement | null>(null);
  }

  createMouseManager() {
    if (this.mouseManager) {
      console.warn('[RxZu] Mouse Manager already initialized, bailing out.');
      return this.mouseManager;
    }

    return new MouseManager(this);
  }

  createFactoriesManager() {
    if (this.factoriesManager) {
      this.factoriesManager.dispose();
    }

    return new FactoriesManager();
  }

  createModel(options?: DiagramModelOptions) {
    if (this.diagramModel) {
      throw new Error(
        'diagram model already exists, please reset model prior to creating new diagram'
      );
    }

    this.diagramModel = new DiagramModel(this, options ?? { type: 'default' });

    this.diagramModel.onEntityDestroy().subscribe(() => {
      this.diagramModel = undefined;
    });

    return this.diagramModel;
  }

  getFactoriesManager() {
    return this.factoriesManager;
  }

  getMouseManager() {
    return this.mouseManager;
  }

  getNodeElement(node: NodeModel) {
    const canvas = this.getCanvas();
    const selector = canvas.querySelector(`[data-nodeid="${node.id}"]`);
    if (selector === null) {
      throw new Error(
        'Cannot find Node element with node id: [' + node.id + ']'
      );
    }
    return selector as HTMLElement;
  }

  getNodePortElement(port: PortModel) {
    const canvas = this.getCanvas();
    const selector = canvas.querySelector(
      `[data-nodeid="${port.getParent().id}"] [data-portid="${port.id}"]`
    );
    if (selector === null) {
      throw new Error(
        'Cannot find Node Port element with node id: [' +
        port.getParent().id +
        '] and port id: [' +
        port.id +
        ']'
      );
    }
    return selector as HTMLElement;
  }

  getPortCenter(port: PortModel) {
    const sourceElement = this.getNodePortElement(port);
    const diagramModel = this.getDiagramModel();
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
   * Calculate rectangular coordinates of the port passed in.
   */
  getPortCoords(port: PortModel) {
    const sourceElement = this.getNodePortElement(port);
    const canvas = this.getCanvas();
    const diagramModel = this.getDiagramModel();
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
    const sourceElement = this.getNodeElement(node);
    const canvas = this.getCanvas();
    const diagramModel = this.getDiagramModel();
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
    const sourceElement = this.getNodeElement(node);
    const diagramModel = this.getDiagramModel();
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
   * Determine the width and height of the node passed in.
   * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
   */
  getNodeDimensions(node: NodeModel) {
    const nodeElement = this.getNodeElement(node);
    if (!nodeElement) {
      return null;
    }
    const nodeRect = nodeElement.getBoundingClientRect();

    return {
      width: nodeRect.width,
      height: nodeRect.height,
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

  getRelativePoint(x: number, y: number) {
    const canvas = this.getCanvas();
    const canvasRect = canvas.getBoundingClientRect();
    return { x: x - canvasRect.left, y: y - canvasRect.top };
  }

  getDiagramModel() {
    if (!this.diagramModel) {
      throw new Error(
        '[RxZu] No model found, please create one and assign it to the engine.'
      );
    }
    return this.diagramModel;
  }

  isModelLocked(model: BaseEntity) {
    const diagramModel = this.getDiagramModel();
    if (diagramModel.getLocked()) {
      return true;
    }

    return model.getLocked();
  }

  /**
   * Get the bounding rectangle of the input group of nodes
   * @param nodes the group of nodes to calculate the retcangle
   * @param margin the desired margin to include when calc the rect
   * @returns The total width and height of the nodes, most top and most left points of the nodes group
   */
  getNodeLayersRect(nodes: NodeModel[], margin = 0) {
    if (!nodes || nodes.length === 0) {
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

    // Go over all nodes and calc the min, max points of all of them
    nodes.forEach(node => {
      const { x, y } = node.getCoords();
      if (x < minX) minX = x;
      if (x > maxX) {
        maxX = x;
        rightNodeWidth = node.getWidth();
      }
      if (y < minY) minY = y;
      if (y > maxY) {
        maxY = y;
        bottomNodeHeight = node.getHeight();
      }
    })

    // Calc the rect, adding the desired margin.
    return {
      width: (maxX - minX + rightNodeWidth) + (2 * margin),
      height: (maxY - minY + bottomNodeHeight) + (2 * margin),
      top: minY - margin,
      left: minX - margin
    }
  }

  /**
   * Set zoom and offset so that all nodes of the diagram will be seen at view
   */
  zoomToFit(margin = 100) {
    const diagramModel = this.getDiagramModel();
    if (diagramModel) {
      const allNodes = diagramModel.getNodesArray();
      if (allNodes?.length > 0) {
        this.zoomToNodes(allNodes, margin);
      }
    }
  }

  /**
  * Set zoom and offset so that all input nodes will be seen at view
  * @param nodes set zoom and offset so that all those node will be seen at view
  * @param margin the desired margin of the nodes in px
  */
  zoomToNodes(nodes: NodeModel[], margin = 100) {
    if (nodes?.length > 0) {
      const diagramModel = this.getDiagramModel();
      if (diagramModel) {
        this.canvas$.value$
          .pipe(
            filter(
              (canvas: HTMLElement | null | undefined): canvas is HTMLElement =>
                canvas !== null && canvas !== undefined
            ),
            take(1),
            delay(0)
          )
          .subscribe((canvas) => {
            // Get nodes layers bounding rect with the desired margin
            const nodesLayersRect = this.getNodeLayersRect(nodes, margin);

            // Calculate the zoom factor and set the new zoom
            const xFactor = canvas.clientWidth / nodesLayersRect?.width;
            const yFactor = canvas.clientHeight / nodesLayersRect.height;
            const zoomFactor = Math.min(xFactor, yFactor);
            diagramModel.setZoomLevel(zoomFactor * 100);

            // Get canavas top and left values including the offset
            const canvasRect = canvas.getBoundingClientRect();
            const canvasRelativeTopLeftPoint = {
              top: diagramModel.getOffsetY() + canvasRect.top,
              left: diagramModel.getOffsetX() + canvasRect.left
            };

            // Calc nodes rect top left values
            const nodesRectTopLeftPoint = {
              top: canvasRelativeTopLeftPoint.top + (nodesLayersRect.top * zoomFactor),
              left: canvasRelativeTopLeftPoint.left + (nodesLayersRect.left * zoomFactor)
            };

            // Set the new offset to the diagram
            diagramModel.setOffset(
              canvasRelativeTopLeftPoint.left - nodesRectTopLeftPoint.left,
              canvasRelativeTopLeftPoint.top - nodesRectTopLeftPoint.top
            );
          })
      }
    }
  }

  setup({
    maxZoomIn,
    maxZoomOut,
    portMagneticRadius,
    allowLooseLinks,
    allowCanvasZoom,
    allowCanvasTranslation,
    inverseZoom,
  }: EngineSetup) {
    const diagramModel = this.getDiagramModel();
    diagramModel.setAllowCanvasZoom(allowCanvasZoom ?? true);
    diagramModel.setAllowCanvasTranslation(allowCanvasTranslation ?? true);
    diagramModel.setInverseZoom(inverseZoom ?? false);
    diagramModel.setAllowLooseLinks(allowLooseLinks ?? true);
    diagramModel.setPortMagneticRadius(portMagneticRadius ?? 30);
    diagramModel.setMaxZoomIn(maxZoomIn ?? 0);
    diagramModel.setMaxZoomOut(maxZoomOut ?? 0);
  }

  paintNodes(
    nodesHost: any,
    promise = false
  ): Observable<boolean> | Promise<boolean> | void {
    const diagramModel = this.getDiagramModel();
    const observable = diagramModel.selectNodes().pipe(
      takeUntil(diagramModel.onEntityDestroy()),
      switchMap((nodes) => {
        const nodesPainted$ = [];
        for (const node of nodes.values()) {
          if (!node.getPainted().isPainted) {
            const nodeFactory = this.getFactoriesManager().getFactory({
              factoryType: 'nodeFactories',
              modelType: node.getType(),
            });

            if (!nodeFactory) {
              return of(null);
            }

            const portsHost = nodeFactory.generateWidget({
              model: node,
              host: nodesHost,
            });

            node.setParent(diagramModel);

            node
              .selectPorts()
              .pipe(
                filter(
                  (
                    ports: PortModel[] | null | undefined
                  ): ports is PortModel[] =>
                    ports !== null && ports !== undefined
                )
              )
              .subscribe((ports) => {
                ports.forEach((port) => {
                  if (!port.getPainted().isPainted) {
                    const portFactory = this.factoriesManager.getFactory({
                      factoryType: 'portFactories',
                      modelType: port.getType(),
                    });

                    if (!portFactory) {
                      return;
                    }

                    portFactory.generateWidget({
                      model: port,
                      host: portsHost,
                    });
                  }
                });
              });

            nodesPainted$.push(
              node.paintChanges().pipe(
                filter((paintE) => paintE.isPainted),
                take(1)
              )
            );
          }
        }

        return combineLatest(nodesPainted$);
      }),
      filter((val) => val !== null),
      map(() => true)
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLinks(
    linksHost: any,
    promise = false
  ): Observable<void> | Promise<void> {
    const diagramModel = this.getDiagramModel();
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

            // Render link component
            const linkFactory = this.getFactoriesManager().getFactory({
              factoryType: 'linkFactories',
              modelType: link.getType(),
            });

            if (!linkFactory) {
              return;
            }

            linkFactory.generateWidget({ model: link, host: linksHost });

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
      })
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLabel(label: LabelModel, host: any) {
    if (!label.getPainted().isPainted) {
      const labalFactory = this.getFactoriesManager().getFactory({
        factoryType: 'labelFactories',
        modelType: label.getType(),
      });

      if (!labalFactory) {
        return;
      }

      labalFactory.generateWidget({ model: label, host });
    }
  }

  /**
   * fire the action registered and notify subscribers
   */
  fireAction() {
    const action = this.action$.getValue()?.action;
    if (action) {
      this.action$.next({ action, state: 'firing' });
      return action;
    }

    return;
  }

  /**
   * Unregister the action, post firing and notify subscribers
   */
  stopFiringAction() {
    const stoppedAction = this.action$.getValue()?.action;
    if (stoppedAction) {
      this.action$.next({ action: stoppedAction, state: 'stopped' });
      return stoppedAction;
    }

    return;
  }

  /**
   * Register the new action, pre firing and notify subscribers
   */
  startFiringAction(action: BaseAction) {
    this.action$.next({ action, state: 'started' });
    return action;
  }

  selectAction() {
    return this.action$;
  }

  setAction(action: BaseAction) {
    this.action$.next({ action, state: 'firing' });
  }

  shouldDrawSelectionBox() {
    const action = this.action$.getValue();
    if (action instanceof SelectingAction) {
      return action.getBoxDimensions();
    }
    return false;
  }
}

