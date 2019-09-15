import { Component, OnInit, ComponentFactoryResolver, Renderer2 } from '@angular/core';
import { DiagramEngine, DefaultLinkModel, DiagramModel, DefaultNodeModel, DagreEngine, LinkCreatedAction } from 'ngx-diagrams';
import { CustomLinkFactory } from './components/custom-link/custom-link.factory';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'playground';
	diagramModel: DiagramModel;

	constructor(
		private diagramEngine: DiagramEngine,
		private resolver: ComponentFactoryResolver,
		private renderer: Renderer2,
		private dagreEngine: DagreEngine
	) {}

	ngOnInit() {
		const nodesDefaultDimensions = { height: 200, width: 200 };
		this.diagramEngine.registerDefaultFactories();
		this.diagramEngine.registerLinkFactory(new CustomLinkFactory(this.resolver, this.renderer));

		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		node1.addInPort({ name: 'inport', linkType: 'custom' });

		const node2 = new DefaultNodeModel();
		node2.setCoords({ x: 200, y: 200 });
		node2.setDimensions(nodesDefaultDimensions);
		const outPortN2 = node2.addOutPort({ name: 'outport' });
		outPortN2.setMaximumLinks(1);

		const node3 = new DefaultNodeModel();
		node3.setCoords({ x: 400, y: 600 });
		node3.setDimensions(nodesDefaultDimensions);
		node3.addInPort({ name: 'inport', linkType: 'custom' });

		// const label1 = new DefaultLabelModel('LABEL!');

		const node4 = new DefaultNodeModel();
		node4.setCoords({ x: 1200, y: 200 });
		node4.setDimensions(nodesDefaultDimensions);
		const p4 = node4.addInPort({ name: 'inport', linkType: 'custom' });

		const link2 = new DefaultLinkModel('custom');
		link2.setSourcePort(outPortN2);
		link2.setTargetPort(p4);

		this.diagramModel.addAll(node1, node2, node3, node4, link2);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}

	redistribute() {
		this.dagreEngine.redistribute(this.diagramModel, { includeLinks: true, graph: { rankdir: 'LR' } });
	}

	onActionStarted(action: any) {
		if (action instanceof LinkCreatedAction) {
			// console.log(action);
			// console.log(action.getInPortNode());
			// console.log(action.getOutPortNode());
		}
	}
}
