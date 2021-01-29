import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  DiagramEngine,
  DiagramModel,
  NodeModel,
  LabelModel,
  PortModel,
  BaseModel,
  AbstractAngularFactory,
} from '@rxzu/angular';
import { CustomLabelFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomLabelDiagramComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine.getFactoriesManager().registerFactory({
      type: 'labelFactories',
      factory: new CustomLabelFactory(
        this.resolver,
        this.renderer
      ) as AbstractAngularFactory,
    });

    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const outPort = new PortModel({ type: 'default', name: 'outport' });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      type: 'default',
      coords: { x: 1500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const inPort = new PortModel({ type: 'default', name: 'inport' });
    node2.addPort(inPort);

    const link = outPort.link(inPort);
    const models: BaseModel[] = [node1, node2];
    if (link) {
      const label = new LabelModel({
        text: "I'm a custom label",
        type: 'custom-label',
      });
      link.setLocked();
      link.setLabel(label);
      models.push(link);
    }

    this.diagramModel.addAll(...models);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
