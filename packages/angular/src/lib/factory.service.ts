import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Renderer2,
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
    private cfr: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    super(registry);
  }

  resolveComponent<M extends BaseModel>({
    model,
    host,
    index,
    diagramModel,
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

    this.renderer.setAttribute(
      ref.location.nativeElement,
      'data-type',
      model.type
    );

    this.renderer.setAttribute(ref.location.nativeElement, 'data-id', model.id);
    this.renderer.setAttribute(
      ref.location.nativeElement,
      'data-parentId',
      model.getParent()?.id ?? diagramModel?.id
    );

    this.renderer.setAttribute(
      ref.location.nativeElement,
      'data-namespace',
      model.namespace
    );

    ref.changeDetectorRef.detectChanges();

    model.onEntityDestroy().subscribe(() => ref.destroy());

    return ref;
  }
}
