import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DiagramModel,
  NodeModel,
  PortModel,
  BaseModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class GHWorkfflowExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
      namespace: 'gh',
    });
    const outPort = new PortModel({
      id: 'outport1',
      namespace: 'gh',
      linkNamespace: 'gh',
    });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      coords: { x: 1000, y: 0 },
      dimensions: nodesDefaultDimensions,
      namespace: 'gh',
    });

    node2.setDimensions(nodesDefaultDimensions);
    const inPort = new PortModel({
      id: 'inport2',
      namespace: 'gh',
      linkNamespace: 'gh',
    });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        dimensions: nodesDefaultDimensions,
        namespace: 'gh',
      });
      const portLoop = new PortModel({
        id: `inport${index + 3}`,
        namespace: 'gh',
        linkNamespace: 'gh',
      });
      nodeLoop.addPort(portLoop);

      this.diagramModel.addNode(nodeLoop);
    }

    const link = outPort.link(inPort);
    const models: BaseModel[] = [node1, node2];
    if (link) {
      link.setLocked();
      models.push(link);
    }

    this.diagramModel.addAll(...models);
  }
}
