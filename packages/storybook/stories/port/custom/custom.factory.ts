import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
} from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { PortModel } from '@rxzu/core';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CustomPortComponent } from './custom.component';

export class CustomPortFactory extends AbstractAngularFactory {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom');
  }

  generateWidget({
    model,
    host,
  }: {
    model: PortModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomPortComponent> {
    const componentRef = host.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement as HTMLElement;

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-portid', model.id);
    const name = model.getName();
    if (name) {
      this.renderer.setAttribute(rootNode, 'data-name', name);
    }

    // model.in
    //   ? this.renderer.addClass(rootNode, 'in')
    //   : this.renderer.addClass(rootNode, 'out');

    // assign all passed properties to node initialization.
    // Object.entries(model).forEach(([key, value]: [string, any]) => {
    //   componentRef.instance[key] = value;
    // });

    // this method will add classes to all ports that have links
    this.isConnected(model).subscribe((connected) => {
      connected
        ? this.renderer.addClass(rootNode, 'connected')
        : this.renderer.removeClass(rootNode, 'connected');
    });

    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    return componentRef;
  }

  getRecipe(): ComponentFactory<CustomPortComponent> {
    return this.resolver.resolveComponentFactory(CustomPortComponent);
  }

  isConnected(port: PortModel): Observable<boolean> {
    return port.selectLinks().pipe(
      takeUntil(port.onEntityDestroy()),
      map((links) => Object.keys(links).length > 0)
    );
  }
}
