import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  BaseModel,
  DiagramModel,
  NodeModel,
  PortModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="addPort()">Add Last Port</button>
      <button (click)="removePort()">Remove First Port</button>
    </div>
    <rxzu-diagram class="demo-diagram" [model]="diagramModel"></rxzu-diagram>
  `,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class DynamicPortsExampleStoryComponent
  implements OnInit, AfterViewInit {
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
      id: '1',
    });

    const outPort1 = new PortModel({ id: '1' });
    const outPort2 = new PortModel({ id: '2' });
    const outPort3 = new PortModel({ id: '3' });

    node1.addPort(outPort1);
    node1.addPort(outPort2);
    node1.addPort(outPort3);

    const node2 = new NodeModel({
      coords: { x: 1000, y: 0 },
      dimensions: nodesDefaultDimensions,
    });

    const inPort = new PortModel();
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        dimensions: nodesDefaultDimensions,
      });

      const loopPort = new PortModel();
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
  }

  ngAfterViewInit() {
    this.diagram?.zoomToFit();
  }

  addPort() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }
    const portsArray = node.getPortsArray();
    const lastPort = portsArray[portsArray.length - 1];
    let newId: string;
    if (!lastPort) {
      newId = '0';
    } else {
      newId = (+lastPort.id + 1).toString();
    }

    const newPort = new PortModel({ id: newId });
    node.addPort(newPort);
  }

  removePort() {
    const node = this.diagramModel.getNode('1');
    if (!node) {
      return;
    }

    const firstPort = node.getPortsArray()[0];
    if (firstPort) {
      node.removePort(firstPort);
    }
  }
}
