import { CommonModule } from '@angular/common';
import { Inject, ModuleWithProviders, NgModule, Optional, Provider } from '@angular/core';
import { RxZuDiagramComponent } from './diagram/diagram.component';
import { TemplateVarDirective } from './utils';
import { COMPONENT, ComponentProviderOptions, } from './injection.tokens';
import { RegistryService } from './registry.service';
import { toCompRegistryKey } from '@rxzu/core';

@NgModule({
  declarations: [RxZuDiagramComponent, TemplateVarDirective],
  imports: [CommonModule],
  exports: [RxZuDiagramComponent]
})
export class RxZuModule {
  constructor(registry: RegistryService, @Inject(COMPONENT) @Optional() components: Omit<ComponentProviderOptions, 'entityType'>[]) {
    components?.forEach(({ type, comp }) => registry.set(type, comp));
  }

  static registerComponent({ entityType, type, comp }: ComponentProviderOptions): Provider {
    return { provide: COMPONENT, multi: true, useValue: { type: toCompRegistryKey(entityType, type), comp } }
  }

  static withComponents(components?: ComponentProviderOptions | ComponentProviderOptions[]): ModuleWithProviders<RxZuModule> {
    return {
      ngModule: RxZuModule,
      providers: [
        ...([] as ComponentProviderOptions[]).concat(components || []).map(RxZuModule.registerComponent)
      ]
    };
  }
}
