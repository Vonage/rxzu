import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import { AbstractNodeFactory } from '../../factories/node.factory';
import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory } from '@angular/core';
import { DiagramEngine } from '../../services/engine.service.js';
import { DefaultNodeModel } from '../models/default-node.model';

export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeModel> {
	constructor(private resolver: ComponentFactoryResolver) {
		super('default');
	}

	generateWidget(diagramEngine: DiagramEngine, node: DefaultNodeModel, nodesHost: ViewContainerRef): ComponentRef<DefaultNodeComponent> {
		const componentRef = nodesHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

		// default style for node
		rootNode.style.position = 'absolute';
		rootNode.style.display = 'block';

		// data attributes
		rootNode.setAttribute('data-nodeid', node.id);

		// subscribe to node coordinates
		node.selectCoords().subscribe(({ x, y }) => {
			rootNode.style.left = `${x}px`;
			rootNode.style.top = `${y}px`;
		});

		node.selectionChanges().subscribe(e => {
			e.isSelected ? rootNode.classList.add('selected') : rootNode.classList.remove('selected');
		});

		node.onEntityDestroy().subscribe(e => {
			componentRef.destroy();
		});

		// assign all passed properties to node initialization.
		Object.entries(node).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		componentRef.instance.diagramEngine = diagramEngine;

		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultNodeComponent> {
		return this.resolver.resolveComponentFactory(DefaultNodeComponent);
	}

	getNewInstance(initialConfig?: any): DefaultNodeModel {
		return new DefaultNodeModel('default', ...initialConfig);
	}
}
