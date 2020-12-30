import { Component, ComponentFactoryResolver, OnInit, Renderer2 } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel, DefaultLabelModel } from '@rxzu/core';
import { CustomLabelFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
  styleUrls: ['../demo-diagram.component.scss']
})
export class CustomLabelDiagramComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine
      .getFactoriesManager()
      .registerFactory({ type: 'labelFactories', factory: new CustomLabelFactory(this.resolver, this.renderer) });

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    const outport1 = node1.addOutPort({ name: 'outport1' });

    const node2 = new DefaultNodeModel();
    node2.setCoords({ x: 1500, y: 300 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = node2.addInPort({ name: 'inport2' });

    const link = outport1.link(inport);
    const label = new DefaultLabelModel("I'm a custom label", 'custom-label');
    link.setLabel(label);
    link.setLocked();

    this.diagramModel.addAll(node1, node2, link);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
