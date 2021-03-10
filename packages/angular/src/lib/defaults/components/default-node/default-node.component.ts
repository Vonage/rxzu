import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  Inject,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnInit,
  Renderer2,
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
import { FactoryService } from '../../../factory.service';

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
    @Host() @Inject(MODEL) public model: NodeModel,
    private factory: FactoryService,
    private diagram: RxZuDiagramComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private iterableDiffers: IterableDiffers
  ) {
    this.portDiffers = this.iterableDiffers
      .find([])
      .create<PortModel>((index, item) => item.id);
  }

  ngOnInit() {
    this.updateNodePosition();
    this.updatePorts();
  }

  getPortsHost() {
    return this.portsLayer;
  }

  updateNodePosition(): void {
    // subscribe to node coordinates
    this.model
      .selectCoords()
      .pipe(takeUntil(this.model.onEntityDestroy()))
      .subscribe(({ x, y }) => {
        this.renderer.setStyle(this.elRef.nativeElement, 'left', `${x}px`);
        this.renderer.setStyle(this.elRef.nativeElement, 'top', `${y}px`);
      });
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
      changes.forEachAddedItem(({ item, currentIndex }) => {
        item.setParent(this.model);
        this.factory.generateWidget({
          model: item,
          host: this.getPortsHost(),
          index: currentIndex ?? undefined,
          diagramModel: this.model.getParent(),
        });
        this.model.updatePortCoords(item, this.diagram.diagramEngine);
      });
      changes.forEachMovedItem(({ previousIndex, currentIndex, item }) => {
        if (
          previousIndex !== null &&
          currentIndex !== null &&
          previousIndex !== currentIndex
        ) {
          const view = this.getPortsHost().get(previousIndex);
          if (view) {
            this.getPortsHost().move(view, currentIndex);
            this.model.updatePortCoords(item, this.diagram.diagramEngine);
          }
        }
      });
      changes.forEachRemovedItem((record) => record.item.destroy());
    }
  }
}
