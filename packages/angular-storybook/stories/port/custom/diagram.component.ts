import { Component, OnInit, ViewChild } from '@angular/core';
import { DiagramModel, NodeModel, PortModel, RxZuDiagramComponent } from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class CustomPortDiagramComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node = new NodeModel({
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const port = new PortModel({ name: 'custom', displayName: 'inport' });
    node.addPort(port);

    this.diagramModel.addAll(node);

    this.diagram?.zoomToFit();
  }
}
