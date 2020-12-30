import { Component, OnInit } from '@angular/core';
import { DiagramEngine, DagreEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="autoArrange()">Auto Arrange</button>
    </div>
    <ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>
  `,
  styleUrls: ['../demo-diagram.component.scss']
})
export class AutoArrangeExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine, private dagreEngine: DagreEngine) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    const outport1 = node1.addOutPort({ name: 'outport1' });

    const node2 = new DefaultNodeModel();
    node2.setCoords({ x: 1000, y: 0 });
    node2.setDimensions(nodesDefaultDimensions);
    const inport = node2.addInPort({ name: 'inport2' });

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new DefaultNodeModel();
      nodeLoop.setCoords({
        x: 1000 * (Math.random() * 10),
        y: 300 + index * (Math.random() * 10) * 300
      });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      const inportLoop = nodeLoop.addInPort({ name: `inport${index + 3}` });

      this.diagramModel.addNode(nodeLoop);

      const linkLoop = outport1.link(inportLoop);
      this.diagramModel.addLink(linkLoop);
    }

    const link = outport1.link(inport);

    this.diagramModel.addAll(node1, node2, link);

    this.diagramEngine.zoomToFit();
  }

  autoArrange() {
    this.dagreEngine.redistribute(this.diagramModel, {
      graph: { align: 'DL', rankdir: 'LR', ranksep: 150 }
    });
    this.diagramEngine.zoomToFit();
  }
}
