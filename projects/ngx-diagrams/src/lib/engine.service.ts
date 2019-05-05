import { Injectable, ComponentFactoryResolver, ViewContainerRef, ComponentRef } from '@angular/core';
import { AbstractNodeFactory } from './factories/node.factory';
import { DiagramModel } from './models/diagram.model';
import { DefaultNodeFactory } from './defaults/factories/default-node.factory';
import { NodeModel } from './models/node.model';
import { AbstractLinkFactory } from './factories/link.factory';
import { AbstractPortFactory } from './factories/port.factory';
import { DefaultPortFactory } from './defaults/factories/default-port.factory';
import { LinkModel } from './models/link.model';

@Injectable({ providedIn: 'root' })
export class DiagramEngine {
	diagramModel: DiagramModel;

	// TODO: add types to factories
	nodeFactories: { [s: string]: AbstractNodeFactory };
	linkFactories: { [s: string]: AbstractLinkFactory };
	portFactories: { [s: string]: AbstractPortFactory };

	constructor(private resolver: ComponentFactoryResolver) {
		this.nodeFactories = {};
		this.linkFactories = {};
		this.portFactories = {};
	}

	createDiagram() {
		this.diagramModel = new DiagramModel(this);
		return this.diagramModel;
	}

	registerDefaultFactories() {
		this.registerNodeFactory(new DefaultNodeFactory(this.resolver));
		this.registerPortFactory(new DefaultPortFactory());

		// TODO: implement defaultLinkFactory
		// this.registerLinkFactory(new DefaultLinkFactory())
	}

	//#region Factories
	// NODES
	registerNodeFactory(nodeFactory: AbstractNodeFactory) {
		this.nodeFactories[nodeFactory.getType()] = nodeFactory;
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
		this.portFactories[factory.getType()] = factory;
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

	// LINKS
	getLinkFactories(): { [s: string]: AbstractLinkFactory } {
		return this.linkFactories;
	}

	registerLinkFactory(factory: AbstractLinkFactory) {
		this.linkFactories[factory.getType()] = factory;
	}

	getLinkFactory(type: string): AbstractLinkFactory {
		if (this.linkFactories[type]) {
			return this.linkFactories[type];
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
}
