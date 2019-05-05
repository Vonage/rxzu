import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';
import { DiagramEngine } from 'ngx-diagrams';
import { NodeModel } from 'projects/ngx-diagrams/src/lib/models/node.model';
import { DefaultNodeModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-node.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'playground';
	diagramModel: DiagramModel;

	constructor(private diagramEngine: DiagramEngine) {}

	ngOnInit() {
		this.diagramEngine.registerDefaultFactories();
		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setPosition(500, 300);
		node1.updateDimensions({ height: 200, width: 200 });

		// node1.addPort('out1');

		this.diagramModel.addNode(node1);

		// example for reactivity and locking
		setTimeout(() => {
			node1.updateDimensions({ width: 150, height: 150 });
			node1.setPosition(300, 500);
			node1.setLocked();
		}, 3000);
	}
}
