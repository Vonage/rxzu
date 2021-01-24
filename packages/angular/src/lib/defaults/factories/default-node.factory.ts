import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import {
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { DiagramModel, NodeModel } from '@rxzu/core';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultNodeFactory extends AbstractAngularFactory {
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
    model: NodeModel;
    host: ViewContainerRef;
    diagramModel: DiagramModel;
  }): ViewContainerRef {
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

    componentRef.instance.setParent(diagramModel);
    componentRef.instance.ngOnInit();
    const portsHost = componentRef.instance.getPortsHost();
    return portsHost;
  }

  getRecipe(): ComponentFactory<DefaultNodeComponent> {
    return this.resolver.resolveComponentFactory(DefaultNodeComponent);
  }
}
