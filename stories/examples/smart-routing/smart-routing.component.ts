import { Component, OnInit } from '@angular/core';
import { DiagramEngine, DiagramModel, DefaultNodeModel } from 'ngx-diagrams';

@Component({
	selector: 'app-root',
	template: ` <ngdx-diagram class="demo-diagram" [model]="diagramModel" [smartRouting]="true"></ngdx-diagram> `,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class SmartRoutingExampleStoryComponent implements OnInit {
	// https://github.com/clientIO/joint/blob/1745414371e9e301610f7f49c1b9d7e7b91de12e/src/routers/manhattan.mjs
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

		for (let index = 0; index < 5; index++) {
			const nodeLoop = new DefaultNodeModel();
			nodeLoop.setCoords({ x: 1500, y: index * 300 });
			nodeLoop.setDimensions(nodesDefaultDimensions);
			const inportLoop = nodeLoop.addInPort({ name: `inport${index + 3}` });

			this.diagramModel.addNode(nodeLoop);

			const linkLoop = outport1.link(inportLoop);
			this.diagramModel.addLink(linkLoop);
		}

		const blockingNode = new DefaultNodeModel();
		blockingNode.setCoords({ x: 1000, y: 300 });
		blockingNode.setDimensions(nodesDefaultDimensions);

		this.diagramModel.addAll(node1, blockingNode);

		this.diagramEngine.zoomToFit();
	}
}
