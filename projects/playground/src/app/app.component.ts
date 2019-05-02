import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';
import { NodeModel } from 'projects/ngx-diagrams/src/lib/models/node.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'playground';
  diagramModel: DiagramModel;

  constructor(
    // DiagramEngine: DiagramEngineService
  ) { }

  ngOnInit() {
    // this.diagramEngine.createModel();


    this.diagramModel = new DiagramModel();
    const node1 = new NodeModel();
    node1.setPosition(500, 300);
    this.diagramModel.addNode(node1);
    node1.addPort('out1', 'out');

    const node2 = new NodeModel();
    node2.setPosition(200, 300);
    this.diagramModel.addNode(node2);
    node2.addPort('in1', 'in');
  }
}
