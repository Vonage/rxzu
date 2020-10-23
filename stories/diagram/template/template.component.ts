import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DiagramEngine, DefaultLinkModel, DiagramModel, DefaultNodeModel, BaseAction } from 'ngx-diagrams';

@Component({
	selector: 'app-root',
	templateUrl: './template.component.html',
	styleUrls: ['./template.component.scss'],
})
export class TemplateDiagramComponent implements OnInit, OnChanges {
	diagramModel: DiagramModel;
	@Input() nodeHeight = 200;
	@Input() nodeWidth = 200;
	@Input() maxZoomOut = 20;
	@Input() maxZoomIn = 120;

	constructor(private diagramEngine: DiagramEngine) {}

	ngOnInit() {
		const nodesDefaultDimensions = { height: this.nodeHeight, width: this.nodeWidth };
		this.diagramEngine.registerDefaultFactories();

		this.diagramModel = this.diagramEngine.createDiagram();

		const node1 = new DefaultNodeModel();
		node1.setCoords({ x: 500, y: 300 });
		node1.setDimensions(nodesDefaultDimensions);
		node1.addInPort({ name: 'inport', linkType: 'custom' });

		const node2 = new DefaultNodeModel();
		node2.setCoords({ x: 200, y: 200 });
		node2.setDimensions(nodesDefaultDimensions);
		const outPortN2 = node2.addOutPort({ name: 'outport' });
		const outPortN3 = node2.addOutPort({ name: 'outpor1' });

		outPortN3.setMaximumLinks(1);
		outPortN2.setMaximumLinks(1);

		const node3 = new DefaultNodeModel();
		node3.setCoords({ x: 400, y: 600 });
		node3.setDimensions(nodesDefaultDimensions);
		node3.addInPort({ name: 'inport', linkType: 'custom' });

		const node4 = new DefaultNodeModel();
		node4.setCoords({ x: 1200, y: 200 });
		node4.setDimensions(nodesDefaultDimensions);
		const p4 = node4.addInPort({ name: 'inport', linkType: 'custom' });

		const link2 = new DefaultLinkModel();
		link2.setSourcePort(outPortN2);
		link2.setTargetPort(p4);

		this.diagramModel.addAll(node1, node2, node3, node4, link2);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}

	ngOnChanges(e: SimpleChanges) {
		console.log(e);

		if (this.diagramModel) {
			if (e.nodeHeight) {
				Object.values(this.diagramModel.getNodes()).forEach(node => {
					node.setHeight(e.nodeHeight.currentValue);
				});
			}

			if (e.nodeWidth) {
			}
		}
	}

	onActionStarted(e: BaseAction) {
		// console.log(e);
	}

	changeLinkColor() {
		const allLinks = this.diagramModel.getLinks();
		for (const linkId in allLinks) {
			if (allLinks.hasOwnProperty(linkId)) {
				const link = allLinks[linkId] as DefaultLinkModel;
				link.setColor('green');
			}
		}
	}
}
