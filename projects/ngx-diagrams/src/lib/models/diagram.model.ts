import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BaseEntity, EntityState } from '../base.entity';
import { DiagramEngine } from '../services/engine.service';
import { BaseModel } from './base.model';
import { flatMap, uniq } from 'lodash';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import { Coords } from '../interfaces/coords.interface';
import { BaseEntityType, ID, IDS } from '../interfaces/types';
import { isArray, mapToArray } from '../utils/tool-kit.util';

export type DiagramModelState<S = any, N extends NodeModel = NodeModel, L extends LinkModel = LinkModel> = EntityState<S> & {
	nodes: { [id: string]: N };
	links: { [id: string]: L };
	zoom: number;
	offset: Coords;
	gridSize: number;
};

const DEFAULT_STATE: DiagramModelState = {
	nodes: {},
	links: {},
	zoom: 100,
	offset: { x: 0, y: 0 },
	gridSize: 0
};
export class DiagramModel<S = any, N extends NodeModel = NodeModel, L extends LinkModel = LinkModel> extends BaseEntity<
	DiagramModelState<S, N, L>
> {
	constructor(private diagramEngine: DiagramEngine, id?: string, initialState?: Partial<DiagramModelState<S, N, L>>) {
		super(id, { ...DEFAULT_STATE, ...initialState });
	}

	// TODO: support the following events for links and ports
	// removed, updated<positionChanged/dataChanged>, added

	selectNodes(id?: IDS): Observable<N[]> {
		return this.selectByIds(s => s.nodes, id);
	}

	getNodes(id?: IDS): N[] {
		return this.getByIds(s => s.nodes, id);
	}

	selectLinks(id?: IDS): Observable<L[]> {
		return this.selectByIds(s => s.links, id);
	}

	getLinks(id?: IDS): L[] {
		return this.getByIds(s => s.links, id); // TODO: remove unknown mark
	}

	getPortsForNodes(nodeIds?: IDS, portIds?: IDS): PortModel[] {
		return this.getNodes(nodeIds).reduce((acc, n) => [...acc, ...n.getPorts(portIds)], []);
	}
	/**
	 * Add a node to the diagram
	 * @returns Inserted Node
	 */
	addNode(node: N): N {
		this.update({ nodes: { ...this.get('nodes'), [node.id]: node } } as Partial<DiagramModelState>);
		return node;
	}

	/**
	 * Delete a node from the diagram
	 */
	deleteNode(nodeOrId: NodeModel | string): void {
		const nodeID: ID = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;

		// TODO: delete all related links
		const { nodes } = this.get();
		nodes[nodeID].destroy();
		delete nodes[nodeID];
		this.update({ nodes } as Partial<DiagramModelState>);
	}

	/**
	 * Add link
	 * @returns Newly created link
	 */
	addLink(link: L): L {
		link.update({ parentId: this.id });
		this.update({ links: { ...this.get('links'), [link.id]: link } } as DiagramModelState);
		return link;
	}

	/**
	 * Delete link
	 */
	deleteLink(linkOrId: LinkModel | string) {
		const linkID: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;

		const { links, nodes } = this.get();
		// TODO: remove link from port in node, find easier access to find the port
		links[linkID].destroy();
		delete links[linkID];

		this.update({ links } as DiagramModelState);
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

	getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}

	clearSelection(ignore: BaseModel | null = null) {
		this.getActiveItems().forEach(element => {
			if (ignore && ignore.id === element.id) {
				return;
			}
			element.setActive(false);
		});
	}

	getGridPosition({ x, y }: Coords): Coords {
		const { gridSize } = this.get();
		if (gridSize === 0) {
			return { x, y };
		}
		return {
			x: gridSize * Math.floor((x + gridSize / 2) / gridSize),
			y: gridSize * Math.floor((y + gridSize / 2) / gridSize)
		};
	}

	getActiveItems(...filters: BaseEntityType[]): BaseModel[] {
		if (!isArray(filters)) {
			filters = [filters];
		}
		let items = [];

		// run through ports
		items = items.concat(
			flatMap(this.get('nodes'), node => {
				return node.getActiveItems();
			})
		);

		// find all the links
		items = items.concat(
			flatMap(this.get('links'), link => {
				return link.getActiveItems();
			})
		);

		// find all points
		items = items.concat(
			flatMap(this.get('links'), link => {
				return flatMap(link.get('points'), point => {
					return point.getActiveItems();
				});
			})
		);

		items = uniq(items);

		if (filters.length > 0) {
			items = uniq(items).filter((item: BaseModel) => {
				if (filters.includes('node') && item instanceof NodeModel) {
					return true;
				}
				if (filters.includes('link') && item instanceof LinkModel) {
					return true;
				}
				if (filters.includes('port') && item instanceof PortModel) {
					return true;
				}
				if (filters.includes('point') && item instanceof PointModel) {
					return true;
				}
				return false;
			});
		}

		return items;
	}

	addAll(...models: BaseModel[]) {
		models.forEach(model => {
			if (model instanceof LinkModel) {
				this.addLink(model as L);
			} else if (model instanceof NodeModel) {
				this.addNode(model as N);
			}
		});
		return models;
	}
}
