import {
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { NodeModel, DiagramModel, NodeModelOptions } from '@rxzu/core';
import { CustomNodeComponent } from './custom.component';

export class CustomNodeFactory extends AbstractAngularFactory {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom-node');
  }

  generateWidget({
    model,
    host,
    diagramModel,
  }: {
    model: NodeModel;
    host: ViewContainerRef;
    diagramModel?: DiagramModel;
  }): ViewContainerRef {
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
      e.isSelected
        ? this.renderer.addClass(rootNode, 'selected')
        : this.renderer.removeClass(rootNode, 'selected');
    });

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]: [string, any]) => {
      (componentRef.instance as any)[key] = value;
    });

    if (diagramModel) {
      componentRef.instance.setParent(diagramModel);
    }

    componentRef.instance.ngOnInit();
    const portsHost = componentRef.instance.getPortsHost();
    return portsHost;
  }

  getRecipe(): ComponentFactory<CustomNodeComponent> {
    return this.resolver.resolveComponentFactory(CustomNodeComponent);
  }
}
