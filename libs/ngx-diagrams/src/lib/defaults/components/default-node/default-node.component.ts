import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { filter, switchMap } from 'rxjs/operators';
import { DefaultPortModel } from '../../models';
import { DefaultNodeModel } from '../../models/default-node.model';

@Component({
  selector: 'ngdx-default-node',
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultNodeComponent extends DefaultNodeModel implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer: ViewContainerRef;

  constructor() {
    super({ type: 'ngdx-default-node' });
  }

  ngOnInit() {
    // when node is painted and port isn't, draw ports

    this.paintChanges()
      .pipe(
        filter((paintedE) => paintedE.isPainted),
        switchMap(() => this.selectPorts())
      )
      .subscribe((ports) => {
        ports.forEach((port: DefaultPortModel) => {
          if (!port.getPainted()) {
            this.generatePort(port);
          }
        });
      });
  }

  generatePort(port: DefaultPortModel) {
    const diagramEngine = this.getDiagramEngine();
    diagramEngine.generateWidgetForPort(port, this.portsLayer);

    port.paintChanges().subscribe((paintedEvent) => {
      if (paintedEvent.isPainted) {
        port.updateCoords(diagramEngine.getPortCoords(port));
      }
    });
  }

  // https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/models/DefaultNodeModel.ts
}
