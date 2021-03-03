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
    name: 'default',
    component: DefaultNodeComponent
  },
  {
    type: 'port',
    name: 'default',
    component: DefaultPortComponent
  }, {
    type: 'link',
    name: 'default',
    component: DefaultLinkComponent
  },
  {
    type: 'label',
    name: 'default',
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
