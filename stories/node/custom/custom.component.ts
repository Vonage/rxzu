import { Component, OnInit, ViewChild, ViewContainerRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { PortModel, DefaultNodeModel } from 'ngx-diagrams';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'custom-node',
	templateUrl: './custom.component.html',
	styleUrls: ['./custom.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomNodeComponent extends DefaultNodeModel implements OnInit, OnDestroy {
	destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@ViewChild('portsLayer', { read: ViewContainerRef, static: true }) portsLayer: ViewContainerRef;

	nodeContent = 'Pick me!';

	constructor() {
		super('custom-node');
	}

	ngOnInit() {
		this.selectPorts().subscribe(ports => {
			ports.forEach(port => {
				if (!port.getPainted()) {
					port.setLocked(this.getLocked());
					this.generatePort(port);
					port.setPainted();
				}
			});
		});

		this.selectSelected().subscribe(selected => {
			this.nodeContent = selected ? 'Thank you 🙏' : 'Pick me!';
		});
	}

	ngOnDestroy() {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	generatePort(port: PortModel) {
		this.diagramEngine.generateWidgetForPort(port, this.portsLayer);
	}
}
