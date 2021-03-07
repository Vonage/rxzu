import { Component, OnInit, ViewChild } from '@angular/core';
import { NodeModel, DiagramModel, PortModel, BaseModel, RxZuDiagramComponent } from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class DefaultLinkStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);

    const outport1 = new PortModel({ displayName: 'outport' });
    node1.addPort(outport1);

    const node2 = new NodeModel();
    node2.setCoords({ x: 1000, y: 0 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = new PortModel({ displayName: 'inport' });
    node2.addPort(inport);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel();
      nodeLoop.setCoords({ x: 1000, y: 300 + index * 300 });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      const loopPort = new PortModel();
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

    this.diagram?.zoomToFit();
  }
}
