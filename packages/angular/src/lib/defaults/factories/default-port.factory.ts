import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
} from '@angular/core';
import { PortModel } from '@rxzu/core';
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
    const componentRef = nodeHost.createComponent(this.getRecipe());

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

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]: [string, any]) => {
      (componentRef.instance as any)[key] = value;
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultPortComponent> {
    return this.resolver.resolveComponentFactory(DefaultPortComponent);
  }
}
