import {
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { DefaultLabelComponent } from '../components/default-label/default-label.component';
import { AbstractAngularFactory } from './angular.factory';

export class DefaultLabelFactory extends AbstractAngularFactory<
  DefaultLabelComponent
> {
  constructor(
    protected resolver: ComponentFactoryResolver,
    protected renderer: Renderer2
  ) {
    super('default');
  }

  generateWidget({
    model,
    host,
  }: {
    model: LabelModel;
    host: ViewContainerRef;
  }): ComponentRef<DefaultLabelComponent> {
    const componentRef = host.createComponent(this.getRecipe());

    // attach coordinates and default positional behaviour to the generated component host
    const rootNode = componentRef.location.nativeElement;

    // default style for link
    this.renderer.setStyle(rootNode, 'position', 'absolute');

    // data attributes
    this.renderer.setAttribute(rootNode, 'data-labelid', model.id);

    // on destroy make sure to destroy the componentRef
    model.onEntityDestroy().subscribe(() => {
      componentRef.destroy();
    });

    componentRef.instance.ngOnInit();
    return componentRef;
  }

  getRecipe(): ComponentFactory<DefaultLabelComponent> {
    return this.resolver.resolveComponentFactory(DefaultLabelComponent);
  }
}
