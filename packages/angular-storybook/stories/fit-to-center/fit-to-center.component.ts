import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  DiagramModel,
  DagrePlugin,
  NodeModel,
  PortModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="center()">Center</button>
    </div>
    <rxzu-diagram class="demo-diagram" [model]="diagramModel"></rxzu-diagram>
  `,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class FitToCenterStoryComponent implements OnInit, AfterViewInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor(private dagreEngine: DagrePlugin) {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const node1 = new NodeModel();
    node1.setCoords({ x: 500, y: 300 });
    const outport1 = new PortModel();
    node1.addPort(outport1);

    const node2 = new NodeModel();
    node2.setCoords({ x: 1000, y: 0 });
    const inport = new PortModel();
    node2.addPort(inport);

    for (let index = 0; index < 10; index++) {
      const nodeLoop = new NodeModel();
      nodeLoop.setCoords({
        x: 1000 * (Math.random() * 10),
        y: 300 + index * (Math.random() * 10) * 300,
      });
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
    setTimeout(() => {
      this.arrange()
      this.diagram?.zoomToFit();
    });
  }

  arrange() {
    this.dagreEngine.redistribute(this.diagramModel, {
      graph: { align: 'DL', rankdir: 'LR', ranksep: 150 },
    });
  }

  center() {
    this.diagramModel.diagramEngine!.fitToCenter();
  }
}
