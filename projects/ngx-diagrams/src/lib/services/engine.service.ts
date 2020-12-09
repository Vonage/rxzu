import { ComponentFactoryResolver, ComponentRef, Injectable, Renderer2, RendererFactory2, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay, filter, take } from 'rxjs/operators';
import { BaseEntity } from '../base.entity';
import { DefaultLabelFactory } from '../defaults/factories/default-label.factory';
import { DefaultLinkFactory } from '../defaults/factories/default-link.factory';
import { DefaultNodeFactory } from '../defaults/factories/default-node.factory';
import { DefaultPortFactory } from '../defaults/factories/default-port.factory';
import { AbstractLabelFactory } from '../factories/label.factory';
import { AbstractLinkFactory } from '../factories/link.factory';
import { AbstractNodeFactory } from '../factories/node.factory';
import { AbstractPortFactory } from '../factories/port.factory';
import { DiagramModel } from '../models/diagram.model';
import { LabelModel } from '../models/label.model';
import { LinkModel } from '../models/link.model';
import { NodeModel } from '../models/node.model';
import { PortModel } from '../models/port.model';
import { NgxDiagramsModule } from '../ngx-diagrams.module';
import { PathFinding, ROUTING_SCALING_FACTOR } from '../plugins/smart-routing.plugin';
import { TypedMap } from '../utils/types';

@Injectable({ providedIn: NgxDiagramsModule })
export class DiagramEngine {
	protected _renderer: Renderer2;
	protected nodeFactories = new TypedMap<AbstractNodeFactory>();
	protected labelFactories = new TypedMap<AbstractLabelFactory>();
	protected linkFactories = new TypedMap<AbstractLinkFactory>();
	protected portFactories = new TypedMap<AbstractPortFactory>();
	protected canvas$ = new BehaviorSubject<Element>(null);

	// smart routing related properties
	smartRouting: boolean;
	pathFinding: PathFinding;

	// calculated only when smart routing is active
	canvasMatrix: number[][] = [];
	routingMatrix: number[][] = [];

	// used when at least one element has negative coordinates
	hAdjustmentFactor = 0;
	vAdjustmentFactor = 0;

	diagramModel: DiagramModel;

	constructor(protected resolver: ComponentFactoryResolver, protected rendererFactory: RendererFactory2) {
		this._renderer = this.rendererFactory.createRenderer(null, null);
	}

	createDiagram() {
		this.diagramModel = new DiagramModel(this);
		return this.diagramModel;
	}

	registerDefaultFactories() {
		this.registerNodeFactory(new DefaultNodeFactory(this.resolver, this._renderer));
		this.registerPortFactory(new DefaultPortFactory(this.resolver, this._renderer));
		this.registerLinkFactory(new DefaultLinkFactory(this.resolver, this._renderer));
		this.registerLabelFactory(new DefaultLabelFactory(this.resolver, this._renderer));
	}

	//#region Factories
	// LABELS
	registerLabelFactory(labelFactory: AbstractLabelFactory) {
		this.labelFactories[labelFactory.type] = labelFactory;
	}

	getLabelFactories(): TypedMap<AbstractLabelFactory> {
		return this.labelFactories;
	}

	getLabelFactory(type: string): AbstractLabelFactory {
		if (this.labelFactories.has(type)) {
			return this.labelFactories.get(type);
		}
		throw new Error(`cannot find factory for node of type: [${type}]`);
	}

	getFactoryForLabel(label: LabelModel): AbstractLabelFactory | null {
		return this.getLabelFactory(label.getType());
	}

	generateWidgetForLabel(label: LabelModel, labelHost: ViewContainerRef): ComponentRef<LabelModel> | null {
		const labelFactory = this.getFactoryForLabel(label);
		if (!labelFactory) {
			throw new Error(`Cannot find widget factory for node: ${label.getType()}`);
		}
		return labelFactory.generateWidget(label, labelHost);
	}

	// NODES
	registerNodeFactory(nodeFactory: AbstractNodeFactory) {
		this.nodeFactories.set(nodeFactory.type, nodeFactory);
	}

	getNodeFactories(): TypedMap<AbstractNodeFactory> {
		return this.nodeFactories;
	}

	getNodeFactory(type: string): AbstractNodeFactory {
		if (this.nodeFactories.has(type)) {
			return this.nodeFactories.get(type);
		}
		throw new Error(`cannot find factory for node of type: [${type}]`);
	}

	getFactoryForNode(node: NodeModel): AbstractNodeFactory | null {
		return this.getNodeFactory(node.getType());
	}

	generateWidgetForNode(node: NodeModel, nodesHost: ViewContainerRef): ComponentRef<NodeModel> | null {
		const nodeFactory = this.getFactoryForNode(node);
		if (!nodeFactory) {
			throw new Error(`Cannot find widget factory for node: ${node.getType()}`);
		}
		return nodeFactory.generateWidget(this, node, nodesHost);
	}

	// PORTS
	registerPortFactory(factory: AbstractPortFactory) {
		this.portFactories.set(factory.type, factory);
	}

	getPortFactories() {
		return this.portFactories;
	}

	getPortFactory(type: string): AbstractPortFactory {
		if (this.portFactories.has(type)) {
			return this.portFactories.get(type);
		}
		throw new Error(`cannot find factory for port of type: [${type}]`);
	}

	getFactoryForPort(port: PortModel): AbstractPortFactory | null {
		return this.getPortFactory(port.getType());
	}

	generateWidgetForPort(port: PortModel, portsHost: ViewContainerRef): ComponentRef<PortModel> | null {
		const portFactory = this.getFactoryForPort(port);
		if (!portFactory) {
			throw new Error(`Cannot find widget factory for port: ${port.getType()}`);
		}
		return portFactory.generateWidget(port, portsHost);
	}

	// LINKS
	getLinkFactories(): TypedMap<AbstractLinkFactory> {
		return this.linkFactories;
	}

	registerLinkFactory(factory: AbstractLinkFactory) {
		this.linkFactories.set(factory.type, factory);
	}

	getLinkFactory(type: string): AbstractLinkFactory {
		if (this.linkFactories.has(type)) {
			return this.linkFactories.get(type);
		}
		throw new Error(`cannot find factory for link of type: [${type}]`);
	}

	getFactoryForLink(link: LinkModel): AbstractLinkFactory | null {
		return this.getLinkFactory(link.getType());
	}

	generateWidgetForLink(link: LinkModel, linksHost: ViewContainerRef): ComponentRef<LinkModel> | null {
		const linkFactory = this.getFactoryForLink(link);
		if (!linkFactory) {
			throw new Error(`Cannot find link factory for link: ${link.getType()}`);
		}
		return linkFactory.generateWidget(this, link, linksHost);
	}
	//#endregion

	getNodeElement(node: NodeModel): HTMLElement {
		const selector = this.canvas$.getValue().querySelector(`[data-nodeid="${node.id}"]`);
		if (selector === null) {
			throw new Error('Cannot find Node element with node id: [' + node.id + ']');
		}
		return selector as HTMLElement;
	}

	getNodePortElement(port: PortModel): HTMLElement {
		const selector = this.canvas$.getValue().querySelector(`[data-nodeid="${port.getParent().id}"] [data-portid="${port.id}"]`);
		if (selector === null) {
			throw new Error('Cannot find Node Port element with node id: [' + port.getParent().id + '] and port id: [' + port.id + ']');
		}
		return selector as HTMLElement;
	}

	getPortCenter(port: PortModel) {
		const sourceElement = this.getNodePortElement(port);
		const sourceRect = sourceElement.getBoundingClientRect();
		const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

		return {
			x: sourceElement.offsetWidth / 2 + (rel.x - this.diagramModel.getOffsetX()) / (this.diagramModel.getZoomLevel() / 100.0),
			y: sourceElement.offsetHeight / 2 + (rel.y - this.diagramModel.getOffsetY()) / (this.diagramModel.getZoomLevel() / 100.0),
		};
	}

	/**
	 * Calculate rectangular coordinates of the port passed in.
	 */
	getPortCoords(
		port: PortModel
	): {
		x: number;
		y: number;
		width: number;
		height: number;
	} {
		const sourceElement = this.getNodePortElement(port);
		const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
		const canvasRect = this.canvas$.getValue().getBoundingClientRect() as ClientRect;

		return {
			x: (sourceRect.x - this.diagramModel.getOffsetX()) / (this.diagramModel.getZoomLevel() / 100.0) - canvasRect.left,
			y: (sourceRect.y - this.diagramModel.getOffsetY()) / (this.diagramModel.getZoomLevel() / 100.0) - canvasRect.top,
			width: sourceRect.width,
			height: sourceRect.height,
		};
	}

	/**
	 * Determine the width and height of the node passed in.
	 * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
	 */
	getNodeDimensions(node: NodeModel): { width: number; height: number } {
		if (!this.canvas$.getValue()) {
			return {
				width: 0,
				height: 0,
			};
		}

		const nodeElement = this.getNodeElement(node);
		const nodeRect = nodeElement.getBoundingClientRect();

		return {
			width: nodeRect.width,
			height: nodeRect.height,
		};
	}

	setCanvas(canvas: Element) {
		this.canvas$.next(canvas);
	}

	getRelativeMousePoint(event: MouseEvent): { x: number; y: number } {
		const point = this.getRelativePoint(event.clientX, event.clientY);
		return {
			x: (point.x - this.diagramModel.getOffsetX()) / (this.diagramModel.getZoomLevel() / 100.0),
			y: (point.y - this.diagramModel.getOffsetY()) / (this.diagramModel.getZoomLevel() / 100.0),
		};
	}

	getRelativePoint(x: number, y: number) {
		const canvasRect = this.canvas$.getValue().getBoundingClientRect();
		return { x: x - canvasRect.left, y: y - canvasRect.top };
	}

	getDiagramModel() {
		return this.diagramModel;
	}

	isModelLocked(model: BaseEntity) {
		if (this.diagramModel.getLocked()) {
			return true;
		}

		return model.getLocked();
	}

	/**
	 * fit the canvas zoom levels to the elements contained.
	 * @param additionalZoomFactor allow for further zooming out to make sure edges doesn't cut
	 */
	zoomToFit(additionalZoomFactor: number = 0.005) {
		this.canvas$.pipe(filter(Boolean), take(1), delay(0)).subscribe((canvas: HTMLElement) => {
			const xFactor = canvas.clientWidth / canvas.scrollWidth;
			const yFactor = canvas.clientHeight / canvas.scrollHeight;
			const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

			let newZoomLvl = this.diagramModel.getZoomLevel() * (zoomFactor - additionalZoomFactor);
			const maxZoomOut = this.diagramModel.getMaxZoomOut();

			if (maxZoomOut && newZoomLvl < maxZoomOut) {
				newZoomLvl = maxZoomOut;
			}

			this.diagramModel.setZoomLevel(newZoomLvl);

			// TODO: either block the canvas movement on 0,0 or detect the top left furthest element and set the offest to its edges
			this.diagramModel.setOffset(0, 0);
		});
	}

	// SMART ROUTING
	setSmartRoutingStatus(status: boolean) {
		if (status && !this.pathFinding) {
			this.pathFinding = new PathFinding(this);
		} else {
			this.pathFinding = null;
		}

		this.smartRouting = status;
	}

	getPathfinding() {
		return this.pathFinding;
	}

	calculateCanvasMatrix() {
		const { width: canvasWidth, hAdjustmentFactor, height: canvasHeight, vAdjustmentFactor } = this.calculateMatrixDimensions();

		this.hAdjustmentFactor = hAdjustmentFactor;
		this.vAdjustmentFactor = vAdjustmentFactor;

		const matrixWidth = Math.ceil(canvasWidth / ROUTING_SCALING_FACTOR);
		const matrixHeight = Math.ceil(canvasHeight / ROUTING_SCALING_FACTOR);

		this.canvasMatrix = Array.from({ length: matrixHeight }, (_, i) => i + 1).map(() => {
			return new Array(matrixWidth).fill(0);
		});
	}

	/**
	 * Despite being a long method, we simply iterate over all three collections (nodes, ports and points)
	 * to find the highest X and Y dimensions, so we can build the matrix large enough to contain all elements.
	 */
	calculateMatrixDimensions(): {
		width: number;
		hAdjustmentFactor: number;
		height: number;
		vAdjustmentFactor: number;
	} {
		const allNodesCoords = this.diagramModel
			.getNodes()
			.valuesArray()
			.map(item => ({
				x: item.getCoords().x,
				width: item.getWidth(),
				y: item.getCoords().y,
				height: item.getHeight(),
			}));

		const allLinks = this.diagramModel.getLinks().valuesArray();

		const allPortsCoords = allLinks
			.flatMap(link => [link.getSourcePort(), link.getTargetPort()])
			.filter(port => port !== null)
			.map(item => ({
				x: item.getX(),
				width: item.getWidth(),
				y: item.getY(),
				height: item.getHeight(),
			}));

		const allPointsCoords = allLinks
			.flatMap(link => link.getPoints())
			.map(item => ({
				// points don't have width/height, so let's just use 0
				x: item.getCoords().x,
				width: 0,
				y: item.getCoords().y,
				height: 0,
			}));

		const canvas = this.canvas$.getValue() as HTMLDivElement;

		const allElements = allNodesCoords.concat(allPortsCoords, allPointsCoords);

		const minX =
			Math.floor(
				Math.min(
					allElements.reduce((a, b) => {
						return a.x <= b.x ? a : b;
					}).x,
					0
				) / ROUTING_SCALING_FACTOR
			) * ROUTING_SCALING_FACTOR;

		const maxXElement = allElements.reduce((a, b) => {
			return a.x + a.width >= b.x + b.width ? a : b;
		});

		const maxX = Math.max(maxXElement.x + maxXElement.width, canvas.offsetWidth);

		const minY =
			Math.floor(
				Math.min(
					allElements.reduce((a, b) => {
						return a.y <= b.y ? a : b;
					}).y,
					0
				) / ROUTING_SCALING_FACTOR
			) * ROUTING_SCALING_FACTOR;

		const maxYElement = allElements.reduce((a, b) => {
			return a.y + a.height >= b.y + b.height ? a : b;
		});

		const maxY = Math.max(maxYElement.y + maxYElement.height, canvas.offsetWidth);

		const width = Math.ceil(Math.abs(minX) + maxX);
		const height = Math.ceil(Math.abs(minY) + maxY);

		return {
			width,
			hAdjustmentFactor: Math.abs(minX) / ROUTING_SCALING_FACTOR + 1,
			height,
			vAdjustmentFactor: Math.abs(minY) / ROUTING_SCALING_FACTOR + 1,
		};
	}

	/**
	 * A representation of the canvas in the following format:
	 *
	 * +-----------------+
	 * | 0 0 0 0 0 0 0 0 |
	 * | 0 0 0 0 0 0 0 0 |
	 * | 0 0 0 0 0 0 0 0 |
	 * | 0 0 0 0 0 0 0 0 |
	 * | 0 0 0 0 0 0 0 0 |
	 * +-----------------+
	 *
	 * In which all walkable points are marked by zeros.
	 * It uses @link{#ROUTING_SCALING_FACTOR} to reduce the matrix dimensions and improve performance.
	 */
	getCanvasMatrix(): number[][] {
		if (this.canvasMatrix.length === 0) {
			this.calculateCanvasMatrix();
		}

		return this.canvasMatrix;
	}

	/**
	 * The routing matrix does not have negative indexes, but elements could be negatively positioned.
	 * We use the functions below to translate back and forth between these coordinates, relying on the
	 * calculated values of hAdjustmentFactor and vAdjustmentFactor.
	 */
	translateRoutingX(x: number, reverse: boolean = false) {
		return x + this.hAdjustmentFactor * (reverse ? -1 : 1);
	}
	translateRoutingY(y: number, reverse: boolean = false) {
		return y + this.vAdjustmentFactor * (reverse ? -1 : 1);
	}

	/**
	 * A representation of the canvas in the following format:
	 *
	 * +-----------------+
	 * | 0 0 1 1 0 0 0 0 |
	 * | 0 0 1 1 0 0 1 1 |
	 * | 0 0 0 0 0 0 1 1 |
	 * | 1 1 0 0 0 0 0 0 |
	 * | 1 1 0 0 0 0 0 0 |
	 * +-----------------+
	 *
	 * In which all points blocked by a node (and its ports) are
	 * marked as 1; points were there is nothing (ie, free) receive 0.
	 */
	getRoutingMatrix(): number[][] {
		if (this.routingMatrix.length === 0) {
			this.calculateRoutingMatrix();
		}

		return this.routingMatrix;
	}

	calculateRoutingMatrix(): void {
		const matrix = this.getCanvasMatrix().map(item => item.slice(0));

		// nodes need to be marked as blocked points
		this.markNodes(matrix);

		// same thing for ports
		this.markPorts(matrix);

		this.routingMatrix = matrix;
	}

	getSmartRouting() {
		return !!this.smartRouting;
	}

	/**
	 * Updates (by reference) where nodes will be drawn on the matrix passed in.
	 */
	markNodes(matrix: number[][]): void {
		this.diagramModel.getNodes().forEach(node => {
			const startX = Math.floor(node.getCoords().x / ROUTING_SCALING_FACTOR);
			const endX = Math.ceil((node.getCoords().x + node.getWidth()) / ROUTING_SCALING_FACTOR);
			const startY = Math.floor(node.getCoords().y / ROUTING_SCALING_FACTOR);
			const endY = Math.ceil((node.getCoords().y + node.getHeight()) / ROUTING_SCALING_FACTOR);

			for (let x = startX - 1; x <= endX + 1; x++) {
				for (let y = startY - 1; y < endY + 1; y++) {
					this.markMatrixPoint(matrix, this.translateRoutingX(x), this.translateRoutingY(y));
				}
			}
		});
	}

	/**
	 * Updates (by reference) where ports will be drawn on the matrix passed in.
	 */
	markPorts(matrix: number[][]): void {
		const allElements = this.diagramModel
			.getLinks()
			.valuesArray()
			.flatMap(link => [link.getSourcePort(), link.getTargetPort()]);

		allElements
			.filter(port => port !== null)
			.forEach(port => {
				const startX = Math.floor(port.getX() / ROUTING_SCALING_FACTOR);
				const endX = Math.ceil((port.getX() + port.getWidth()) / ROUTING_SCALING_FACTOR);
				const startY = Math.floor(port.getY() / ROUTING_SCALING_FACTOR);
				const endY = Math.ceil((port.getY() + port.getHeight()) / ROUTING_SCALING_FACTOR);

				for (let x = startX - 1; x <= endX + 1; x++) {
					for (let y = startY - 1; y < endY + 1; y++) {
						this.markMatrixPoint(matrix, this.translateRoutingX(x), this.translateRoutingY(y));
					}
				}
			});
	}

	markMatrixPoint = (matrix: number[][], x: number, y: number) => {
		if (matrix[y] !== undefined && matrix[y][x] !== undefined) {
			matrix[y][x] = 1;
		}
	};
}
