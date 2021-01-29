import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import { AbstractAngularFactory, LinkModel, LINK_MODEL } from '@rxzu/angular';
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
    const injector = Injector.create({
      providers: [{ provide: LINK_MODEL, useValue: model }],
    });
    const componentRef = host.createComponent(
      this.getRecipe(),
      undefined,
      injector
    );

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

    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomLinkComponent> {
    return this.resolver.resolveComponentFactory(CustomLinkComponent);
  }
}
