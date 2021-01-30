import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  DiagramEngine,
  AbstractFactory,
  DiagramModel,
  NodeModel,
  PortModel,
} from '@rxzu/angular';
import { CustomPortFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class CustomPortDiagramComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine.getFactoriesManager().registerFactory({
      type: 'portFactories',
      factory: new CustomPortFactory(
        this.resolver,
        this.renderer
      ) as AbstractFactory<any, any>,
    });
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const port = new PortModel({ type: 'custom', name: 'inport' });
    node.addPort(port);

    this.diagramModel.addAll(node);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
