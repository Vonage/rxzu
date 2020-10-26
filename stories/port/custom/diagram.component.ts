import { Component, ComponentFactoryResolver, OnInit, Renderer2 } from '@angular/core';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DefaultPortModel } from 'ngx-diagrams';
import { CustomPortFactory } from './custom.factory';

@Component({
	selector: 'app-root',
	template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomPortDiagramComponent implements OnInit {
	diagramModel: DiagramModel;

	constructor(private diagramEngine: DiagramEngine, private resolver: ComponentFactoryResolver, private renderer: Renderer2) {}

	ngOnInit() {
		const nodesDefaultDimensions = { height: 200, width: 200 };
		this.diagramEngine.registerDefaultFactories();
		this.diagramEngine.registerPortFactory(new CustomPortFactory(this.resolver, this.renderer));

		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		const port1 = new DefaultPortModel({ type: 'custom-port' });
		node1.addPort(port1);

		this.diagramModel.addAll(node1);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}
}
