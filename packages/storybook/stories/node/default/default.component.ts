import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
  styleUrls: ['../demo-diagram.component.scss']
})
export class DefaultNodeComponent implements OnInit, OnChanges {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel();
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);

    this.diagramModel.addAll(node1);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }

  ngOnChanges(e: SimpleChanges) {
    if (this.diagramModel) {
      if (e.nodeHeight) {
        Object.values(this.diagramModel.getNodes()).forEach((node) => {
          node.setHeight(e.nodeHeight.currentValue);
        });
      }

      if (e.nodeWidth) {
        Object.values(this.diagramModel.getNodes()).forEach((node) => {
          node.setWidth(e.nodeWidth.currentValue);
        });
      }
    }
  }
}
