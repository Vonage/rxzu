import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseModel, DiagramModel, NodeModel, PortModel, RxZuDiagramComponent } from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="addPort()">Add Last Port</button>
      <button (click)="removePort()">Remove First Port</button>
      <button (click)="enlargeNode()">Enlarge Node</button>
    </div>
    <rxzu-diagram class="demo-diagram" [model]="diagramModel"></rxzu-diagram>
  `,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class DynamicPortsExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel({ name: 'default' });
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      name: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
      id: '1',
    });

    const outPort1 = new PortModel({
      id: 'outport1',
      name: 'default',
    });
    const outPort2 = new PortModel({
      id: 'outport2',
      name: 'default',
    });
    const outPort3 = new PortModel({
      id: 'outport3',
      name: 'default',
    });

    node1.addPort(outPort1);
    node1.addPort(outPort2);
    node1.addPort(outPort3);

    const node2 = new NodeModel({
      name: 'default',
      coords: { x: 1000, y: 0 },
      dimensions: nodesDefaultDimensions,
    });

    const inPort = new PortModel({ name: 'default' });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        name: 'default',
        coords: { x: 1000, y: 300 + index * 300 },
        dimensions: nodesDefaultDimensions,
      });

      const loopPort = new PortModel({
        name: 'default',
      });
      nodeLoop.addPort(loopPort);

      this.diagramModel.addNode(nodeLoop);
    }

    const link = outPort3.link(inPort);
    const models: BaseModel[] = [node1, node2];

    if (link) {
      link.setLocked();
      models.push(link);
    }
    this.diagramModel.addAll(...models);

    this.diagram?.zoomToFit();
  }

  addPort() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }

    const numOfPorts = node.getPorts().values.length;
    const newPort = new PortModel({
      name: 'default',
      displayName: `inport${numOfPorts}`,
    });
    node.addPort(newPort);
  }

  removePort() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }

    const firstPort = node.getPortsArray()[0];
    node.removePort(firstPort);
  }

  enlargeNode() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }

    const nodeCurrentDimensions = node.getDimensions();
    node.setDimensions({
      height: nodeCurrentDimensions.height + 50,
    });
  }
}
