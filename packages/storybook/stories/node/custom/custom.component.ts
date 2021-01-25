import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NodeModel } from '@rxzu/core';

@Component({
  selector: 'custom-node',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomNodeComponent extends NodeModel implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;
  nodeContent = 'Pick me!';

  constructor() {
    super({ type: 'custom-node' });
  }

  ngOnInit() {
    this.nodeContent = 'Pick me!';
    this.selectSelected().subscribe((selected) => {
      this.nodeContent = selected ? 'Thank you 🙏' : 'Pick me!';
    });
    this.setPainted(true);
  }

  getPortsHost() {
    return this.portsLayer;
  }
}
