import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
} from '@angular/core';
import { DefaultPortModel } from '@rxzu/core';
import { DefaultPortComponent } from '../components/default-port/default-port.component';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultPortFactory extends AbstractAngularFactory<
  DefaultPortComponent
> {
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
    model: DefaultPortModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultPortComponent> {
    const componentRef = nodeHost.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement as HTMLElement;

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-portid', model.id);
    this.renderer.setAttribute(rootNode, 'data-name', model.getName());

    model.in
      ? this.renderer.addClass(rootNode, 'in')
      : this.renderer.addClass(rootNode, 'out');

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultPortComponent> {
    return this.resolver.resolveComponentFactory(DefaultPortComponent);
  }
}
