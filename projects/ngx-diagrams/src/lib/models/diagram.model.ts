import { BehaviorSubject, Observable } from 'rxjs';
import { NodeModel } from './node.model';
import { LinkModel } from './link.model';
import { BaseEntity, BaseEntityType } from '../base.entity';
import { DiagramEngine } from '../services/engine.service';
import { BaseModel } from './base.model';
import { PortModel } from './port.model';
import { PointModel } from './point.model';
import { Coords } from '../interfaces/coords.interface';
import { ID } from '../utils/tool-kit.util';
import { SelectOptions } from '../interfaces/select-options.interface';
import { SerializedDiagramModel } from '../interfaces/serialization.interface';

export class DiagramModel extends BaseEntity {
	private _links$: BehaviorSubject<{ [s: string]: LinkModel }> = new BehaviorSubject<{ [s: string]: LinkModel }>({});
	private _nodes$: BehaviorSubject<{ [s: string]: NodeModel }> = new BehaviorSubject<{ [s: string]: NodeModel }>({});
	private _zoom$: BehaviorSubject<number> = new BehaviorSubject(100);
	private _offsetX$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _offsetY$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _gridSize$: BehaviorSubject<number> = new BehaviorSubject(0);
	private _maxZoomOut$: BehaviorSubject<number> = new BehaviorSubject(null);
	private _maxZoomIn$: BehaviorSubject<number> = new BehaviorSubject(null);

	private nodes$: Observable<{ [s: string]: NodeModel }> = this._nodes$.pipe(this.entityPipe('nodes'));

	private links$: Observable<{ [s: string]: LinkModel }> = this._links$.pipe(this.entityPipe('links'));

	private offsetX$: Observable<number> = this._offsetX$.pipe(this.entityPipe('offsetX'));
	private offsetY$: Observable<number> = this._offsetY$.pipe(this.entityPipe('offsetY'));
	private zoom$: Observable<number> = this._zoom$.pipe(this.entityPipe('zoom'));

	constructor(private diagramEngine: DiagramEngine, id?: string, logPrefix: string = '[Diagram]') {
		super(id, logPrefix);
	}

	// TODO: support the following events for links and nodes
	// removed, updated<positionChanged/dataChanged>, added
	getNodes(): { [s: string]: NodeModel } {
		return this._nodes$.getValue();
	}

	getNode(id: ID): NodeModel | null {
		return this._nodes$.getValue()[id];
	}

	getLink(id: ID): LinkModel | null {
		return this._links$.getValue()[id];
	}

	getLinks(): { [s: string]: LinkModel } {
		return this._links$.getValue();
	}

	getAllPorts(options?: SelectOptions<PortModel>): Map<string, PortModel> {
		const portsMap = new Map();
		// TODO: optimize!
		Object.values(this.getNodes()).forEach(node => {
			for (const [key, port] of Object.entries(node.getPorts())) {
				if (options.filter) {
					if (options.filter(port as PortModel)) {
						portsMap.set(key, port);
					}
				} else {
					portsMap.set(key, port);
				}
			}
		});
		return portsMap;
	}

	/**
	 * Add a node to the diagram
	 * @returns Inserted Node
	 */
	addNode(node: NodeModel): NodeModel {
		this._nodes$.next({ ...this.getNodes(), [node.id]: node });
		return node;
	}

	/**
	 * Delete a node from the diagram
	 */
	deleteNode(nodeOrId: NodeModel | string): void {
		const nodeID: ID = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;
		const node = this.getNode(nodeID);

		// delete all related links
		Object.values(node.getPorts()).forEach((port: PortModel) => {
			Object.values(port.getLinks()).forEach(link => {
				this.deleteLink(link);
			});
		});

		const updNodes = { ...this.getNodes() };
		delete updNodes[nodeID];
		this._nodes$.next(updNodes);

		node.destroy();
	}

	/**
	 * Get nodes as observable, use `.getValue()` for snapshot
	 */
	selectNodes(): Observable<{ [s: string]: NodeModel }> {
		return this.nodes$;
	}

	/**
	 * Add link
	 * @returns Newly created link
	 */
	addLink(link: LinkModel): LinkModel {
		this._links$.next({ ...this.getLinks(), [link.id]: link });
		return link;
	}

	/**
	 * Delete link
	 */
	deleteLink(linkOrId: LinkModel | string) {
		const linkID: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;
		const link = this.getLink(linkID);

		const updLinks = { ...this.getLinks() };
		delete updLinks[linkID];

		this._links$.next(updLinks);
		link.destroy();
	}

	reset() {
		Object.values(this.getLinks()).forEach(link => {
			link.destroy();
		});
		this._links$.next({});

		Object.values(this.getNodes()).forEach(node => {
			node.destroy();
		});

		this._nodes$.next({});
	}

	/**
	 * Get links behaviour subject, use `.getValue()` for snapshot
	 */
	selectLinks(): Observable<{ [s: string]: LinkModel }> {
		return this.links$;
	}

	// /**
	//  * Serialize the diagram model to JSON
	//  * @returns diagram model as a string
	//  */
	serialize(): SerializedDiagramModel {
		const serializedNodes = Object.values(this.getNodes()).map(node => node.serialize());
		const serializedLinks = Object.values(this.getLinks()).map(link => link.serialize());
		return { ...super.serialize(), nodes: serializedNodes, links: serializedLinks };
	}

	setMaxZoomOut(maxZoomOut: number) {
		this._maxZoomOut$.next(maxZoomOut);
	}

	setMaxZoomIn(maxZoomIn: number) {
		this._maxZoomIn$.next(maxZoomIn);
	}

	getMaxZoomOut() {
		return this._maxZoomOut$.getValue();
	}

	getMaxZoomIn() {
		return this._maxZoomIn$.getValue();
	}

	setOffset(x: number, y: number) {
		this._offsetX$.next(x);
		this._offsetY$.next(y);
	}

	setOffsetX(x: number) {
		this._offsetX$.next(x);
	}

	getOffsetX(): number {
		return this._offsetX$.getValue();
	}

	selectOffsetX(): Observable<number> {
		return this.offsetX$;
	}

	setOffsetY(y: number) {
		this._offsetY$.next(y);
	}

	getOffsetY(): number {
		return this._offsetY$.getValue();
	}

	selectOffsetY(): Observable<number> {
		return this.offsetY$;
	}

	setZoomLevel(z: number) {
		const maxZoomIn = this._maxZoomIn$.getValue();
		const maxZoomOut = this._maxZoomOut$.getValue();

		// check if zoom levels exceeded defined boundaries
		if ((maxZoomIn && z > maxZoomIn) || (maxZoomOut && z < maxZoomOut)) {
			return;
		}

		this._zoom$.next(z);
	}

	getZoomLevel(): number {
		return this._zoom$.getValue();
	}

	selectZoomLevel(): Observable<number> {
		return this.zoom$;
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
		const gridSize = this._gridSize$.getValue();
		if (gridSize === 0) {
			return { x, y };
		}
		return {
			x: gridSize * Math.floor((x + gridSize / 2) / gridSize),
			y: gridSize * Math.floor((y + gridSize / 2) / gridSize),
		};
	}

	getSelectedItems(...filters: BaseEntityType[]): BaseModel[] {
		if (!Array.isArray(filters)) {
			filters = [filters];
		}
		let items: BaseModel[] = [];

		// run through nodes
		items = items.concat(Object.values(this.getNodes()).flatMap(node => node.getSelectedEntities()));

		// find all the links
		items = items.concat(Object.values(this.getLinks()).flatMap(link => link.getSelectedEntities()));

		// find all points
		items = items.concat(
			Object.values(this.getLinks()).flatMap(link => {
				return link.getPoints().flatMap(point => point.getSelectedEntities());
			})
		);

		items = [...new Set(items)];

		if (filters.length > 0) {
			items = items.filter((item: BaseModel) => {
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
