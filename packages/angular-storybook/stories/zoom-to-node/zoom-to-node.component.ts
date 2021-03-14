import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  DiagramModel,
  NodeModel,
  PortModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="zoomToNode()">Zoom to node</button>
    </div>
    <rxzu-diagram class="demo-diagram" [model]="diagramModel"></rxzu-diagram>
  `,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class ZoomToNodeExampleStoryComponent implements OnInit, AfterViewInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    const node1 = new NodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    const outport1 = new PortModel();
    node1.addPort(outport1);

    const node2 = new NodeModel();
    node2.setCoords({ x: 100, y: 100 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = new PortModel();
    node2.addPort(inport);
    node2.setSelected(true);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel();
      nodeLoop.setCoords({
        x: 1000 * (Math.random() * 10),
        y: 300 + index * (Math.random() * 10) * 300,
      });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      const inportLoop = new PortModel();
      node2.addPort(inport);
      nodeLoop.addPort(inportLoop);

      this.diagramModel.addNode(nodeLoop);

      const linkLoop = outport1.link(inportLoop);
      if (linkLoop) {
        this.diagramModel.addLink(linkLoop);
      }
    }

    this.diagramModel.addAll(node1, node2);
  }

  ngAfterViewInit() {
    this.diagram?.zoomToFit();
  }

  zoomToNode() {
    const allNodes = this.diagramModel.getNodesArray();
    const nodeToZoomInto = allNodes[allNodes.length - 1];
    this.diagram?.zoomToNodes([nodeToZoomInto], 100);
  }
}
