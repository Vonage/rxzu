import { Component, OnInit } from '@angular/core';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DefaultLabelModel } from 'ngx-diagrams';

@Component({
	selector: 'app-root',
	template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class DefaultLabelStoryComponent implements OnInit {
	diagramModel: DiagramModel;

	constructor(private diagramEngine: DiagramEngine) {}

	ngOnInit() {
		const nodesDefaultDimensions = { height: 200, width: 200 };
		this.diagramEngine.registerDefaultFactories();

		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		const outport1 = node1.addOutPort({ name: 'outport1' });

		const node2 = new DefaultNodeModel();
		node2.setCoords({ x: 1000, y: 300 });
		node2.setDimensions(nodesDefaultDimensions);
		const inport = node2.addInPort({ name: 'inport2' });

		const link = outport1.link(inport);
		const label = new DefaultLabelModel("I'm a label");
		link.setLabel(label);
		link.setLocked();

		this.diagramModel.addAll(node1, node2, link);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}
}
