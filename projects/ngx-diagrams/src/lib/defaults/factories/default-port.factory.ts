import { AbstractPortFactory } from '../../factories/port.factory';
import { DefaultPortModel } from '../models/default-port.model';
import { ViewContainerRef, ComponentRef, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { DefaultPortComponent } from '../components/default-port/default-port.component';

export class DefaultPortFactory extends AbstractPortFactory<DefaultPortModel> {
	constructor(private resolver: ComponentFactoryResolver) {
		super('default');
	}

	generateWidget(port: DefaultPortModel, portsHost: ViewContainerRef): ComponentRef<DefaultPortComponent> {
		const componentRef = portsHost.createComponent(this.getRecipe());

		// // attach coordinates and default positional behaviour to the generated component host
		// const rootNode = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

		// rootNode.style.position = 'absolute';
		// rootNode.style.display = 'block';

		// // subscribe to node coordinates
		// const xSub = node.selectX().subscribe(x => (rootNode.style.left = `${x}px`));
		// const ySub = node.selectY().subscribe(y => (rootNode.style.top = `${y}px`));

		// // onDestroy unsubscribe from coordinates to prevent memory leaks!
		// componentRef.onDestroy(() => {
		// 	xSub.unsubscribe();
		// 	ySub.unsubscribe();
		// });

		// assign all passed properties to node initialization.
		Object.entries(port).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		return componentRef;
	}

	getRecipe(): ComponentFactory<DefaultPortComponent> {
		return this.resolver.resolveComponentFactory(DefaultPortComponent);
	}

	getNewInstance(initialConfig?: any): DefaultPortModel {
		return new DefaultPortModel(true, 'unknown', ...initialConfig);
	}
}
