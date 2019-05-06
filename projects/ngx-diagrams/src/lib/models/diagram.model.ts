import { BehaviorSubject } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BaseEntity } from '../base.entity';
import { DiagramEngine } from '../services/engine.service';
import { BaseModel } from './base.model';

export class DiagramModel extends BaseEntity {
	links$: BehaviorSubject<{ [s: string]: LinkModel }>;
	nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
	zoom$: BehaviorSubject<number>;
	offsetX$: BehaviorSubject<number>;
	offsetY$: BehaviorSubject<number>;
	gridSize$: BehaviorSubject<number>;

	constructor(private diagramEngine: DiagramEngine, id?: string) {
		super(id);
		this.nodes$ = new BehaviorSubject<{ [s: string]: NodeModel }>({});
		this.links$ = new BehaviorSubject<{ [s: string]: LinkModel }>({});
		this.zoom$ = new BehaviorSubject(100);
		this.offsetX$ = new BehaviorSubject(0);
		this.offsetY$ = new BehaviorSubject(0);
		this.gridSize$ = new BehaviorSubject(0);
	}

	// TODO: support the following events for links and nodes
	// removed, updated<positionChanged/dataChanged>, added

	/**
	 * Add a node to the diagram
	 * @returns Inserted Node
	 */
	addNode(node: NodeModel): NodeModel {
		this.nodes$.next({ ...this.nodes$.value, [node.id]: node });
		return node;
	}

	/**
	 * Delete a node from the diagram
	 */
	deleteNode(nodeOrId: NodeModel | string): void {
		const nodeId: string = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;

		// TODO: delete all related links
		const updNodes = { ...this.nodes$.value };
		delete updNodes[nodeId];
		this.nodes$.next(updNodes);
	}

	/**
	 * Get nodes behaviour subject, use `.getValue()` for snapshot
	 */
	selectNodes(): BehaviorSubject<{ [s: string]: NodeModel }> {
		return this.nodes$;
	}

	/**
	 * Add link
	 * @returns Newly created link
	 */
	addLink(link: LinkModel): LinkModel {
		this.links$.next({ ...this.links$.value, [link.id]: link });
		return link;
	}

	/**
	 * Delete link
	 */
	deleteLink(linkOrId: LinkModel | string) {
		const linkId: string = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;

		const updLinks = { ...this.links$.value };
		delete updLinks[linkId];

		this.links$.next(updLinks);
	}

	/**
	 * Get links behaviour subject, use `.getValue()` for snapshot
	 */
	selectLinks(): BehaviorSubject<{ [s: string]: LinkModel }> {
		return this.links$;
	}

	/**
	 * Serialize the diagram model
	 * @returns diagram model as a string
	 */
	// serialize(): string {
	// 	return JSON.stringify(this.model);
	// }

	/**
	 * Load into the diagram model a serialized diagram
	 */
	// deserialize(serializedModel: string) {
	// 	this.model = JSON.parse(serializedModel);
	// }

	setOffset(x: number, y: number) {
		this.offsetX$.next(x);
		this.offsetY$.next(y);
	}

	setOffsetX(x: number) {
		this.offsetX$.next(x);
	}

	getOffsetX(): BehaviorSubject<number> {
		return this.offsetX$;
	}

	setOffsetY(y: number) {
		this.offsetY$.next(y);
	}

	getOffsetY(): BehaviorSubject<number> {
		return this.offsetY$;
	}

	setZoomLevel(z: number) {
		this.zoom$.next(z);
	}

	getZoomLevel(): BehaviorSubject<number> {
		return this.zoom$;
	}

	getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}

	addAll(...models: BaseModel[]) {
		models.forEach(model => {
			if (model instanceof LinkModel) {
				this.addLink(model);
			} else if (model instanceof NodeModel) {
				this.addNode(model);
			}
		});
		return models;
	}
}
