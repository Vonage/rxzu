import { BehaviorSubject, Observable } from 'rxjs';
import { BaseEntity, BaseEntityType } from '../base.entity';
import { Coords } from '../interfaces/coords.interface';
import { SelectOptions } from '../interfaces/select-options.interface';
import { SerializedDiagramModel } from '../interfaces/serialization.interface';
import { DiagramEngine } from '../services/engine.service';
import { ID } from '../utils/tool-kit.util';
import { HashMap } from '../utils/types';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';
import { PointModel } from './point.model';
import { PortModel } from './port.model';

export class DiagramModel extends BaseEntity {
	protected _links$ = new BehaviorSubject<HashMap<LinkModel>>({});
	protected _nodes$ = new BehaviorSubject<HashMap<NodeModel>>({});
	protected _zoom$ = new BehaviorSubject(100);
	protected _offsetX$ = new BehaviorSubject(0);
	protected _offsetY$ = new BehaviorSubject(0);
	protected _gridSize$ = new BehaviorSubject(0);
	protected _maxZoomOut$ = new BehaviorSubject(null);
	protected _maxZoomIn$ = new BehaviorSubject(null);

	protected nodes$ = this._nodes$.asObservable().pipe(this.entityPipe('nodes'));
	protected links$ = this._links$.asObservable().pipe(this.entityPipe('links'));

	protected offsetX$ = this._offsetX$.asObservable().pipe(this.entityPipe('offsetX'));
	protected offsetY$ = this._offsetY$.asObservable().pipe(this.entityPipe('offsetY'));
	protected zoom$ = this._zoom$.asObservable().pipe(this.entityPipe('zoom'));

	constructor(protected diagramEngine: DiagramEngine, id?: string, logPrefix: string = '[Diagram]') {
		super(id, logPrefix);
	}

	// TODO: support the following events for links and nodes
	// removed, updated<positionChanged/dataChanged>, added
	getNodes(): HashMap<NodeModel> {
		return this._nodes$.getValue();
	}

	getNode(id: ID): NodeModel | null {
		return this._nodes$.getValue()[id];
	}

	getLink(id: ID): LinkModel | null {
		return this._links$.getValue()[id];
	}

	getLinks(): HashMap<LinkModel> {
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
		this._nodes$.next({ ...this._nodes$.value, [node.id]: node });
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
	selectNodes(): Observable<HashMap<NodeModel>> {
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
		Object.values(this.getNodes()).forEach(node => {
			this.deleteNode(node);
		});
	}

	/**
	 * Get links behaviour subject, use `.getValue()` for snapshot
	 */
	selectLinks(): Observable<HashMap<LinkModel>> {
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
