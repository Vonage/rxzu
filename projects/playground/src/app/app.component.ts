import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';
import { DiagramEngine } from 'ngx-diagrams';
import { NodeModel } from 'projects/ngx-diagrams/src/lib/models/node.model';
import { DefaultNodeModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-node.model';
import { DefaultPortModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-port.model';
import { DefaultLinkModel } from 'projects/ngx-diagrams/src/lib/defaults/models/default-link.model';

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
		const nodesDefaultDimensions = { height: 200, width: 200 };
		this.diagramEngine.registerDefaultFactories();
		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		const inPort = new DefaultPortModel(true, 'inport');
		node1.setPosition(500, 300);
		node1.updateDimensions(nodesDefaultDimensions);
		node1.addPort(inPort);

		const outPort = new DefaultPortModel(false, 'outport');
		const node2 = new DefaultNodeModel();
		node2.setPosition(200, 200);
		node2.updateDimensions(nodesDefaultDimensions);
		node2.addPort(outPort);

		const link1 = new DefaultLinkModel();
		link1.setSourcePort(outPort);
		link1.setTargetPort(inPort);

		const node3 = new DefaultNodeModel();
		node3.setPosition(200, 2000);
		node3.updateDimensions(nodesDefaultDimensions);

		const node4 = new DefaultNodeModel();
		node4.setPosition(1200, 200);
		node4.updateDimensions(nodesDefaultDimensions);

		this.diagramModel.addAll(node1, node2, node3, node4, link1);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}
}
