import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DiagramModel, BaseModel, RxZuDiagramComponent } from '@rxzu/angular';
import { VStudioNodeModel, VStudioPortModel } from './models';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="vonage-studio-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['vonage-studio.component.scss'],
})
export class VStudioExampleStoryComponent implements OnInit, AfterViewInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const node1 = new VStudioNodeModel({
      coords: { x: 500, y: 300 },
      extras: { title: 'Start', icon: 'S' },
    });

    const outPort = new VStudioPortModel({
      id: 'outport1',
      direction: 'out',
    });
    node1.addPort(outPort);

    const node2 = new VStudioNodeModel({
      coords: { x: 1000, y: 0 },
      extras: {
        color: 'rgba(83, 202, 106, 0.7)',
        title: 'Collect Input',
        icon: 'C',
        inputs: [{ content: 'TOPIC: Hello, how can I help you?' }],
      },
    });

    const inPort = new VStudioPortModel({
      id: 'inport2',
    });

    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new VStudioNodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        extras: {
          color: 'rgba(101, 186, 255, 0.7)',
          title: 'Collect Input',
          icon: 'C',
          inputs: [{ content: 'Opening hours' }, { content: 'Opening hours' }],
        },
      });
      const portLoop = new VStudioPortModel({
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

  ngAfterViewInit() {
    this.diagram?.zoomToFit();
  }
}
