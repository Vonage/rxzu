import { Component, OnInit } from '@angular/core';
import { DiagramEngine, DefaultLinkModel, DiagramModel, DefaultNodeModel } from 'ngx-diagrams';

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
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		const p1 = node1.addInPort('inport');

		const node2 = new DefaultNodeModel();
		node2.setCoords({ x: 200, y: 200 });
		node2.setDimensions(nodesDefaultDimensions);
		const outPortN2 = node2.addOutPort('outport');

		const link1 = new DefaultLinkModel();
		link1.setSourcePort(outPortN2);
		link1.setTargetPort(p1);

		const node3 = new DefaultNodeModel();
		node3.setCoords({ x: 400, y: 600 });
		node3.setDimensions(nodesDefaultDimensions);
		const p3 = node3.addInPort('inport');

		const link3 = new DefaultLinkModel();
		link3.setSourcePort(outPortN2);
		link3.setTargetPort(p3);

		const node4 = new DefaultNodeModel();
		node4.setCoords({ x: 1200, y: 200 });
		node4.setDimensions(nodesDefaultDimensions);
		const p4 = node4.addInPort('inport');

		const link2 = new DefaultLinkModel();
		link2.setSourcePort(outPortN2);
		link2.setTargetPort(p4);

		this.diagramModel.addAll(link1, node1, node2, node3, node4, link2, link3);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}
}
