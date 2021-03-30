import {
  ChangeDetectionStrategy,
  Component,
  Host,
  Inject,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnInit,
  Optional,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NodeModel, PortModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';
import {
  filter,
  mapTo,
  pluck,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RxZuDiagramComponent } from '../../../diagram/diagram.component';
import { EngineService } from '../../../engine.service';

@Component({
  selector: 'rxzu-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent implements OnInit {
  private portDiffers: IterableDiffer<PortModel>;
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;

  constructor(
    @Optional() @Host() @Inject(MODEL) public model: NodeModel,
    private engine: EngineService,
    private diagram: RxZuDiagramComponent,
    private iterableDiffers: IterableDiffers
  ) {
    this.portDiffers = this.iterableDiffers
      .find([])
      .create<PortModel>((index, item) => item.id);
  }

  ngOnInit() {
    this.updatePorts();
  }

  getPortsHost() {
    return this.portsLayer;
  }

  updatePorts(): void {
    this.model
      .selectPorts()
      .pipe(
        takeUntil(this.model.onEntityDestroy()),
        filter(
          (ports: PortModel[] | null | undefined): ports is PortModel[] =>
            ports !== null && ports !== undefined
        ),
        tap((ports) => this.applyPortChanges(this.portDiffers.diff(ports))),
        switchMap((ports) =>
          combineLatest(
            ports.map((port) =>
              port
                .paintChanges()
                .pipe(pluck('isPainted'), filter<boolean>(Boolean), take(1))
            )
          )
        ),
        filter((val) => val !== null),
        mapTo(true)
      )
      .subscribe(
        () => !this.model.getPainted().isPainted && this.model.setPainted(true)
      );
  }

  private applyPortChanges(changes: IterableChanges<PortModel> | null): void {
    if (changes) {
      const canvasManager = this.engine.getCanvasManager();
      changes.forEachAddedItem(({ item }) => {
        canvasManager.paintModel(item, this.getPortsHost());
        item.setParent(this.model);
        this.model.updatePortCoords(item, this.diagram.diagramEngine);
      });

      changes.forEachMovedItem(({ item }) => {
        this.model.updatePortCoords(item, this.diagram.diagramEngine);
      });
    }
  }
}
