import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'ngdx-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent extends DefaultNodeModel implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer: ViewContainerRef;

  constructor() {
    super({ type: 'ngdx-default-node' });
  }

  ngOnInit() {
    this.selectPorts().subscribe((ports) => {
      const factoriesManager = this.getParent()
        .getDiagramEngine()
        .getFactoriesManager();

      for (const port of ports) {
        if (!port.getPainted().isPainted) {
          factoriesManager
            .getFactory({
              factoryType: 'portFactories',
              modelType: port.getType(),
            })
            .generateWidget({ model: port, host: this.portsLayer });
        }
      }
      this.setPainted(true);
    });
  }
}
