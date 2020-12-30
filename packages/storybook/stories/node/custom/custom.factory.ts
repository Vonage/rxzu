import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory, Renderer2 } from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { DefaultNodeModel } from '@rxzu/core';
import { CustomNodeComponent } from './custom.component';

export class CustomNodeFactory extends AbstractAngularFactory<DefaultNodeModel> {
  constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer2) {
    super('custom-node');
  }

  generateWidget({
    model,
    host
  }: {
    model: DefaultNodeModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomNodeComponent> {
    const componentRef = host.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for node
    this.renderer.setStyle(rootNode, 'position', 'absolute');
    this.renderer.setStyle(rootNode, 'display', 'block');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-nodeid', model.id);

    // subscribe to node coordinates
    model.selectCoords().subscribe(({ x, y }) => {
      this.renderer.setStyle(rootNode, 'left', `${x}px`);
      this.renderer.setStyle(rootNode, 'top', `${y}px`);
    });

    model.selectionChanges().subscribe((e) => {
      e.isSelected ? this.renderer.addClass(rootNode, 'selected') : this.renderer.removeClass(rootNode, 'selected');
    });

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

  getRecipe(): ComponentFactory<CustomNodeComponent> {
    return this.resolver.resolveComponentFactory(CustomNodeComponent);
  }
}
