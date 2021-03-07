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
export class DefaultLabelStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const outport = new PortModel();
    node1.addPort(outport);

    const node2 = new NodeModel({
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });

    const inport = new PortModel();
    node2.addPort(inport);

    const label = new LabelModel({ text: "I'm a label" });
    const link = outport.link(inport);
    const models: BaseModel[] = [node1, node2];

    if (link) {
      link.setLabel(label);
      link.setLocked();
      models.push(link);
    }

    this.diagramModel.addAll(...models);

    this.diagram?.zoomToFit();
  }
}
