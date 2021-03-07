import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxZuModule } from '../main.module';
import { ComponentProviderOptions } from '../injection.tokens';
import { DefaultLinkComponent } from './components/default-link/default-link.component';
import { DefaultLabelComponent } from './components/default-label/default-label.component';
import { DefaultNodeComponent } from './components/default-node/default-node.component';
import { DefaultPortComponent } from './components/default-port/default-port.component';

const DEFAULTS: ComponentProviderOptions[] = [
  {
    type: 'node',
    component: DefaultNodeComponent
  },
  {
    type: 'port',
    component: DefaultPortComponent
  }, {
    type: 'link',
    component: DefaultLinkComponent
  },
  {
    type: 'label',
    component: DefaultLabelComponent
  }
];
const COMPONENTS = [DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent, DefaultNodeComponent]
@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, RxZuModule.withComponents(DEFAULTS)],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS, RxZuModule]
})
export class RxZuDefaultsModule {}
