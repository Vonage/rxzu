import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DefaultNodeModel } from '../../models/default-node.model';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PortModel } from '../../../models/port.model';

@Component({
	selector: 'ngdx-default-node',
	templateUrl: './default-node.component.html',
	styleUrls: ['./default-node.component.scss']
})
export class DefaultNodeComponent extends DefaultNodeModel implements AfterViewInit {
	@ViewChild('portsLayer', { read: ViewContainerRef }) portsLayer: ViewContainerRef;

	constructor() {
		super('ngdx-default-node');
	}

	ngAfterViewInit(): void {
		this.selectPorts().subscribe(ports => {
			ports.forEach(port => {
				if (!port.isPainted()) {
					this.generatePort(port);
					port.setPainted();
				}
			});
		});
	}

	generatePort(port: PortModel) {
		this.diagramEngine.generateWidgetForPort(port, this.portsLayer);
	}

	// https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/models/DefaultNodeModel.ts
}
