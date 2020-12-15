import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DiagramEngine, DiagramModel, DefaultNodeModel, SerializedDiagramModel } from 'ngx-diagrams';

@Component({
	selector: 'app-root',
	template: `
		<div class="action-bar">
			<button (click)="resetDiagram()" *ngIf="isResseted === false">Reset</button
			><button (click)="createDiagram()" *ngIf="isResseted">Recreate</button>Rendered {{ numberOfNodes }} nodes and links in
			{{ initialRenderTimer }} ms
		</div>
		<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>
	`,
	styleUrls: ['../demo-diagram.component.scss'],
})
export class PerformanceExampleStoryComponent implements OnInit {
	diagramModel: DiagramModel;
	initialRenderTimer: number;
	isResseted = false;
	isCreated = true;
	numberOfNodes = 200;

	@Output() serialized: EventEmitter<SerializedDiagramModel> = new EventEmitter();

	constructor(private diagramEngine: DiagramEngine) {}

	ngOnInit() {
		this.diagramEngine.registerDefaultFactories();
		this.diagramModel = this.diagramEngine.createDiagram();

		this.createNodes();

		this.diagramEngine.zoomToFit();
	}

	createDiagram() {
		this.createNodes();
	}

	resetDiagram() {
		this.diagramModel.reset();
		this.isResseted = true;
	}

	recreateDiagram() {
		this.createNodes();
	}

	createNodes() {
		this.isResseted = false;
		const startTime = performance.now();
		const nodesDefaultDimensions = { height: 200, width: 200 };

		for (let index = 0; index < this.numberOfNodes; index++) {
			const nodeLoop = new DefaultNodeModel({ id: index.toString() });
			const row = index % 10;
			const col = Math.floor(index / 10);
			nodeLoop.setCoords({ x: 1000 * row, y: 300 * col });
			nodeLoop.setDimensions(nodesDefaultDimensions);
			nodeLoop.addInPort({ name: `inport${index}`, id: `inport${index}` });
			const outport = nodeLoop.addOutPort({ name: `outport${index}`, id: `outport${index}` });

			if (index > 0) {
				const link = outport.link(this.diagramModel.getNode(`${index - 1}`).getPort(`inport${index - 1}`));
				this.diagramModel.addLink(link);
			}

			this.diagramModel.addNode(nodeLoop);
		}

		const endTime = performance.now();
		this.initialRenderTimer = endTime - startTime;
	}

	clearGraph() {
		this.diagramModel.reset();
	}
}
