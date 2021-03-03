import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DiagramModel, NodeModel, BaseAction, PortModel, BaseModel, RxZuDiagramComponent } from '@rxzu/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class EventsExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  @Output() events: EventEmitter<{
    action: BaseAction | null;
    state: string | null;
  }> = new EventEmitter();

  constructor() {
    this.diagramModel = new DiagramModel({ name: 'default' });
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      coords: { x: 500, y: 300 },
      name: 'default',
      dimensions: nodesDefaultDimensions,
    });
    const outPort = new PortModel({ name: 'default', displayName: 'outport1' });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      coords: { x: 1000, y: 0 },
      name: 'default',
      dimensions: nodesDefaultDimensions,
    });

    node2.setDimensions(nodesDefaultDimensions);
    const inPort = new PortModel({ name: 'default', displayName: 'inport2' });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        name: 'default',
        dimensions: nodesDefaultDimensions,
      });
      const portLoop = new PortModel({
        name: 'default',
        displayName: `inport${index + 3}`,
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

    this.diagram?.zoomToFit();

    this.subscribeToDiagramEvents();
  }

  subscribeToDiagramEvents() {
    this.diagram?.diagramEngine
      .selectAction()
      .pipe(filter((e) => e !== null))
      .subscribe((e) => this.events.emit(e));
  }
}
