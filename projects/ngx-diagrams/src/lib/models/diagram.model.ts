import { BehaviorSubject, Observable } from 'rxjs';
import { BaseEntity, BaseEntityType } from '../base.entity';
import { Coords } from '../interfaces/coords.interface';
import { SelectOptions } from '../interfaces/select-options.interface';
import { SerializedDiagramModel } from '../interfaces/serialization.interface';
import { DiagramEngine } from '../services/engine.service';
import { coerceArray, ID, isEmptyArray, unique } from '../utils/tool-kit.util';
import { TypedMap } from '../utils/types';
import { BaseModel } from './base.model';
import { LinkModel } from './link.model';
import { NodeModel } from './node.model';
import { PortModel } from './port.model';

export class DiagramModel extends BaseEntity {
	protected _links$ = new BehaviorSubject<TypedMap<LinkModel>>(new TypedMap());
	protected _nodes$ = new BehaviorSubject<TypedMap<NodeModel>>(new TypedMap());
	protected _zoom$ = new BehaviorSubject(100);
	protected _offsetX$ = new BehaviorSubject(0);
	protected _offsetY$ = new BehaviorSubject(0);
	protected _gridSize$ = new BehaviorSubject(0);
	protected _maxZoomOut$ = new BehaviorSubject(null);
	protected _maxZoomIn$ = new BehaviorSubject(null);

	protected nodes$ = this._nodes$.pipe(this.entityPipe('nodes'));
	protected links$ = this._links$.pipe(this.entityPipe('links'));

	protected offsetX$ = this._offsetX$.pipe(this.entityPipe('offsetX'));
	protected offsetY$ = this._offsetY$.pipe(this.entityPipe('offsetY'));
	protected zoom$ = this._zoom$.pipe(this.entityPipe('zoom'));

	constructor(protected diagramEngine: DiagramEngine, id?: string, logPrefix: string = '[Diagram]') {
		super(id, logPrefix);
	}

	// TODO: support the following events for links and nodes
	// removed, updated<positionChanged/dataChanged>, added
	getNodes(): TypedMap<NodeModel> {
		return this._nodes$.getValue();
	}

	getNode(id: ID): NodeModel | undefined {
		return this._nodes$.getValue().get(id);
	}

	getLink(id: ID): LinkModel | undefined {
		return this._links$.getValue().get(id);
	}

	getLinks(): TypedMap<LinkModel> {
		return this._links$.getValue();
	}

	getAllPorts(options: SelectOptions<PortModel> = {}): Map<string, PortModel> {
		const result = new Map<string, PortModel>();

		for (const node of this.getNodes().values()) {
			const ports = options.filter ? node.getPorts().valuesArray().filter(options.filter) : node.getPorts().valuesArray();
			ports.forEach(port => result.set(port.id, port));
		}

		return result;
	}

	/**
	 * Add a node to the diagram
	 * @returns Inserted Node
	 */
	addNode(node: NodeModel): NodeModel {
		this.getNodes().set(node.id, node);
		this._nodes$.next(this.getNodes());
		return node;
	}

	/**
	 * Delete a node from the diagram
	 */
	deleteNode(nodeOrId: NodeModel | string): void {
		const nodeId: ID = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;
		const node = this.getNode(nodeId);

		for (const port of node.getPorts().values()) {
			for (const link of port.getLinks().values()) {
				this.deleteLink(link);
			}
		}

		this.getNodes().delete(nodeId);
		node.destroy();
	}

	/**
	 * Get nodes as observable, use `.getValue()` for snapshot
	 */
	selectNodes(): Observable<TypedMap<NodeModel>> {
		return this.nodes$;
	}

	/**
	 * Add link
	 * @returns Newly created link
	 */
	addLink(link: LinkModel): LinkModel {
		this.getLinks().set(link.id, link);
		this._links$.next(this.getLinks());
		return link;
	}

	/**
	 * Delete link
	 */
	deleteLink(linkOrId: LinkModel | string) {
		const linkId: ID = typeof linkOrId === 'string' ? linkOrId : linkOrId.id;
		const link = this.getLink(linkId);
		this.getLinks().delete(linkId);
		link.destroy();
	}

	reset() {
		const links = this.getLinks().values();
		const nodes = this.getNodes().values();

		for (const node of nodes) {
			node.destroy();
		}

		for (const link of links) {
			link.destroy();
		}

		this.getNodes().clear();
		this._nodes$.next(this.getNodes());

		this.getLinks().clear();
		this._links$.next(this.getLinks());
	}

	/**
	 * Get links behaviour subject, use `.getValue()` for snapshot
	 */
	selectLinks(): Observable<TypedMap<LinkModel>> {
		return this.links$;
	}

	// /**
	//  * Serialize the diagram model to JSON
	//  * @returns diagram model as a string
	//  */
	serialize(): SerializedDiagramModel {
		const serializedNodes = this.getNodes()
			.valuesArray()
			.map(node => node.serialize());
		const serializedLinks = this.getLinks()
			.valuesArray()
			.map(link => link.serialize());

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
			if (ignore?.id === element.id) {
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
		filters = coerceArray(filters);

		const items: BaseModel[] = [];
		const nodes = this.getNodes().valuesArray();
		const links = this.getLinks().valuesArray();

		const selectedNodes = () => nodes.flatMap(node => node.getSelectedEntities());
		const selectedPorts = () =>
			nodes.flatMap(node =>
				node
					.getPorts()
					.valuesArray()
					.flatMap((port: PortModel) => port.getSelectedEntities())
			);
		const selectedLinks = () => links.flatMap(link => link.getSelectedEntities());
		const selectedPoints = () => links.flatMap(link => link.getPoints().flatMap(point => point.getSelectedEntities()));

		if (isEmptyArray(filters)) {
			items.push(...selectedNodes(), ...selectedPorts(), ...selectedLinks(), ...selectedPoints());
		} else {
			const byType: Record<BaseEntityType, () => BaseModel[]> = {
				node: selectedNodes,
				port: selectedPorts,
				link: selectedLinks,
				point: selectedPoints,
			};

			for (const type of filters) {
				items.push(...byType[type]());
			}
		}

		return unique(items);
	}

	addAll(...models: BaseModel[]) {
		const links: LinkModel[] = [];
		const nodes: NodeModel[] = [];

		for (const model of models) {
			if (model instanceof LinkModel) {
				links.push(model);
			} else if (model instanceof NodeModel) {
				nodes.push(model);
			}
		}

		this.addLinks(links);
		this.addNodes(nodes);

		return models;
	}

	addLinks(links: LinkModel[]) {
		for (const link of links) {
			this.getLinks().set(link.id, link);
		}

		this._links$.next(this.getLinks());
	}

	addNodes(nodes: NodeModel[]) {
		for (const node of nodes) {
			this.getNodes().set(node.id, node);
		}
		this._nodes$.next(this.getNodes());
	}
}
