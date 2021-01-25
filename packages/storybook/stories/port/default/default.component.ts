import { Component, OnInit } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, NodeModel, PortModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class DefaultPortComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(private diagramEngine: DiagramEngine) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node = new NodeModel({
      type: 'default',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });
    const inPort = new PortModel({ type: 'default', name: 'inport' });
    const outPort = new PortModel({ type: 'default', name: 'outport' });
    node.addPort(inPort);
    node.addPort(outPort);
    this.diagramModel.addAll(node);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
