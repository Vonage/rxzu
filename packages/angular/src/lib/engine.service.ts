import {
  ComponentFactoryResolver,
  Injectable,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import { DiagramEngine } from '@rxzu/core';
import { FactoryService } from './factory.service';

@Injectable()
export class EngineService extends DiagramEngine {
  protected _renderer: Renderer2;

  constructor(
    protected resolver: ComponentFactoryResolver,
    protected rendererFactory: RendererFactory2,
    protected factory: FactoryService
  ) {
    super(factory);
    this._renderer = this.rendererFactory.createRenderer(null, null);
  }
}
