import { BaseModel } from '../models';
import { AbstractFactory } from './base.factory';

export type FactoryType = 'nodeFactories' | 'labelFactories' | 'linkFactories' | 'portFactories';

export class FactoriesManager<T extends AbstractFactory<BaseModel, unknown, unknown>> {
  protected nodeFactories = new Map<string, T>();
  protected labelFactories = new Map<string, T>();
  protected linkFactories = new Map<string, T>();
  protected portFactories = new Map<string, T>();

  registerFactory({ type, factory }: { type: FactoryType; factory: T }) {
    this[type].set(factory.type, factory);
  }

  getFactory({ factoryType, modelType }: { factoryType: FactoryType; modelType: string }): T {
    if (!this[factoryType]) {
      throw new Error(`cannot find factory ${factoryType}`);
    }

    if (!this[factoryType].has(modelType)) {
      throw new Error(`cannot find type [${modelType}] in factory [${factoryType}]`);
    }

    return this[factoryType].get(modelType);
  }

  disposeFactory(factoryType: FactoryType) {
    this[factoryType].clear();
  }

  dispose() {
    this.disposeFactory('labelFactories');
    this.disposeFactory('nodeFactories');
    this.disposeFactory('linkFactories');
    this.disposeFactory('portFactories');
  }
}
