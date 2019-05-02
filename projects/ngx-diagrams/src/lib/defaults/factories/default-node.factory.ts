import { DefaultNodeComponent, DefaultNodeModel } from '../widgets/node/node.component';
import { AbstractNodeFactory } from '../../factories/node.factory';
import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory } from '@angular/core';
import { DiagramEngine } from '../../engine.service';

export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeComponent> {

    constructor(private resolver: ComponentFactoryResolver) {
        super('default');
    }

    generateWidget(diagramEngine: DiagramEngine, node: DefaultNodeModel, nodesHost: ViewContainerRef): ComponentRef<DefaultNodeComponent> {
        const componentRef = nodesHost.createComponent(this.getRecipe());

        Object.keys(node).forEach(key => {
            componentRef.instance[key] = node[key];
        });
        componentRef.instance.node = node;
        componentRef.instance.diagramEngine = diagramEngine;

        return componentRef;
    }

    getRecipe(): ComponentFactory<DefaultNodeComponent> {
        return this.resolver.resolveComponentFactory(DefaultNodeComponent);
    }
}
