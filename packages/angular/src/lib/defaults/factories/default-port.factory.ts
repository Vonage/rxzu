import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
  Injector,
} from '@angular/core';
import { PortModel } from '@rxzu/core';
import { PORT_MODEL } from '../../injection.tokens';
import { DefaultPortComponent } from '../components/default-port/default-port.component';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultPortFactory extends AbstractAngularFactory {
  constructor(
    protected resolver: ComponentFactoryResolver,
    protected renderer: Renderer2
  ) {
    super('default');
  }

  generateWidget({
    model,
    host: nodeHost,
  }: {
    model: PortModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultPortComponent> {
    const injector = Injector.create({
      providers: [{ provide: PORT_MODEL, useValue: model }],
    });
    const componentRef = nodeHost.createComponent(
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

  getRecipe(): ComponentFactory<DefaultPortComponent> {
    return this.resolver.resolveComponentFactory(DefaultPortComponent);
  }
}
