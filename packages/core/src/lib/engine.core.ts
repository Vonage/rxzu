import { delay, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { BaseEntity } from './base.entity';
import { AbstractFactory, FactoriesManager } from './factories';
import {
  DiagramModel,
  PortModel,
  NodeModel,
  LinkModel,
  BaseModel,
  LabelModel,
} from './models';
import { createValueState } from './state';
import { BaseAction, BaseActionState, SelectingAction } from './actions';
import { EntityMap } from './utils';
import { EngineSetup } from './interfaces/setup.interface';
import { MouseManager } from './managers/mouse.manager';

export class DiagramEngineCore {
  protected canvas$ = createValueState<Element>(null);
  protected factoriesManager: FactoriesManager<
    AbstractFactory<BaseModel, unknown, unknown>
  >;
  protected mouseManager: MouseManager;
  diagramModel: DiagramModel;

  protected nodes$: Observable<EntityMap<NodeModel>>;
  protected links$: Observable<EntityMap<LinkModel>>;
  protected action$ = new BehaviorSubject<{
    action: BaseAction;
    state: BaseActionState;
  }>(null);

  constructor() {
    this.createFactoriesManager();
    this.createMouseManager();
  }

  createMouseManager() {
    if (this.mouseManager) {
      console.warn('[RxZu] Mouse Manager already initialized, bailing out.');
      return;
    }

    this.mouseManager = new MouseManager(this);
  }

  createFactoriesManager() {
    if (this.factoriesManager) {
      this.factoriesManager.dispose();
    }

    this.factoriesManager = new FactoriesManager();
  }

  createModel() {
    if (this.diagramModel) {
      throw new Error(
        'diagram model already exists, please reset model prior to creating new diagram'
      );
    }

    this.diagramModel = new DiagramModel(this);

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

  getNodeElement(node: NodeModel): HTMLElement {
    const selector = this.canvas$.value.querySelector(
      `[data-nodeid="${node.id}"]`
    );
    if (selector === null) {
      throw new Error(
        'Cannot find Node element with node id: [' + node.id + ']'
      );
    }
    return selector as HTMLElement;
  }

  getNodePortElement(port: PortModel): HTMLElement {
    const selector = this.canvas$.value.querySelector(
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
    const sourceRect = sourceElement.getBoundingClientRect();
    const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

    return {
      x:
        sourceElement.offsetWidth / 2 +
        (rel.x - this.diagramModel.getOffsetX()) /
          (this.diagramModel.getZoomLevel() / 100.0),
      y:
        sourceElement.offsetHeight / 2 +
        (rel.y - this.diagramModel.getOffsetY()) /
          (this.diagramModel.getZoomLevel() / 100.0),
    };
  }

  /**
   * Calculate rectangular coordinates of the port passed in.
   */
  getPortCoords(
    port: PortModel
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const sourceElement = this.getNodePortElement(port);
    const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
    const canvasRect = this.canvas$.value.getBoundingClientRect() as ClientRect;

    return {
      x:
        (sourceRect.x - this.diagramModel.getOffsetX()) /
          (this.diagramModel.getZoomLevel() / 100.0) -
        canvasRect.left,
      y:
        (sourceRect.y - this.diagramModel.getOffsetY()) /
          (this.diagramModel.getZoomLevel() / 100.0) -
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
    const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
    const canvasRect = this.canvas$.value.getBoundingClientRect() as ClientRect;

    return {
      x:
        (sourceRect.x - this.diagramModel.getOffsetX()) /
          (this.diagramModel.getZoomLevel() / 100.0) -
        canvasRect.left,
      y:
        (sourceRect.y - this.diagramModel.getOffsetY()) /
          (this.diagramModel.getZoomLevel() / 100.0) -
        canvasRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
    };
  }

  getNodeCenter(node: NodeModel) {
    const sourceElement = this.getNodeElement(node);
    const sourceRect = sourceElement.getBoundingClientRect();
    const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

    return {
      x:
        sourceElement.offsetWidth / 2 +
        (rel.x - this.diagramModel.getOffsetX()) /
          (this.diagramModel.getZoomLevel() / 100.0),
      y:
        sourceElement.offsetHeight / 2 +
        (rel.y - this.diagramModel.getOffsetY()) /
          (this.diagramModel.getZoomLevel() / 100.0),
    };
  }

  /**
   * Determine the width and height of the node passed in.
   * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
   */
  getNodeDimensions(node: NodeModel): { width: number; height: number } {
    if (!this.canvas$.value) {
      return {
        width: 0,
        height: 0,
      };
    }

    const nodeElement = this.getNodeElement(node);
    const nodeRect = nodeElement.getBoundingClientRect();

    return {
      width: nodeRect.width,
      height: nodeRect.height,
    };
  }

  setCanvas(canvas: Element) {
    this.canvas$.set(canvas).emit();
  }

  getCanvas() {
    return this.canvas$.value;
  }

  selectCanvas() {
    return this.canvas$.select();
  }

  getRelativePoint(x: number, y: number) {
    const canvasRect = this.canvas$.value.getBoundingClientRect();
    return { x: x - canvasRect.left, y: y - canvasRect.top };
  }

  getDiagramModel() {
    return this.diagramModel;
  }

  isModelLocked(model: BaseEntity) {
    if (this.diagramModel.getLocked()) {
      return true;
    }

    return model.getLocked();
  }

  /**
   * fit the canvas zoom levels to the elements contained.
   * @param additionalZoomFactor allow for further zooming out to make sure edges doesn't cut
   */
  zoomToFit(additionalZoomFactor = 0.005) {
    this.canvas$.value$
      .pipe(filter(Boolean), take(1), delay(0))
      .subscribe((canvas: HTMLElement) => {
        const xFactor = canvas.clientWidth / canvas.scrollWidth;
        const yFactor = canvas.clientHeight / canvas.scrollHeight;
        const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

        let newZoomLvl =
          this.diagramModel.getZoomLevel() *
          (zoomFactor - additionalZoomFactor);
        const maxZoomOut = this.diagramModel.getMaxZoomOut();

        if (maxZoomOut && newZoomLvl < maxZoomOut) {
          newZoomLvl = maxZoomOut;
        }

        this.diagramModel.setZoomLevel(newZoomLvl);

        // TODO: either block the canvas movement on 0,0 or detect the top left furthest element and set the offest to its edges
        this.diagramModel.setOffset(0, 0);
      });
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
    this.diagramModel.setAllowCanvasZoom(allowCanvasZoom);
    this.diagramModel.setAllowCanvasTranslation(allowCanvasTranslation);
    this.diagramModel.setInverseZoom(inverseZoom);
    this.diagramModel.setAllowLooseLinks(allowLooseLinks);
    this.diagramModel.setPortMagneticRadius(portMagneticRadius);
    this.diagramModel.setMaxZoomIn(maxZoomIn);
    this.diagramModel.setMaxZoomOut(maxZoomOut);
  }

  paintNodes(
    nodesHost,
    promise = false
  ): Observable<boolean> | Promise<boolean> {
    const observable = this.diagramModel.selectNodes().pipe(
      takeUntil(this.diagramModel.onEntityDestroy()),
      switchMap((nodes) => {
        const nodesPainted$ = [];
        for (const node of nodes.values()) {
          if (!node.getPainted().isPainted) {
            const portsHost = this.getFactoriesManager()
              .getFactory({
                factoryType: 'nodeFactories',
                modelType: node.getType(),
              })
              .generateWidget({
                model: node,
                host: nodesHost,
                diagramModel: this.diagramModel,
              });

            node
              .selectPorts()
              .pipe(filter(Boolean))
              .subscribe((ports: PortModel[]) => {
                ports.forEach((port) => {
                  if (!port.getPainted().isPainted) {
                    this.factoriesManager
                      .getFactory({
                        factoryType: 'portFactories',
                        modelType: port.getType(),
                      })
                      .generateWidget({ model: port, host: portsHost });
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
      map(() => true)
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLinks(linksHost, promise = false): Observable<void> | Promise<void> {
    const observable = this.diagramModel.selectLinks().pipe(
      takeUntil(this.diagramModel.onEntityDestroy()),
      map((links) => {
        for (const link of links.values()) {
          if (!link.getPainted().isPainted) {
            const srcPort = link.getSourcePort();
            const targetPort = link.getTargetPort();

            // Attach link first point to source port
            const portCenter = this.getPortCenter(srcPort);
            link.getPoints()[0].setCoords(portCenter);

            // Attach link last point to target port, will occour only for complete links
            if (targetPort) {
              const portCenter = this.getPortCenter(targetPort);
              link
                .getPoints()
                [link.getPoints().length - 1].setCoords(portCenter);
            }

            // Render link component
            this.getFactoriesManager()
              .getFactory({
                factoryType: 'linkFactories',
                modelType: link.getType(),
              })
              .generateWidget({ model: link, host: linksHost });

            // Handle link label, if any
            link
              .selectLabel()
              .pipe(filter(Boolean))
              .subscribe((label: LabelModel) =>
                this.paintLabel(label, linksHost)
              );
          }
        }
      })
    );

    return promise ? observable.toPromise() : observable;
  }

  paintLabel(label: LabelModel, host) {
    if (!label.getPainted().isPainted) {
      this.getFactoriesManager()
        .getFactory({
          factoryType: 'labelFactories',
          modelType: label.getType(),
        })
        .generateWidget({ model: label, host });
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
  }

  /**
   * Unregister the action, post firing and notify subscribers
   */
  stopFiringAction() {
    const stoppedAction = this.action$.getValue()?.action;
    if (stoppedAction) {
      this.action$.next({ action: stoppedAction, state: 'stopped' });
      this.action$.next(null);
      return stoppedAction;
    }
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
