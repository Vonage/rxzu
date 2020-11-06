import { Component, ComponentFactoryResolver, Input, OnInit, Renderer2 } from '@angular/core';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DefaultLinkModel } from 'ngx-diagrams';
import { CustomLinkFactory } from './custom.factory';

@Component({
	selector: 'app-root',
	template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomLinkDiagramComponent implements OnInit {
	diagramModel: DiagramModel;
	@Input() nodeHeight = 200;
	@Input() nodeWidth = 200;

	constructor(private diagramEngine: DiagramEngine, private resolver: ComponentFactoryResolver, private renderer: Renderer2) {}

	ngOnInit() {
		const nodesDefaultDimensions = { height: this.nodeHeight, width: this.nodeWidth };
		this.diagramEngine.registerDefaultFactories();
		this.diagramEngine.registerLinkFactory(new CustomLinkFactory(this.resolver, this.renderer));

		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		const outport1 = node1.addOutPort({ name: 'outport1', linkType: 'custom-link', maximumLinks: 3 });

		const node2 = new DefaultNodeModel();
		node2.setCoords({ x: 1000, y: 300 });
		node2.setDimensions(nodesDefaultDimensions);
		const inport = node2.addInPort({ name: 'inport2' });

		const link = new DefaultLinkModel('custom-link');

		link.setSourcePort(outport1);
		link.setTargetPort(inport);

		this.diagramModel.addAll(node1, node2, link);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}
}
