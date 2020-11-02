import { DefaultNodeComponent } from '../components/default-node/default-node.component';
import { AbstractNodeFactory } from '../../factories/node.factory';
import { ComponentFactoryResolver, ViewContainerRef, ComponentRef, ComponentFactory, Renderer2 } from '@angular/core';
import { DiagramEngine } from '../../services/engine.service';
import { DefaultNodeModel } from '../models/default-node.model';

export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeModel> {
	constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer2) {
		super('default');
	}

	generateWidget(diagramEngine: DiagramEngine, node: DefaultNodeModel, nodesHost: ViewContainerRef): ComponentRef<DefaultNodeComponent> {
		const componentRef = nodesHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = componentRef.location.nativeElement;

		// default style for node
		this.renderer.setStyle(rootNode, 'position', 'absolute');
		this.renderer.setStyle(rootNode, 'display', 'block');

		// data attributes
		this.renderer.setAttribute(rootNode, 'data-nodeid', node.id);

		// subscribe to node coordinates
		node.selectCoords().subscribe(({ x, y }) => {
			this.renderer.setStyle(rootNode, 'left', `${x}px`);
			this.renderer.setStyle(rootNode, 'top', `${y}px`);
		});

		node.selectionChanges().subscribe(e => {
			e.isSelected ? this.renderer.addClass(rootNode, 'selected') : this.renderer.removeClass(rootNode, 'selected');
		});

		node.onEntityDestroy().subscribe((/** e */) => {
			componentRef.destroy();
		});

		// assign all passed properties to node initialization.
		Object.entries(node).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		componentRef.instance.setDiagramEngine(diagramEngine);

		componentRef.instance.setPainted(true);

		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultNodeComponent> {
		return this.resolver.resolveComponentFactory(DefaultNodeComponent);
	}

	getNewInstance(initialConfig?: any): DefaultNodeModel {
		return new DefaultNodeModel('default', ...initialConfig);
	}
}
