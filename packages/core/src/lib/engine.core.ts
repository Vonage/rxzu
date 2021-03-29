import { delay, filter, take } from 'rxjs/operators';
import { BaseEntity } from './base.entity';
import { DiagramModel, NodeModel } from './models';
import { DiagramModelOptions, EngineSetup } from './interfaces';
import {
  ActionsManager,
  CanvasManager,
  DiagramManager,
  KeyboardManager,
  LabelsManager,
  LinksManager,
  MouseManager,
  NodesManager,
  PointsManager,
  PortsManager,
} from './managers';
import { AbstractFactory } from './factories';

import { isDev } from './utils';
import { akitaDevtools } from '@datorama/akita';

export class DiagramEngine {
  protected actionsManager: ActionsManager;
  protected mouseManager: MouseManager;
  protected keyboardManager: KeyboardManager;
  protected canvasManager: CanvasManager;

  protected diagramModel: DiagramModel | undefined;

  constructor(
    protected factory: AbstractFactory,
    protected _canvas?: HTMLElement,
    protected _mouseManager?: MouseManager,
    protected _keyboardManager?: KeyboardManager,
    protected _actionsManager?: ActionsManager,
    protected _canvasManager?: CanvasManager
  ) {
    new DiagramManager(this);
    new NodesManager(this);
    new PointsManager(this);
    new LinksManager(this);
    new LabelsManager(this);
    new PortsManager(this);
    this.actionsManager = _actionsManager || this.createActionsManager();
    this.mouseManager = _mouseManager || this.createMouseManager();
    this.keyboardManager = _keyboardManager || this.createKeyboardManager();
    this.canvasManager = _canvasManager || this.createCanvasManager(_canvas);

    if (isDev()) {
      akitaDevtools({ name: 'rxzu-diagram' });
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
    keyBindings,
  }: EngineSetup) {
    const diagramModel = this.getDiagramModel();
    diagramModel.setAllowCanvasZoom(allowCanvasZoom ?? true);
    diagramModel.setAllowCanvasTranslation(allowCanvasTranslation ?? true);
    diagramModel.setInverseZoom(inverseZoom ?? false);
    diagramModel.setAllowLooseLinks(allowLooseLinks ?? true);
    diagramModel.setPortMagneticRadius(portMagneticRadius ?? 30);
    diagramModel.setMaxZoomIn(maxZoomIn ?? 0);
    diagramModel.setMaxZoomOut(maxZoomOut ?? 0);
    diagramModel.setKeyBindings(keyBindings ?? {});
  }

  createMouseManager(): MouseManager {
    if (this.mouseManager) {
      console.warn('[RxZu] Mouse Manager already initialized, bailing out.');
      return this.mouseManager;
    }

    return new MouseManager(this);
  }

  createCanvasManager(canvas?: HTMLElement): CanvasManager {
    if (this.canvasManager) {
      console.warn('[RxZu] Mouse Manager already initialized, bailing out.');
      return this.canvasManager;
    }

    return new CanvasManager(this, canvas);
  }

  createActionsManager(): ActionsManager {
    if (this.actionsManager) {
      console.warn('[RxZu] Actions Manager already initialized, bailing out.');
      return this.actionsManager;
    }

    return new ActionsManager();
  }

  createKeyboardManager() {
    if (this.keyboardManager) {
      console.warn('[RxZu] Keyboard Manager already initialized, bailing out.');
      return this.keyboardManager;
    }

    return new KeyboardManager(this);
  }

  setModel(model: DiagramModel): DiagramModel {
    if (this.diagramModel) {
      throw new Error(
        'diagram model already exists, please reset model prior to creating new diagram'
      );
    }

    this.diagramModel = model;

    this.diagramModel.diagramEngine = this;

    this.diagramModel.onEntityDestroy().subscribe(() => {
      this.diagramModel = undefined;
    });

    return model;
  }

  createModel(options?: DiagramModelOptions): DiagramModel {
    if (this.diagramModel) {
      throw new Error(
        'diagram model already exists, please reset model prior to creating new diagram'
      );
    }

    this.diagramModel = new DiagramModel(options, this);

    this.diagramModel.onEntityDestroy().subscribe(() => {
      this.diagramModel = undefined;
    });

    return this.diagramModel;
  }

  getMouseManager() {
    return this.mouseManager;
  }

  getActionsManager() {
    return this.actionsManager;
  }

  getKeyboardManager() {
    return this.keyboardManager;
  }

  getCanvasManager() {
    return this.canvasManager;
  }

  getDiagramModel() {
    if (!this.diagramModel) {
      throw new Error(
        '[RxZu] No model found, please create one and assign it to the engine.'
      );
    }
    return this.diagramModel;
  }

  getFactory() {
    return this.factory;
  }

  isModelLocked(model: BaseEntity) {
    const diagramModel = this.getDiagramModel();
    if (diagramModel.getLocked()) {
      return true;
    }

    return model.getLocked();
  }

  /**
   * @description get the bounding rectangle of the input group of nodes
   * @param margin allow for further zooming out to make sure edges doesn't cut (in px)
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
   * @description fit the canvas zoom levels and offset to the nodes contained.
   * @param nodes set zoom and offset so that all those node will be seen at view
   * @param margin allow for further zooming out to make sure edges doesn't cut (in px)
   */
  zoomToNodes(nodes: NodeModel[], margin = 100) {
    if (!nodes || nodes.length === 0) {
      console.warn('[RxZu] No input nodes were found');
      return;
    }
    const diagramModel = this.getDiagramModel();

    if (diagramModel) {
      this.canvasManager
        .selectCanvas()
        .pipe(
          filter(
            (canvas: HTMLElement | null | undefined): canvas is HTMLElement =>
              canvas !== null && canvas !== undefined
          ),
          take(1),
          delay(0)
        )
        .subscribe((canvas) => {
          // get nodes layers bounding rect with the desired margin
          const nodesLayersRect = this.canvasManager.getNodeLayersRect(
            nodes,
            margin
          );

          // calculate the zoom factor and set the new zoom
          const xFactor = canvas.clientWidth / nodesLayersRect?.width;
          const yFactor = canvas.clientHeight / nodesLayersRect.height;
          const zoomFactor = Math.min(xFactor, yFactor);
          diagramModel.setZoomLevel(zoomFactor * 100);

          // get canvas top and left values including the offset
          const canvasRect = canvas.getBoundingClientRect();
          const canvasRelativeTopLeftPoint = {
            top: diagramModel.getOffsetY() + canvasRect.top,
            left: diagramModel.getOffsetX() + canvasRect.left,
          };

          // calc nodes rect top left values
          const nodesRectTopLeftPoint = {
            top:
              canvasRelativeTopLeftPoint.top + nodesLayersRect.top * zoomFactor,
            left:
              canvasRelativeTopLeftPoint.left +
              nodesLayersRect.left * zoomFactor,
          };

          // set the new offset to the diagram
          diagramModel.setOffset(
            canvasRelativeTopLeftPoint.left - nodesRectTopLeftPoint.left,
            canvasRelativeTopLeftPoint.top - nodesRectTopLeftPoint.top
          );
        });
    }
  }
}
