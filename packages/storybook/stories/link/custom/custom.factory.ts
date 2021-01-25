import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { LinkModel } from '@rxzu/core';
import { CustomLinkComponent } from './custom-link.component';

export class CustomLinkFactory extends AbstractAngularFactory {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom-link');
  }

  generateWidget({
    host,
    model,
  }: {
    model: LinkModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomLinkComponent> {
    const componentRef = host.createComponent(this.getRecipe());

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

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomLinkComponent> {
    return this.resolver.resolveComponentFactory(CustomLinkComponent);
  }
}
