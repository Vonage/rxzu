import { Store, Query, createStore, createQuery } from '@datorama/akita';
import { DiagramEngine } from '../engine.core';
import { Coords } from '../interfaces';
import { DiagramModelOptions } from '../interfaces/options.interface';
import { UID } from '../utils';

export class DiagramManager {
  protected store: Store<DiagramModelOptions>;
  protected query: Query<DiagramModelOptions>;
  private _diagramEngine?: DiagramEngine;

  constructor(diagramEngine: DiagramEngine, options?: DiagramModelOptions) {
    this._diagramEngine = diagramEngine;

    const defaultOptions: DiagramModelOptions = {
      namespace: 'default',
      zoom: 100,
      logPrefix: '[Diagram]',
      offsetX: 0,
      offsetY: 0,
      maxZoomIn: 0,
      maxZoomOut: 0,
      gridSize: 0,
      allowCanvasTranslation: true,
      allowCanvasZoom: true,
      allowLooseLinks: true,
      inverseZoom: true,
      portMagneticRadius: 30,
      keyBindings: {},
      id: UID(),
      locked: false,
    };

    this.store = <Store<DiagramModelOptions>>(
      createStore(
        { ...defaultOptions, ...options },
        { name: `rxzu-diagram-options`, resettable: true }
      )
    );

    this.query = createQuery(this.store);
  }

  set diagramEngine(value: DiagramEngine | undefined) {
    this._diagramEngine = value;
  }

  get diagramEngine(): DiagramEngine | undefined {
    return this._diagramEngine;
  }

  update(state: Partial<Omit<DiagramModelOptions, 'zoom'>>) {
    return this.store.update(state);
  }

  get select() {
    return this.query.select;
  }

  get getValue() {
    return this.query.getValue;
  }

  getGridPosition({ x, y }: Coords): Coords {
    const { gridSize } = this.getValue();
    if (gridSize === 0) {
      return { x, y };
    }

    return {
      x: gridSize * Math.floor((x + gridSize / 2) / gridSize),
      y: gridSize * Math.floor((y + gridSize / 2) / gridSize),
    };
  }

  setZoomLevel(z: number) {
    const { maxZoomIn, maxZoomOut } = this.query.getValue();

    // check if zoom levels exceeded defined boundaries
    if ((maxZoomIn && z > maxZoomIn) || (maxZoomOut && z < maxZoomOut)) {
      return;
    }

    this.store.update({ zoom: z });
  }
}
