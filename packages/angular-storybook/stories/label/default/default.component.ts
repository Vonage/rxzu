import { Component, OnInit } from '@angular/core';
import {
  DiagramEngine,
  DiagramModel,
  NodeModel,
  LabelModel,
  PortModel,
  BaseModel,
} from '@rxzu/angular';

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

  constructor(private diagramEngine: DiagramEngine) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const outport = new PortModel({ type: 'default' });
    node1.addPort(outport);

    const node2 = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });

    const inport = new PortModel({ type: 'default' });
    node2.addPort(inport);

    const label = new LabelModel({ text: "I'm a label", type: 'default' });
    const link = outport.link(inport);
    const models: BaseModel[] = [node1, node2];

    if (link) {
      link.setLabel(label);
      link.setLocked();
      models.push(link);
    }

    this.diagramModel.addAll(...models);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
