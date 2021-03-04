import { Inject, Injectable, Optional, SkipSelf, Type } from '@angular/core';
import { AbstractRegistry } from '@rxzu/core';

@Injectable({ providedIn: 'root' })
export class RegistryService extends AbstractRegistry<Type<any>> {

  constructor(@Optional() @SkipSelf() @Inject(RegistryService) parent: RegistryService | null) {
    super(parent);
  }
}
