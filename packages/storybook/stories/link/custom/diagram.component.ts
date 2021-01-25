import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  DiagramEngine,
  DiagramModel,
  NodeModel,
  LinkModel,
  PortModel,
  AbstractFactory,
} from '@rxzu/angular';
import { CustomLinkFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomLinkDiagramComponent implements OnInit {
  diagramModel: DiagramModel;
  @Input() nodeHeight = 200;
  @Input() nodeWidth = 200;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine.getFactoriesManager().registerFactory({
      type: 'linkFactories',
      factory: new CustomLinkFactory(
        this.resolver,
        this.renderer
      ) as AbstractFactory<any, any>,
    });

    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = {
      height: this.nodeHeight,
      width: this.nodeWidth,
    };

    const node1 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });

    const outport1 = new PortModel({
      name: 'outport1',
      linkType: 'custom-link',
      maximumLinks: 3,
      type: 'default',
    });
    node1.addPort(outport1);

    const node2 = new NodeModel({
      type: 'default',
      coords: { x: 1000, y: 300 },
      dimensions: nodesDefaultDimensions,
    });

    const inport = new PortModel({ type: 'default', name: 'inport2' });
    node2.addPort(inport);

    const link = new LinkModel({ type: 'custom-link' });

    link.setSourcePort(outport1);
    link.setTargetPort(inport);

    this.diagramModel.addAll(node1, node2, link);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
