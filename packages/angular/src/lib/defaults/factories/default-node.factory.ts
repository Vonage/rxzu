import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import {
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import { DiagramModel, NodeModel } from '@rxzu/core';
import { AbstractAngularFactory } from './angular.factory';
import { NODE_MODEL } from '../../injection.tokens';

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
    const injector = Injector.create({
      providers: [{ provide: NODE_MODEL, useValue: model }],
    });

    const componentRef = host.createComponent(
      this.getRecipe(),
      undefined,
      injector
    );

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for node
    this.renderer.setStyle(rootNode, 'position', 'absolute');
    this.renderer.setStyle(rootNode, 'display', 'block');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-nodeid', model.id);

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    const portsHost = componentRef.instance.getPortsHost();
    return portsHost;
  }

  getRecipe(): ComponentFactory<DefaultNodeComponent> {
    return this.resolver.resolveComponentFactory(DefaultNodeComponent);
  }
}
