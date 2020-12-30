import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Renderer2,
} from '@angular/core';
import { AbstractAngularFactory } from '@rxzu/angular';
import { DefaultPortModel } from '@rxzu/core';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CustomPortComponent } from './custom.component';

export class CustomPortFactory extends AbstractAngularFactory<
  CustomPortComponent
> {
  constructor(
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super('custom-port');
  }

  generateWidget({
    model,
    host,
  }: {
    model: DefaultPortModel;
    host: ViewContainerRef;
  }): ComponentRef<CustomPortComponent> {
    const componentRef = host.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement as HTMLElement;

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-portid', model.id);
    this.renderer.setAttribute(rootNode, 'data-name', model.getName());

    model.in
      ? this.renderer.addClass(rootNode, 'in')
      : this.renderer.addClass(rootNode, 'out');

    // assign all passed properties to node initialization.
    Object.entries(model).forEach(([key, value]) => {
      componentRef.instance[key] = value;
    });

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

  isConnected(port: DefaultPortModel): Observable<boolean> {
    return port.selectLinks().pipe(
      takeUntil(port.onEntityDestroy()),
      map((links) => Object.keys(links).length > 0)
    );
  }
}
