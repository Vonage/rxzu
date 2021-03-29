import {
  createEntityQuery,
  createEntityStore,
  EntityStore,
  QueryEntity,
} from '@datorama/akita';
import { DiagramEngine } from '../engine.core';
import { NodeModelOptions } from '../interfaces/options.interface';

export class NodesManager {
  protected store: EntityStore<NodeModelOptions>;
  protected query: QueryEntity<NodeModelOptions>;
  private _diagramEngine?: DiagramEngine;

  constructor(diagramEngine: DiagramEngine, options?: NodeModelOptions) {
    this._diagramEngine = diagramEngine;
    this.store = createEntityStore({}, { name: 'rxzu-diagram-nodes' });
    this.query = createEntityQuery(this.store);
  }

  set diagramEngine(value: DiagramEngine | undefined) {
    this._diagramEngine = value;
  }

  get diagramEngine(): DiagramEngine | undefined {
    return this._diagramEngine;
  }

  get update() {
    return this.store.update;
  }

  get select() {
    return this.query.select;
  }

  get getValue() {
    return this.query.getValue;
  }
}
