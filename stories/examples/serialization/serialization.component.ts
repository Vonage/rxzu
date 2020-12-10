import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DefaultNodeModel, DiagramEngine, DiagramModel, SerializedDiagramModel } from 'ngx-diagrams';

@Component({
	selector: 'app-root',
	template: `
		<div class="action-bar">
			<button (click)="serialize()">Serialize Diagram Model</button>
			<button (click)="clearGraph()">Clear Graph</button>
			<button (click)="addNode()">Add node</button>
		</div>
		<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>
	`,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class SerializationExampleStoryComponent implements OnInit {
	diagramModel: DiagramModel;

	@Output() serialized: EventEmitter<SerializedDiagramModel> = new EventEmitter();

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
		node2.setCoords({ x: 1000, y: 0 });
		node2.setDimensions(nodesDefaultDimensions);
		const inport = node2.addInPort({ name: 'inport2' });

		for (let index = 0; index < 2; index++) {
			const nodeLoop = new DefaultNodeModel();
			nodeLoop.setCoords({ x: 1000, y: 300 + index * 300 });
			nodeLoop.setDimensions(nodesDefaultDimensions);
			nodeLoop.addInPort({ name: `inport${index + 3}` });

			this.diagramModel.addNode(nodeLoop);
		}

		const link = outport1.link(inport);
		link.setLocked();

		this.diagramModel.addAll(node1, node2, link);

		this.diagramModel.getDiagramEngine().zoomToFit();
	}

	serialize() {
		const serializedModel = this.diagramModel.serialize();
		this.serialized.emit(serializedModel);
	}

	clearGraph() {
		this.diagramModel.reset();
	}

	// deserialize() {
	// 	const JSONModel = {
	// 		id: 'ab04adcc-ebce-41a1-9c8f-de914cb3186c',
	// 		locked: false,
	// 		nodes: [
	// 			{
	// 				id: 'e50e8d29-b90c-4907-8f7a-a82f8fbc7051',
	// 				locked: false,
	// 				type: 'default',
	// 				nodeType: 'default',
	// 				extras: {},
	// 				width: 200,
	// 				height: 200,
	// 				x: 1000,
	// 				y: 300,
	// 				ports: [
	// 					{
	// 						id: '57ba33ad-b539-4491-9358-056db9cfb474',
	// 						locked: false,
	// 						type: 'default',
	// 						name: 'inport3',
	// 						linkType: 'default',
	// 						maximumLinks: null,
	// 						magnetic: true,
	// 						height: 12,
	// 						width: 12,
	// 						canCreateLinks: false,
	// 						x: 995,
	// 						y: 310,
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: 'a0cb9388-ffb4-470a-a020-0a3256c0dd1c',
	// 				locked: false,
	// 				type: 'default',
	// 				nodeType: 'default',
	// 				extras: {},
	// 				width: 200,
	// 				height: 200,
	// 				x: 1000,
	// 				y: 600,
	// 				ports: [
	// 					{
	// 						id: 'd0866699-9922-47ab-812a-36d3bde6b513',
	// 						locked: false,
	// 						type: 'default',
	// 						name: 'inport4',
	// 						linkType: 'default',
	// 						maximumLinks: null,
	// 						magnetic: true,
	// 						height: 12,
	// 						width: 12,
	// 						canCreateLinks: false,
	// 						x: 995,
	// 						y: 610,
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: 'de1eac05-4782-4bf2-8620-241562501db4',
	// 				locked: false,
	// 				type: 'default',
	// 				nodeType: 'default',
	// 				extras: {},
	// 				width: 200,
	// 				height: 200,
	// 				x: 500,
	// 				y: 300,
	// 				ports: [
	// 					{
	// 						id: '74bcbcfe-e5ca-4f49-8a00-9eb15916cd3c',
	// 						locked: false,
	// 						type: 'default',
	// 						name: 'outport1',
	// 						linkType: 'default',
	// 						maximumLinks: null,
	// 						magnetic: false,
	// 						height: 12,
	// 						width: 12,
	// 						canCreateLinks: true,
	// 						x: 695,
	// 						y: 310,
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: '86d44ae3-bcc8-4d1a-b0ea-2fc295aa2da2',
	// 				locked: false,
	// 				type: 'default',
	// 				nodeType: 'default',
	// 				extras: {},
	// 				width: 200,
	// 				height: 200,
	// 				x: 1000,
	// 				y: 0,
	// 				ports: [
	// 					{
	// 						id: '6f2857d4-5fd2-4b0a-878b-730dec5afcdf',
	// 						locked: false,
	// 						type: 'default',
	// 						name: 'inport2',
	// 						linkType: 'default',
	// 						maximumLinks: null,
	// 						magnetic: true,
	// 						height: 12,
	// 						width: 12,
	// 						canCreateLinks: false,
	// 						x: 995,
	// 						y: 10,
	// 					},
	// 				],
	// 			},
	// 		],
	// 		links: [
	// 			{
	// 				id: '635cb9cd-09bd-4693-b746-760b8fbf51ae',
	// 				locked: true,
	// 				type: 'default',
	// 				sourcePort: '74bcbcfe-e5ca-4f49-8a00-9eb15916cd3c',
	// 				targetPort: '6f2857d4-5fd2-4b0a-878b-730dec5afcdf',
	// 				extras: {},
	// 				points: [
	// 					{ id: 'b085cdea-f1f1-4f26-8989-585a310004f9', locked: true, type: 'default', coords: { x: 701, y: 316 } },
	// 					{ id: 'edccec32-2290-4290-a7b3-66e3598c07f5', locked: true, type: 'default', coords: { x: 1001, y: 16 } },
	// 				],
	// 			},
	// 		],
	// 	};

	// 	this.diagramModel.deserialize(JSONModel);
	// }
}
