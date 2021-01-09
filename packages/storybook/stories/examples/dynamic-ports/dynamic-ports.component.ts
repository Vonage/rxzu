import { Component, OnInit } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="addPort()">Add Last Port</button>
      <button (click)="removePort()">Remove First Port</button>
      <button (click)="enlargeNode()">Enlarge Node</button>
    </div>
    <ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>
  `,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class DynamicPortsExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel({ id: '1' });
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    node1.addOutPort({ name: 'outport1', id: 'outport1' });
    node1.addOutPort({ name: 'outport2', id: 'outport2' });
    const outport3 = node1.addOutPort({ name: 'outport3', id: 'outport3' });

    const node2 = new DefaultNodeModel();
    node2.setCoords({ x: 1000, y: 0 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = node2.addInPort({ name: 'inport2' });

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new DefaultNodeModel();
      nodeLoop.setCoords({ x: 1000, y: 300 + index * 300 });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      nodeLoop.addInPort({ name: `inport${index + 3}` });

      this.diagramModel.addNode(nodeLoop);
    }

    const link = outport3.link(inport);
    link.setLocked();

    this.diagramModel.addAll(node1, node2, link);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }

  addPort() {
    const node = this.diagramModel.getNode('1') as DefaultNodeModel;
    const numOfPorts = node.getPorts().values.length;
    node.addOutPort({ name: `inport${numOfPorts}` });
  }

  removePort() {
    const node = this.diagramModel.getNode('1') as DefaultNodeModel;
    const firstPort = node.getPortsArray()[0];
    node.removePort(firstPort);
  }

  enlargeNode() {
    const node = this.diagramModel.getNode('1') as DefaultNodeModel;
    const nodeCurrentDimensions = node.getDimensions();
    node.setDimensions({
      height: nodeCurrentDimensions.height + 50,
    });
  }
}
