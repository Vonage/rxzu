import {
  ComponentFactoryResolver, ComponentRef,
  Injectable,
  Injector, Renderer2,
  Type,
  ViewContainerRef
} from '@angular/core';
import { AbstractFactory, BaseModel, WidgetOptions } from '@rxzu/core';
import { RegistryService } from './registry.service';
import { MODEL } from './injection.tokens';

@Injectable()
export class FactoryService extends AbstractFactory<Type<any>, ComponentRef<any>> {

  constructor(registry: RegistryService, private cfr: ComponentFactoryResolver, private renderer: Renderer2) {
    super(registry);
  }

  resolveComponent<M extends BaseModel>({ model, host, index, diagramModel }: WidgetOptions<M, ViewContainerRef>): ComponentRef<any> | null {
    const cmp = this.get(model);
    if (!cmp) return null;

    const injector = Injector.create({ providers: [{ provide: MODEL, useValue: model }], parent: host.injector });
    const ref = host.createComponent(this.cfr.resolveComponentFactory(cmp), index, injector);

    this.renderer.setAttribute(ref.location.nativeElement, 'data-id', model.id);

    return ref;
  }
}
