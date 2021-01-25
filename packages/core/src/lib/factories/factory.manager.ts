import { AbstractFactory } from './base.factory';

export type FactoryType =
  | 'nodeFactories'
  | 'labelFactories'
  | 'linkFactories'
  | 'portFactories';

export class FactoriesManager {
  protected nodeFactories = new Map<
    string,
    AbstractFactory<unknown, unknown>
  >();
  protected labelFactories = new Map<
    string,
    AbstractFactory<unknown, unknown>
  >();
  protected linkFactories = new Map<
    string,
    AbstractFactory<unknown, unknown>
  >();
  protected portFactories = new Map<
    string,
    AbstractFactory<unknown, unknown>
  >();

  registerFactory<T extends AbstractFactory<any, any>>({
    type,
    factory,
  }: {
    type: FactoryType;
    factory: T;
  }) {
    this[type].set(factory.type, factory);
  }

  getFactory({
    factoryType,
    modelType,
  }: {
    factoryType: FactoryType;
    modelType: string;
  }): AbstractFactory<unknown, unknown> | undefined {
    if (!this[factoryType]) {
      throw new Error(`cannot find factory ${factoryType}`);
    }

    if (!this[factoryType].has(modelType)) {
      throw new Error(
        `cannot find type [${modelType}] in factory [${factoryType}]`
      );
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
