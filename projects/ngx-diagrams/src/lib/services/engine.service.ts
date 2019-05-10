import { Injectable, ComponentFactoryResolver, ViewContainerRef, ComponentRef } from '@angular/core';
import { AbstractNodeFactory } from '../factories/node.factory';
import { DiagramModel } from '../models/diagram.model';
import { DefaultNodeFactory } from '../defaults/factories/default-node.factory';
import { NodeModel } from '../models/node.model';
import { AbstractLinkFactory } from '../factories/link.factory';
import { AbstractPortFactory } from '../factories/port.factory';
import { DefaultPortFactory } from '../defaults/factories/default-port.factory';
import { LinkModel } from '../models/link.model';
import { PortModel } from '../models/port.model';
import { BehaviorSubject } from 'rxjs';
import { take, delay, filter } from 'rxjs/operators';
import { DefaultLinkFactory } from '../defaults/factories/default-link.factory';

@Injectable({ providedIn: 'root' })
export class DiagramEngine {
	diagramModel: DiagramModel;

	private nodeFactories: { [s: string]: AbstractNodeFactory };
	private linkFactories: { [s: string]: AbstractLinkFactory };
	private portFactories: { [s: string]: AbstractPortFactory };

	private canvas$: BehaviorSubject<Element>;

	constructor(private resolver: ComponentFactoryResolver) {
		this.nodeFactories = {};
		this.linkFactories = {};
		this.portFactories = {};
		this.canvas$ = new BehaviorSubject<Element>(null);
	}

	createDiagram() {
		this.diagramModel = new DiagramModel(this);
		return this.diagramModel;
	}

	registerDefaultFactories() {
		this.registerNodeFactory(new DefaultNodeFactory(this.resolver));
		this.registerPortFactory(new DefaultPortFactory(this.resolver));
		this.registerLinkFactory(new DefaultLinkFactory(this.resolver));

		// TODO: implement defaultLinkFactory
	}

	//#region Factories
	// NODES
	registerNodeFactory(nodeFactory: AbstractNodeFactory) {
		this.nodeFactories[nodeFactory.type] = nodeFactory;
	}

	getNodeFactories(): { [s: string]: AbstractNodeFactory } {
		return this.nodeFactories;
	}

	getNodeFactory(type: string): AbstractNodeFactory {
		if (this.nodeFactories[type]) {
			return this.nodeFactories[type];
		}
		throw new Error(`cannot find factory for node of type: [${type}]`);
	}

	getFactoryForNode(node: NodeModel): AbstractNodeFactory | null {
		return this.getNodeFactory(node.type);
	}

	generateWidgetForNode(node: NodeModel, nodesHost: ViewContainerRef): ComponentRef<NodeModel> | null {
		const nodeFactory = this.getFactoryForNode(node);
		if (!nodeFactory) {
			throw new Error(`Cannot find widget factory for node: ${node.type}`);
		}
		return nodeFactory.generateWidget(this, node, nodesHost);
	}

	// PORTS
	registerPortFactory(factory: AbstractPortFactory) {
		this.portFactories[factory.type] = factory;
	}

	getPortFactories() {
		return this.portFactories;
	}

	getPortFactory(type: string): AbstractPortFactory {
		if (this.portFactories[type]) {
			return this.portFactories[type];
		}
		throw new Error(`cannot find factory for port of type: [${type}]`);
	}

	getFactoryForPort(port: PortModel): AbstractPortFactory | null {
		return this.getPortFactory(port.type);
	}

	generateWidgetForPort(port: PortModel, portsHost: ViewContainerRef): ComponentRef<PortModel> | null {
		const portFactory = this.getFactoryForPort(port);
		if (!portFactory) {
			throw new Error(`Cannot find widget factory for port: ${port.type}`);
		}
		return portFactory.generateWidget(port, portsHost);
	}

	// LINKS
	getLinkFactories(): { [s: string]: AbstractLinkFactory } {
		return this.linkFactories;
	}

	registerLinkFactory(factory: AbstractLinkFactory) {
		this.linkFactories[factory.type] = factory;
	}

	getLinkFactory(type: string): AbstractLinkFactory {
		if (this.linkFactories[type]) {
			return this.linkFactories[type];
		}
		throw new Error(`cannot find factory for link of type: [${type}]`);
	}

	getFactoryForLink(link: LinkModel): AbstractLinkFactory | null {
		return this.getLinkFactory(link.type);
	}

	generateWidgetForLink(link: LinkModel, linksHost: ViewContainerRef): ComponentRef<LinkModel> | null {
		const linkFactory = this.getFactoryForLink(link);
		if (!linkFactory) {
			throw new Error(`Cannot find link factory for link: ${link.type}`);
		}
		return linkFactory.generateWidget(link, linksHost);
	}
	//#endregion

	getNodeElement(node: NodeModel): Element {
		const selector = this.canvas$.getValue().querySelector(`[data-nodeid="${node.id}"]`);
		if (selector === null) {
			throw new Error('Cannot find Node element with node id: [' + node.id + ']');
		}
		return selector;
	}

	getNodePortElement(port: PortModel): any {
		const selector = this.canvas$.getValue().querySelector(`[data-nodeid="${port.parent.id}"] [data-portid="${port.id}"]`);
		if (selector === null) {
			throw new Error('Cannot find Node Port element with node id: [' + port.parent.id + '] and port id: [' + port.id + ']');
		}
		return selector;
	}

	getPortCenter(port: PortModel) {
		const sourceElement = this.getNodePortElement(port);
		const sourceRect = sourceElement.getBoundingClientRect();
		const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

		return {
			x:
				sourceElement.offsetWidth / 2 +
				(rel.x - this.diagramModel.getOffsetX().getValue()) / (this.diagramModel.getZoomLevel().getValue() / 100.0),
			y:
				sourceElement.offsetHeight / 2 +
				(rel.y - this.diagramModel.getOffsetY().getValue()) / (this.diagramModel.getZoomLevel().getValue() / 100.0)
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
		const sourceRect = sourceElement.getBoundingClientRect();
		const canvasRect = this.canvas$.getValue().getBoundingClientRect() as ClientRect;

		return {
			x:
				(sourceRect.x - this.diagramModel.getOffsetX().getValue()) / (this.diagramModel.getZoomLevel().getValue() / 100.0) -
				canvasRect.left,
			y:
				(sourceRect.y - this.diagramModel.getOffsetY().getValue()) / (this.diagramModel.getZoomLevel().getValue() / 100.0) - canvasRect.top,
			width: sourceRect.width,
			height: sourceRect.height
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
				height: 0
			};
		}

		const nodeElement = this.getNodeElement(node);
		const nodeRect = nodeElement.getBoundingClientRect();

		return {
			width: nodeRect.width,
			height: nodeRect.height
		};
	}

	setCanvas(canvas: Element) {
		this.canvas$.next(canvas);
	}

	getRelativeMousePoint(event: MouseEvent): { x: number; y: number } {
		const point = this.getRelativePoint(event.clientX, event.clientY);
		return {
			x: (point.x - this.diagramModel.getOffsetX().value) / (this.diagramModel.getZoomLevel().value / 100.0),
			y: (point.y - this.diagramModel.getOffsetY().value) / (this.diagramModel.getZoomLevel().value / 100.0)
		};
	}

	getRelativePoint(x: number, y: number) {
		const canvasRect = this.canvas$.getValue().getBoundingClientRect();
		return { x: x - canvasRect.left, y: y - canvasRect.top };
	}

	/**
	 * fit the canvas zoom levels to the elements contained.
	 * @param additionalZoomFactor allow for further zooming out to make sure edges doesn't cut
	 */
	zoomToFit(additionalZoomFactor: number = 0.005) {
		this.canvas$
			.pipe(
				filter(Boolean),
				take(1),
				delay(0)
			)
			.subscribe(canvas => {
				const xFactor = canvas.clientWidth / canvas.scrollWidth;
				const yFactor = canvas.clientHeight / canvas.scrollHeight;
				const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

				this.diagramModel.setZoomLevel(this.diagramModel.getZoomLevel().value * (zoomFactor - additionalZoomFactor));
				this.diagramModel.setOffset(0, 0);
			});
	}
}
