import { AbstractLinkFactory } from '../../factories/link.factory';
import { DefaultLinkComponent } from '../components/default-link/default-link.component';
import { DefaultLinkModel } from '../models/default-link.model';
import { ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory, Renderer2 } from '@angular/core';

export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
	constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer2) {
		super('default');
	}

	generateWidget(link: DefaultLinkModel, linksHost: ViewContainerRef): ComponentRef<DefaultLinkComponent> {
		const componentRef = linksHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = componentRef.location.nativeElement;

		// default style for link
		this.renderer.setStyle(rootNode, 'position', 'absolute');

		// data attributes
		this.renderer.setAttribute(rootNode, 'data-linkid', link.id);

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
