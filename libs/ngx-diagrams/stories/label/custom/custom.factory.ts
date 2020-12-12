import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { AbstractLabelFactory, DefaultLabelModel } from 'ngx-diagrams';
import { CustomLabelComponent } from './custom-label.component';

export class CustomLabelFactory extends AbstractLabelFactory<
  DefaultLabelModel
> {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom-label');
  }

  generateWidget(
    label: CustomLabelComponent,
    labelHost: ViewContainerRef
  ): ComponentRef<CustomLabelComponent> {
    const componentRef = labelHost.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for link
    this.renderer.setStyle(rootNode, 'position', 'absolute');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-labelid', label.id);

    // on destroy make sure to destroy the componentRef
    label.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    // assign all passed properties to node initialization.
    Object.entries(label).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomLabelComponent> {
    return this.resolver.resolveComponentFactory(CustomLabelComponent);
  }

  getNewInstance() {
    return new DefaultLabelModel();
  }
}
