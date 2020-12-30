import { DefaultLinkComponent } from '../components/default-link/default-link.component';
import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { DefaultLinkModel } from '@rxzu/core';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultLinkFactory extends AbstractAngularFactory<
  DefaultLinkComponent
> {
  constructor(
    protected resolver: ComponentFactoryResolver,
    protected renderer: Renderer2
  ) {
    super('default');
  }

  generateWidget({
    model,
    host,
  }: {
    model: DefaultLinkModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultLinkComponent> {
    const componentRef = host.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for link
    this.renderer.setStyle(rootNode, 'position', 'absolute');
    this.renderer.addClass(rootNode, 'label');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-linkid', model.id);

    // on destroy make sure to destroy the componentRef
    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    // assign all passed properties to link initialization.
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultLinkComponent> {
    return this.resolver.resolveComponentFactory(DefaultLinkComponent);
  }
}
