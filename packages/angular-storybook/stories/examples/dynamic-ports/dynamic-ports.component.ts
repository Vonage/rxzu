import { Component, OnInit } from '@angular/core';
import {
  DiagramEngine,
  BaseModel,
  DiagramModel,
  NodeModel,
  PortModel,
} from '@rxzu/angular';

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

  constructor(private diagramEngine: DiagramEngine) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
      id: '1',
    });

    const outPort1 = new PortModel({
      name: 'outport1',
      id: 'outport1',
      type: 'default',
    });
    const outPort2 = new PortModel({
      name: 'outport2',
      id: 'outport2',
      type: 'default',
    });
    const outPort3 = new PortModel({
      name: 'outport3',
      id: 'outport3',
      type: 'default',
    });

    node1.addPort(outPort1);
    node1.addPort(outPort2);
    node1.addPort(outPort3);

    const node2 = new NodeModel({
      type: 'default',
      coords: { x: 1000, y: 0 },
      dimensions: nodesDefaultDimensions,
    });

    const inPort = new PortModel({ type: 'default', name: 'inport2' });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        type: 'default',
        coords: { x: 1000, y: 300 + index * 300 },
        dimensions: nodesDefaultDimensions,
      });

      const loopPort = new PortModel({
        type: 'default',
        name: `inport${index + 3}`,
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

    this.diagramModel.getDiagramEngine().zoomToFit();
  }

  addPort() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }

    const numOfPorts = node.getPorts().values.length;
    const newPort = new PortModel({
      type: 'default',
      name: `inport${numOfPorts}`,
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
