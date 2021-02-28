import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
  Inject,
  ElementRef,
  Renderer2,
  AfterViewInit, Self, Optional
} from '@angular/core';
import { NodeModel, MODEL } from '@rxzu/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'custom-node',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomNodeComponent implements AfterViewInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;
  nodeContent$: BehaviorSubject<string>;
  rootNode: HTMLElement;

  constructor(
    @Optional() @Inject(MODEL) @Self() private model: NodeModel,
    private rootEl: ElementRef,
    private renderer: Renderer2
  ) {
    this.nodeContent$ = new BehaviorSubject('Pick me!');
    this.rootNode = this.rootEl.nativeElement;
    this.updateNodePosition();
    this.model.setPainted(true);
  }

  ngAfterViewInit() {
    this.model.selectSelected().subscribe((selected) => {
      this.nodeContent$.next(selected ? 'Thank you 🙏' : 'Pick me!');
    });
  }

  getPortsHost() {
    return this.portsLayer;
  }

  updateNodePosition() {
    // default position for node
    this.renderer.setStyle(this.rootNode, 'position', 'absolute');
    this.renderer.setStyle(this.rootNode, 'display', 'block');

    // subscribe to node coordinates
    this.model.selectCoords().subscribe(({ x, y }) => {
      this.renderer.setStyle(this.rootNode, 'left', `${x}px`);
      this.renderer.setStyle(this.rootNode, 'top', `${y}px`);
    });
  }
}
