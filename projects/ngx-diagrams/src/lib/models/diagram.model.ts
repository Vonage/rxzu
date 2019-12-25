import { BehaviorSubject, Observable } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BaseEntity, BaseEntityType } from '../base.entity';
import { DiagramEngine } from '../services/engine.service';
import { BaseModel } from './base.model';
import { uniq, flatMap } from 'lodash';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import { Coords } from '../interfaces/coords.interface';
import { ID } from '../utils/tool-kit.util';

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
	getNodes(): { [s: string]: NodeModel } {
		return this.nodes$.getValue();
	}

	getNode(id: ID): NodeModel | null {
		return this.nodes$.getValue()[id];
	}

	getLink(id: ID): LinkModel | null {
		return this.links$.getValue()[id];
	}

	getLinks(): { [s: string]: LinkModel } {
		return this.links$.getValue();
	}

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
		const nodeID: ID = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;

		// TODO: delete all related links
		const updNodes = { ...this.nodes$.value };
		delete updNodes[nodeID];
		this.nodes$.next(updNodes);
	}

	/**
	 * Get nodes behaviour subject, use `.getValue()` for snapshot
	 */
	selectNodes(): Observable<{ [s: string]: NodeModel }> {
		return this.nodes$.asObservable();
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
		const linkID: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;

		const updLinks = { ...this.links$.value };
		delete updLinks[linkID];

		this.links$.next(updLinks);
	}

	/**
	 * Get links behaviour subject, use `.getValue()` for snapshot
	 */
	selectLinks(): Observable<{ [s: string]: LinkModel }> {
		return this.links$.asObservable();
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

	getOffsetX(): number {
		return this.offsetX$.getValue();
	}

	selectOffsetX(): Observable<number> {
		return this.offsetX$.asObservable();
	}

	setOffsetY(y: number) {
		this.offsetY$.next(y);
	}

	getOffsetY(): number {
		return this.offsetY$.getValue();
	}

	selectOffsetY(): Observable<number> {
		return this.offsetY$.asObservable();
	}

	setZoomLevel(z: number) {
		this.zoom$.next(z);
	}

	getZoomLevel(): number {
		return this.zoom$.getValue();
	}

	selectZoomLevel(): Observable<number> {
		return this.zoom$.asObservable();
	}

	getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}

	clearSelection(ignore: BaseModel | null = null) {
		this.getSelectedItems().forEach(element => {
			if (ignore && ignore.id === element.id) {
				return;
			}
			element.setSelected(false);
		});
	}

	getGridPosition({ x, y }: Coords): Coords {
		const gridSize = this.gridSize$.getValue();
		if (gridSize === 0) {
			return { x, y };
		}
		return {
			x: gridSize * Math.floor((x + gridSize / 2) / gridSize),
			y: gridSize * Math.floor((y + gridSize / 2) / gridSize)
		};
	}

	getSelectedItems(...filters: BaseEntityType[]): BaseModel[] {
		if (!Array.isArray(filters)) {
			filters = [filters];
		}
		let items = [];

		// run through nodes
		items = items.concat(
			flatMap(this.nodes$.getValue(), node => {
				return node.getSelectedEntities();
			})
		);

		// find all the links
		items = items.concat(
			flatMap(this.links$.getValue(), link => {
				return link.getSelectedEntities();
			})
		);

		// find all points
		items = items.concat(
			flatMap(this.links$.getValue(), link => {
				return flatMap(link.getPoints(), point => {
					return point.getSelectedEntities();
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
				this.addLink(model);
			} else if (model instanceof NodeModel) {
				this.addNode(model);
			}
		});
		return models;
	}
}
