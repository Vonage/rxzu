import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import { AbstractAngularFactory, LabelModel, LABEL_MODEL } from '@rxzu/angular';
import { CustomLabelComponent } from './custom-label.component';

export class CustomLabelFactory extends AbstractAngularFactory {
  constructor(
    protected resolver: ComponentFactoryResolver,
    protected renderer: Renderer2
  ) {
    super('custom-label');
  }

  generateWidget({
    model,
    host,
  }: {
    model: LabelModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomLabelComponent> {
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

  getRecipe(): ComponentFactory<CustomLabelComponent> {
    return this.resolver.resolveComponentFactory(CustomLabelComponent);
  }
}
