import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NodeModel } from '@rxzu/core';

@Component({
  selector: 'rxzu-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent extends NodeModel implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;

  constructor() {
    super({ type: 'rxzu-default-node' });
  }

  ngOnInit() {
    this.setPainted(true);
  }

  getPortsHost() {
    return this.portsLayer;
  }
}
