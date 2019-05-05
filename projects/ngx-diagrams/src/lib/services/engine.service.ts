import { Injectable, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { AbstractNodeFactory } from '../factories/node.factory';
import { DiagramModel } from '../models/diagram.model';
import { DefaultNodeFactory } from '../defaults/factories/default-node.factory';
import { NodeModel } from '../models/node.model';

@Injectable({ providedIn: 'root' })
export class DiagramEngine {
	diagramModel: DiagramModel;

	// TODO: add types to factories
	nodeFactories: { [s: string]: AbstractNodeFactory };
	linkFactories: { [s: string]: any };
	portFactories: { [s: string]: any };
	labelFactories: { [s: string]: any };

	constructor(private resolver: ComponentFactoryResolver) {
		this.nodeFactories = {};
		this.linkFactories = {};
		this.portFactories = {};
		this.labelFactories = {};
	}

	createDiagram() {
		this.diagramModel = new DiagramModel(this);
		return this.diagramModel;
	}

	registerDefaultFactories() {
		// TODO: initialize all factories with default component
		this.registerNodeFactory(new DefaultNodeFactory(this.resolver));
	}

	registerNodeFactory(nodeFactory: AbstractNodeFactory) {
		this.nodeFactories[nodeFactory.type] = nodeFactory;
	}

	//#region Factories
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

	generateWidgetForNode(node: NodeModel, nodesHost: ViewContainerRef): any | null {
		const nodeFactory = this.getFactoryForNode(node);
		if (!nodeFactory) {
			throw new Error(`Cannot find widget factory for node: ${node.type}`);
		}
		return nodeFactory.generateWidget(this, node, nodesHost);
	}

	// getLinkFactories(): { [s: string]: AbstractLinkFactory } {
	//     return this.linkFactories;
	// }

	// registerPortFactory(factory: AbstractPortFactory) {
	//     this.portFactories[factory.type] = factory;
	// this.iterateListeners(listener => {
	//     if (listener.portFactoriesUpdated) {
	//         listener.portFactoriesUpdated();
	//     }
	// });
	// }

	// registerLinkFactory(factory: AbstractLinkFactory) {
	//     this.linkFactories[factory.type] = factory;
	// this.iterateListeners(listener => {
	//     if (listener.linkFactoriesUpdated) {
	//         listener.linkFactoriesUpdated();
	//     }
	// });
	// }

	// getPortFactory(type: string): AbstractPortFactory {
	//     if (this.portFactories[type]) {
	//         return this.portFactories[type];
	//     }
	//     throw new Error(`cannot find factory for port of type: [${type}]`);
	// }

	// getLinkFactory(type: string): AbstractLinkFactory {
	//     if (this.linkFactories[type]) {
	//         return this.linkFactories[type];
	//     }
	//     throw new Error(`cannot find factory for link of type: [${type}]`);
	// }

	// getFactoryForLink(link: LinkModel): AbstractLinkFactory | null {
	//     return this.getLinkFactory(link.type);
	// }

	// generateWidgetForLink(link: LinkModel): JSX.Element | null {
	//     const linkFactory = this.getFactoryForLink(link);
	//     if (!linkFactory) {
	//         throw new Error(`Cannot find link factory for link: ${link.type}`);
	//     }
	//     return linkFactory.generateReactWidget(this, link);
	// }
	//#endregion
}
