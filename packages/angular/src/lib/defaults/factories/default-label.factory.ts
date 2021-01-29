import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { LABEL_MODEL } from '../../injection.tokens';
import { DefaultLabelComponent } from '../components/default-label/default-label.component';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultLabelFactory extends AbstractAngularFactory {
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
    model: LabelModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultLabelComponent> {
    const injector = Injector.create({
      providers: [{ provide: LABEL_MODEL, useValue: model }],
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
    this.renderer.setAttribute(rootNode, 'data-labelid', model.id);

    // on destroy make sure to destroy the componentRef
    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultLabelComponent> {
    return this.resolver.resolveComponentFactory(DefaultLabelComponent);
  }
}
