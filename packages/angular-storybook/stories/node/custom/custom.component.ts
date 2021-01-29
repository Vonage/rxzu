import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
  Inject,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DiagramModel,
  DIAGRAM_MODEL,
  NodeModel,
  NODE_MODEL,
} from '@rxzu/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'custom-node',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomNodeComponent {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;
  nodeContent$: BehaviorSubject<string>;
  rootNode: HTMLElement;

  constructor(
    @Inject(NODE_MODEL) private model: NodeModel,
    @Inject(DIAGRAM_MODEL) private diagramModel: DiagramModel,
    private rootEl: ElementRef,
    private renderer: Renderer2
  ) {
    this.nodeContent$ = new BehaviorSubject('Pick me!');
    this.model.setParent(this.diagramModel);
    this.rootNode = this.rootEl.nativeElement;
    this.updateNodePosition();
    this.model.selectSelected().subscribe((selected) => {
      this.nodeContent$.next(selected ? 'Thank you 🙏' : 'Pick me!');
    });
    this.model.setPainted(true);
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
