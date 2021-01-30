import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
  Injector,
} from '@angular/core';
import { AbstractAngularFactory, PORT_MODEL, PortModel } from '@rxzu/angular';
import { CustomPortComponent } from './custom.component';

export class CustomPortFactory extends AbstractAngularFactory {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom');
  }

  generateWidget({
    model,
    host,
  }: {
    model: PortModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomPortComponent> {
    const injector = Injector.create({
      providers: [{ provide: PORT_MODEL, useValue: model }],
    });

    const componentRef = host.createComponent(
      this.getRecipe(),
      undefined,
      injector
    );

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement as HTMLElement;

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-portid', model.id);
    const name = model.getName();

    if (name) {
      this.renderer.setAttribute(rootNode, 'data-name', name);
    }

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomPortComponent> {
    return this.resolver.resolveComponentFactory(CustomPortComponent);
  }
}
