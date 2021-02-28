import { Component, OnInit, ViewChild } from '@angular/core';
import { DiagramModel, NodeModel, LabelModel, PortModel, BaseModel, RxZuDiagramComponent } from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class CustomLabelDiagramComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel({ type: 'default' });
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const outPort = new PortModel({ type: 'default', name: 'outport' });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      type: 'default',
      coords: { x: 1500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const inPort = new PortModel({ type: 'default', name: 'inport' });
    node2.addPort(inPort);

    const link = outPort.link(inPort);
    const models: BaseModel[] = [node1, node2];
    if (link) {
      const label = new LabelModel({
        text: "I'm a custom label",
        type: 'custom',
      });
      link.setLocked();
      link.setLabel(label);
      models.push(link);
    }

    this.diagramModel.addAll(...models);

    this.diagram?.zoomToFit();
  }
}
