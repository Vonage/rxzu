import { ViewContainerRef, ComponentRef, ComponentFactory, ComponentFactoryResolver, Renderer2 } from '@angular/core';
import { AbstractPortFactory, DefaultPortModel } from 'ngx-diagrams';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CustomPortComponent } from './custom.component';

export class CustomPortFactory extends AbstractPortFactory<CustomPortComponent> {
	constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer2) {
		super('custom-port');
	}

	generateWidget(port: DefaultPortModel, portsHost: ViewContainerRef): ComponentRef<CustomPortComponent> {
		const componentRef = portsHost.createComponent(this.getRecipe());

		// attach coordinates and default positional behaviour to the generated component host
		const rootNode = componentRef.location.nativeElement as HTMLElement;

		// data attributes
		this.renderer.setAttribute(rootNode, 'data-portid', port.id);
		this.renderer.setAttribute(rootNode, 'data-name', port.getName());

		port.in ? this.renderer.addClass(rootNode, 'in') : this.renderer.addClass(rootNode, 'out');

		// assign all passed properties to node initialization.
		Object.entries(port).forEach(([key, value]) => {
			componentRef.instance[key] = value;
		});

		// this method will add classes to all ports that have links
		this.isConnected(port).subscribe(connected => {
			connected ? this.renderer.addClass(rootNode, 'connected') : this.renderer.removeClass(rootNode, 'connected');
		});

		port.onEntityDestroy().subscribe(e => {
			componentRef.destroy();
		});

		return componentRef;
	}

	getRecipe(): ComponentFactory<CustomPortComponent> {
		return this.resolver.resolveComponentFactory(CustomPortComponent);
	}

	getNewInstance(initialConfig?: any): DefaultPortModel {
		return new DefaultPortModel({ isInput: true, name: 'unknown', ...initialConfig });
	}

	isConnected(port: DefaultPortModel): Observable<boolean> {
		return port.selectLinks().pipe(
			takeUntil(port.onEntityDestroy()),
			map(links => Object.keys(links).length > 0)
		);
	}
}
