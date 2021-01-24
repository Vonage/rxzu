import {
  ComponentFactoryResolver,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { AbstractFactory, DiagramEngineCore } from '@rxzu/core';
import {
  DefaultLabelFactory,
  DefaultLinkFactory,
  DefaultNodeFactory,
  DefaultPortFactory,
} from './defaults';
import { RxZuDiagramsModule } from './main.module';

@Injectable({ providedIn: RxZuDiagramsModule })
export class DiagramEngine extends DiagramEngineCore {
  protected _renderer: Renderer2;

  constructor(
    protected resolver: ComponentFactoryResolver,
    protected rendererFactory: RendererFactory2
  ) {
    super();
    this._renderer = this.rendererFactory.createRenderer(null, null);
  }

  registerDefaultFactories() {
    const factoriesManager = this.getFactoriesManager();
    factoriesManager.registerFactory({
      type: 'nodeFactories',
      factory: new DefaultNodeFactory(this.resolver, this._renderer) as AbstractFactory<any, any>,
    });

    factoriesManager.registerFactory({
      type: 'linkFactories',
      factory: new DefaultLinkFactory(this.resolver, this._renderer) as AbstractFactory<any, any>,
    });

    factoriesManager.registerFactory({
      type: 'portFactories',
      factory: new DefaultPortFactory(this.resolver, this._renderer) as AbstractFactory<any, any>,
    });

    factoriesManager.registerFactory({
      type: 'labelFactories',
      factory: new DefaultLabelFactory(this.resolver, this._renderer) as AbstractFactory<any, any>,
    });
  }
}
