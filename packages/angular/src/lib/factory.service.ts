import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Type,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractFactory,
  BaseModel,
  toRegistryKey,
  WidgetOptions,
} from '@rxzu/core';
import { RegistryService } from './registry.service';
import { MODEL } from './injection.tokens';

@Injectable()
export class FactoryService extends AbstractFactory<
  Type<any>,
  ComponentRef<any>
> {
  constructor(
    registry: RegistryService,
    private cfr: ComponentFactoryResolver
  ) {
    super(registry);
  }

  getHTMLElement(widget: ComponentRef<any>): HTMLElement {
    return widget.location.nativeElement;
  }

  destroyWidget(widget: ComponentRef<any>) {
    widget.destroy();
  }

  detectChanges(widget: ComponentRef<any>) {
    widget.changeDetectorRef.detectChanges();
  }

  resolveComponent<M extends BaseModel>({
    model,
    host,
    index,
  }: WidgetOptions<M, ViewContainerRef>): ComponentRef<any> {
    const cmp = this.get(model);
    if (!cmp)
      throw new Error(
        `[RxZu] Couldn't find component for ${toRegistryKey(
          model.type,
          model.namespace
        )}`
      );

    const injector = Injector.create({
      providers: [{ provide: MODEL, useValue: model }],
      parent: host.injector,
    });

    const ref = host.createComponent(
      this.cfr.resolveComponentFactory(cmp),
      index,
      injector
    );

    return ref;
  }
}
