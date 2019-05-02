import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';
import { DiagramEngine } from 'ngx-diagrams';
import { NodeModel } from 'projects/ngx-diagrams/src/lib/models/node.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'playground';
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) { }

  ngOnInit() {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createDiagram();

    // this.diagramModel.addNode
    // this.diagramEngine.createModel();


    // this.diagramModel = new DiagramModel();
    const node1 = new NodeModel();
    node1.setPosition(500, 300);
    console.log(node1);
    this.diagramModel.addNode(node1);
    // node1.addPort('out1', 'out');

    // const node2 = new NodeModel();
    // node2.setPosition(200, 300);
    // this.diagramModel.addNode(node2);
    // node2.addPort('in1', 'in');
  }
}
