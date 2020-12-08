import { ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory, Renderer2 } from '@angular/core';
import { AbstractLabelFactory } from '../../factories/label.factory';
import { DefaultLabelComponent } from '../components/default-label/default-label.component';
import { DefaultLabelModel } from '../models/default-label.model';

export class DefaultLabelFactory extends AbstractLabelFactory<DefaultLabelModel> {
	constructor(protected resolver: ComponentFactoryResolver, protected renderer: Renderer2) {
		super('default');
	}

	generateWidget(label: DefaultLabelComponent, labelHost: ViewContainerRef): ComponentRef<DefaultLabelComponent> {
		const componentRef = labelHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = componentRef.location.nativeElement;

		// default style for link
		this.renderer.setStyle(rootNode, 'position', 'absolute');

		// data attributes
		this.renderer.setAttribute(rootNode, 'data-labelid', label.id);

		// on destroy make sure to destroy the componentRef
		label.onEntityDestroy().subscribe(() => {
			componentRef.destroy();
		});

		// assign all passed properties to node initialization.
		Object.entries(label).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		componentRef.instance.setPainted(true);
		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultLabelComponent> {
		return this.resolver.resolveComponentFactory(DefaultLabelComponent);
	}

	getNewInstance() {
		return new DefaultLabelModel();
	}
}
