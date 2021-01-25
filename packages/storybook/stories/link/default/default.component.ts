import { Component, OnInit } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { NodeModel, DiagramModel, PortModel, BaseModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class DefaultLinkStoryComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({ type: 'default' });
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);

    const outport1 = new PortModel({ type: 'default', name: 'outport' });
    node1.addPort(outport1);

    const node2 = new NodeModel({ type: 'default' });
    node2.setCoords({ x: 1000, y: 0 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = new PortModel({ type: 'default', name: 'inport' });
    node2.addPort(inport);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({ type: 'default' });
      nodeLoop.setCoords({ x: 1000, y: 300 + index * 300 });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      const loopPort = new PortModel({ type: 'default' });
      nodeLoop.addPort(loopPort);
      this.diagramModel.addNode(nodeLoop);
    }

    const models: BaseModel[] = [node1, node2];
    const link = outport1.link(inport);

    if (link) {
      link.setLocked();
      models.push(link);
    }

    this.diagramModel.addAll(...models);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
