import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import { AbstractNodeFactory } from '../../factories/node.factory';
import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory } from '@angular/core';
import { DiagramEngine } from '../../engine.service';
import { DefaultNodeModel } from '../models/default-node.model';

export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeModel> {
	constructor(private resolver: ComponentFactoryResolver) {
		super('default');
	}

	generateWidget(diagramEngine: DiagramEngine, node: DefaultNodeModel, nodesHost: ViewContainerRef): ComponentRef<DefaultNodeComponent> {
		const componentRef = nodesHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

		rootNode.style.position = 'absolute';
		rootNode.style.display = 'block';
		const xSub = node.selectY().subscribe(x => (rootNode.style.left = `${x}px`));
		const ySub = node.selectY().subscribe(y => (rootNode.style.top = `${y}px`));

		// onDestroy unsubscribe from coordinates to prevent memory leaks!
		componentRef.onDestroy(() => {
			xSub.unsubscribe();
			ySub.unsubscribe();
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
