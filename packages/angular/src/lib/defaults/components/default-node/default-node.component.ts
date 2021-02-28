import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, Host,
  Inject, IterableChanges, IterableDiffer, IterableDiffers, OnInit, Optional,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { NodeModel, PortModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';
import { filter, mapTo, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RxZuDiagramComponent } from '../../../diagram/diagram.component';
import { FactoryService } from '../../../factory.service';

@Component({
  selector: 'rxzu-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-nodeid]': `model?.id`
  }
})
export class DefaultNodeComponent implements OnInit {
  private portDiffers: IterableDiffer<PortModel>;
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;
  rootNode: HTMLElement;

  constructor(
    @Host() @Optional() @Inject(MODEL) public model: NodeModel,
    private factory: FactoryService,
    private diagram: RxZuDiagramComponent,
    private rootEl: ElementRef,
    private renderer: Renderer2,
    iterableDiffers: IterableDiffers
  ) {
    this.rootNode = this.rootEl.nativeElement;
    console.log(model);
    this.portDiffers = iterableDiffers.find([]).create<PortModel>((index, item) => item.id);
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
    this.model.selectCoords().pipe(takeUntil(this.model.onEntityDestroy())).subscribe(({ x, y }) => {
      this.renderer.setStyle(this.rootNode, 'left', `${x}px`);
      this.renderer.setStyle(this.rootNode, 'top', `${y}px`);
    });
  }

  updatePorts(): void {
    this.model
      .selectPorts()
      .pipe(
        takeUntil(this.model.onEntityDestroy()),
        filter(
          (
            ports: PortModel[] | null | undefined
          ): ports is PortModel[] =>
            ports !== null && ports !== undefined
        ),
        switchMap(ports => {
          const changes = this.portDiffers.diff(ports);
          console.log(changes);
          this.applyPortChanges(changes);
          return combineLatest(ports.map((port) => port.paintChanges().pipe(
            pluck('isPainted'),
            filter<boolean>(Boolean),
            take(1))
          ));
        }),
        filter((val) => val !== null),
        mapTo(true)
      ).subscribe(() => !this.model.getPainted() && this.model.setPainted(true));
  }

  private applyPortChanges(changes: IterableChanges<PortModel> | null): void {
    changes?.forEachAddedItem(({ item, currentIndex, previousIndex }) => {
      if (!item.getPainted().isPainted) {
        if (!this.factory.has(item)) {
          return;
        }

        this.factory.generateWidget({
          model: item,
          host: this.getPortsHost(),
          index: currentIndex ?? undefined
        });
        return;
      }
      // tslint:disable-next-line:no-unused-expression
      currentIndex && console.log(this.getPortsHost().get(currentIndex));
    });
    changes?.forEachRemovedItem(record => {
      record.item.destroy();
    });
    changes?.forEachMovedItem(({ previousIndex, currentIndex, item }) => {
      if (typeof previousIndex === 'number' && typeof currentIndex === 'number' && previousIndex !== currentIndex) {
        const view = this.getPortsHost().get(previousIndex);
        if (view) {
          this.getPortsHost().move(view, currentIndex);
          this.model.updatePortCoords(item, this.diagram.diagramEngine);
        }
      }
    });
  }
}
