import { DefaultLinkComponent } from '../components/default-link/default-link.component';
import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import { LinkModel } from '@rxzu/core';
import { AbstractAngularFactory } from './angular.factory';
import { LINK_MODEL } from '../../injection.tokens';

export class DefaultLinkFactory extends AbstractAngularFactory {
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
    model: LinkModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultLinkComponent> {
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

  getRecipe(): ComponentFactory<DefaultLinkComponent> {
    return this.resolver.resolveComponentFactory(DefaultLinkComponent);
  }
}
