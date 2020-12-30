import { ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory, Renderer2 } from '@angular/core';
import { DefaultLabelModel } from '@rxzu/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { CustomLabelComponent } from './custom-label.component';

export class CustomLabelFactory extends AbstractAngularFactory<CustomLabelComponent> {
  constructor(protected resolver: ComponentFactoryResolver, protected renderer: Renderer2) {
    super('custom-label');
  }

  generateWidget({
    model,
    host
  }: {
    model: DefaultLabelModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomLabelComponent> {
    const componentRef = host.createComponent(this.getRecipe());

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

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomLabelComponent> {
    return this.resolver.resolveComponentFactory(CustomLabelComponent);
  }
}
