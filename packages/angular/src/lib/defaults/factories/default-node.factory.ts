import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import {
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { DefaultNodeModel, DiagramModel } from '@rxzu/core';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultNodeFactory extends AbstractAngularFactory<
  DefaultNodeComponent
> {
  constructor(
    protected resolver: ComponentFactoryResolver,
    protected renderer: Renderer2
  ) {
    super('default');
  }

  generateWidget({
    model,
    host,
    diagramModel,
  }: {
    model: DefaultNodeModel;
    host: ViewContainerRef;
    diagramModel?: DiagramModel;
  }): ComponentRef<DefaultNodeComponent> {
    const componentRef = host.createComponent(this.getRecipe(), host.length);

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
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

    componentRef.instance.setParent(diagramModel);
    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultNodeComponent> {
    return this.resolver.resolveComponentFactory(DefaultNodeComponent);
  }
}
