import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';
import { DiagramEngine } from 'ngx-diagrams';
import { NodeModel } from 'projects/ngx-diagrams/src/lib/models/node.model';
import { DefaultNodeModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-node.model';
import { DefaultPortModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-port.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'playground';
	diagramModel: DiagramModel;

	constructor(
		private diagramEngine: DiagramEngine
	) { }

	ngOnInit() {
		const nodesDefaultDimensions = { height: 200, width: 200 };
		this.diagramEngine.registerDefaultFactories();
		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		const inPort = new DefaultPortModel(true, 'inport');
		node1.setPosition(500, 300);
		node1.updateDimensions(nodesDefaultDimensions);
		node1.addPort(inPort);

		const node2 = new DefaultNodeModel();
		const outPort = new DefaultPortModel(false, 'outport');
		node2.setPosition(200, 200);
		node2.updateDimensions(nodesDefaultDimensions);
		node2.addPort(outPort);

		this.diagramModel.addAll(node1, node2);

		// example for reactivity and locking
		// setTimeout(() => {
		// 	node1.updateDimensions({ width: 150, height: 150 });
		// 	node1.setPosition(300, 500);
		// 	node1.setLocked();
		// }, 3000);
	}
}
