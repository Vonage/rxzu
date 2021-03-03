import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  DiagramModel,
  NodeModel,
  PortModel,
  BaseModel,
  DiagramEngine,
  BaseAction,
} from '@rxzu/angular';
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

  @Output() events: EventEmitter<{
    action: BaseAction | null;
    state: string | null;
  }> = new EventEmitter();

  constructor(private diagramEngine: DiagramEngine) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };

    const node1 = new NodeModel({
      coords: { x: 500, y: 300 },
      type: 'default',
      dimensions: nodesDefaultDimensions,
    });
    const outPort = new PortModel({ type: 'default', name: 'outport1' });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      coords: { x: 1000, y: 0 },
      type: 'default',
      dimensions: nodesDefaultDimensions,
    });

    node2.setDimensions(nodesDefaultDimensions);
    const inPort = new PortModel({ type: 'default', name: 'inport2' });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
        type: 'default',
        dimensions: nodesDefaultDimensions,
      });
      const portLoop = new PortModel({
        type: 'default',
        name: `inport${index + 3}`,
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

    this.diagramModel.getDiagramEngine().zoomToFit();

    this.subscribeToDiagramEvents();
  }

  subscribeToDiagramEvents() {
    this.diagramEngine
      .selectAction()
      .pipe(filter((e) => e !== null))
      .subscribe((e) => this.events.emit(e));
  }
}
