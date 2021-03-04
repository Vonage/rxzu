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
export class DefaultPortStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;


  constructor() {
    this.diagramModel = new DiagramModel({ name: 'default' });
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node = new NodeModel({
      name: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const inPort = new PortModel({ name: 'default', displayName: 'inport' });
    const outPort = new PortModel({ name: 'default', displayName: 'outport' });
    node.addPort(inPort);
    node.addPort(outPort);
    this.diagramModel.addAll(node);

    this.diagram?.zoomToFit();
  }
}
