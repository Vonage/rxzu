import { Component, OnInit } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
  styleUrls: ['../demo-diagram.component.scss']
})
export class DefaultPortComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    node1.addInPort({ name: 'inport1' });
    node1.addOutPort({ name: 'outport1' });

    this.diagramModel.addAll(node1);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
