import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  BaseModel,
  DiagramModel,
  DispatchedAction,
  NodeModel,
  PortModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class ActionsExampleStoryComponent implements OnInit, AfterViewInit {
  diagramModel: DiagramModel;
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  @Output() events: EventEmitter<DispatchedAction> = new EventEmitter();

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngOnInit() {
    const node1 = new NodeModel({
      coords: { x: 500, y: 300 },
    });
    const outPort = new PortModel({ id: 'outport1' });
    node1.addPort(outPort);

    const node2 = new NodeModel({
      coords: { x: 1000, y: 0 },
    });

    const inPort = new PortModel({ id: 'inport2' });
    node2.addPort(inPort);

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new NodeModel({
        coords: { x: 1000, y: 300 + index * 300 },
      });
      const portLoop = new PortModel({ id: `inport${index + 3}` });
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

    this.subscribeToDiagramEvents();
  }

  subscribeToDiagramEvents() {
    this.diagram?.diagramEngine
      .getActionsManager()
      .observeActions()
      .pipe(filter((e) => !!e))
      .subscribe((e) => this.events.emit(e!));
  }
}
