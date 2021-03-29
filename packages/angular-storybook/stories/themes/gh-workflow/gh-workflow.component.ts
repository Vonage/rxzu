import { Component, OnInit, ViewChild } from '@angular/core';
import { DiagramModel, BaseModel, RxZuDiagramComponent } from '@rxzu/angular';
import { GHNodeModel, GHPortModel } from './models';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class GHWorkfflowExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const node1 = new GHNodeModel({
      coords: { x: 500, y: 300 },
      extras: [
        {
          id: '4',
          displayName: 'START',
          status: 'success',
          executionTime: 2622,
        },
      ],
    });

    const outPort = new GHPortModel({
      id: 'outport1',
      direction: 'out',
    });
    node1.addPort(outPort);

    const node2 = new GHNodeModel({
      coords: { x: 1000, y: 0 },
      extras: [
        {
          id: '3',
          displayName: 'Security Pipeline',
          status: 'fail',
          executionTime: 231,
        },
      ],
    });

    const inPort = new GHPortModel({
      id: 'inport2',
    });

    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new GHNodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        extras: [
          {
            id: '2',
            displayName: `Extra success ${index}`,
            status: 'success',
            executionTime: 2622,
          },
          {
            id: '1',
            displayName: `Extra fail ${index}`,
            status: 'fail',
            executionTime: 2622,
          },
        ],
      });
      const portLoop = new GHPortModel({
        id: `inport${index + 3}`,
      });
      nodeLoop.addPort(portLoop);

      this.diagramModel.addNode(nodeLoop);
    }

    const link = outPort.link(inPort);
    const models: BaseModel[] = [node1, node2];
    if (link) {
      link.setLocked();
      models.push(link);
    }

    this.diagramModel.addAll(...models);
  }
}
