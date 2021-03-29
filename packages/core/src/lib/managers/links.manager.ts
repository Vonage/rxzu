import {
  createEntityQuery,
  createEntityStore,
  EntityStore,
  QueryEntity,
} from '@datorama/akita';
import { DiagramEngine } from '../engine.core';
import { LinkModelOptions } from '../interfaces/options.interface';

export class LinksManager {
  protected store: EntityStore<LinkModelOptions>;
  protected query: QueryEntity<LinkModelOptions>;
  private _diagramEngine?: DiagramEngine;

  constructor(diagramEngine: DiagramEngine, options?: LinkModelOptions) {
    this._diagramEngine = diagramEngine;
    this.store = createEntityStore({}, { name: 'rxzu-diagram-links' });
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
