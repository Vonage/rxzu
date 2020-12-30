import { ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory, Renderer2 } from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { DefaultLinkModel } from '@rxzu/core';
import { CustomLinkComponent } from './custom-link.component';

export class CustomLinkFactory extends AbstractAngularFactory<CustomLinkComponent> {
  constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer2) {
    super('custom-link');
  }

  generateWidget({
    host,
    model
  }: {
    model: DefaultLinkModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomLinkComponent> {
    const componentRef = host.createComponent(this.getRecipe());
    model.setWidth(1);
    model.setColor('pink');
    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for link
    this.renderer.setStyle(rootNode, 'position', 'absolute');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-linkid', model.id);

    // on destroy make sure to destroy the componentRef
    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomLinkComponent> {
    return this.resolver.resolveComponentFactory(CustomLinkComponent);
  }
}
