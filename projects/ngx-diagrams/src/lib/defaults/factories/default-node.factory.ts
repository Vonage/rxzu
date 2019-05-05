import { DefaultNodeComponent, DefaultNodeModel } from '../widgets/node/node.component';
import { AbstractNodeFactory } from '../../factories/node.factory';
import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory } from '@angular/core';
import { DiagramEngine } from '../../services/engine.service';

export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeComponent> {
	constructor(private resolver: ComponentFactoryResolver) {
		super('default');
	}

	generateWidget(diagramEngine: DiagramEngine, node: DefaultNodeModel, nodesHost: ViewContainerRef): ComponentRef<DefaultNodeComponent> {
		const componentRef = nodesHost.createComponent(this.getRecipe());
		Object.entries(node).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});
		componentRef.instance.diagramEngine = diagramEngine;

		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultNodeComponent> {
		return this.resolver.resolveComponentFactory(DefaultNodeComponent);
	}
}
