import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NodeModel } from '@rxzu/core';
import { NODE_MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;
  rootNode: HTMLElement;

  constructor(
    @Inject(NODE_MODEL) public model: NodeModel,
    private rootEl: ElementRef,
    private renderer: Renderer2
  ) {
    this.rootNode = this.rootEl.nativeElement;
    this.updateNodePosition();
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
