import {
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  Renderer2,
  Injector,
} from '@angular/core';
import {
  AbstractAngularFactory,
  NODE_MODEL,
  NodeModel,
  DiagramModel,
} from '@rxzu/angular';
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

    const rootNode = componentRef.location.nativeElement;

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-nodeid', model.id);

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    const portsHost = componentRef.instance.getPortsHost();
    return portsHost;
  }

  getRecipe(): ComponentFactory<CustomNodeComponent> {
    return this.resolver.resolveComponentFactory(CustomNodeComponent);
  }
}
