import { AbstractLinkFactory } from '../../factories/link.factory';
import { DefaultLinkComponent } from '../components/default-link/default-link.component';
import { DefaultLinkModel } from '../models/default-link.model';
import { ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory } from '@angular/core';

export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
	constructor(private resolver: ComponentFactoryResolver) {
		super('default');
	}

	generateWidget(link: DefaultLinkModel, linksHost: ViewContainerRef): ComponentRef<DefaultLinkComponent> {
		const componentRef = linksHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

		// default style for link
		rootNode.style.position = 'absolute';

		// data attributes
		rootNode.setAttribute('data-linkid', link.id);

		// on destroy make sure to destroy the componentRef
		link.onEntityDestroy().subscribe(() => {
			componentRef.destroy();
		});

		// assign all passed properties to node initialization.
		Object.entries(link).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultLinkComponent> {
		return this.resolver.resolveComponentFactory(DefaultLinkComponent);
	}

	getNewInstance() {
		return new DefaultLinkModel();
	}
}
