import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentProviderOptions, RxZuModule } from '@rxzu/angular';
import {
  VStudioNodeComponent,
  VStudioPortComponent,
  VStudioLinkComponent,
  VStudioLabelComponent,
} from './components';

const GHWorkflowTheme: ComponentProviderOptions[] = [
  {
    type: 'node',
    component: VStudioNodeComponent,
    namespace: 'vstudio',
  },
  {
    type: 'port',
    component: VStudioPortComponent,
    namespace: 'vstudio',
  },
  {
    type: 'link',
    component: VStudioLinkComponent,
    namespace: 'vstudio',
  },
  {
    type: 'label',
    component: VStudioLabelComponent,
    namespace: 'vstudio',
  },
];

const COMPONENTS = [
  VStudioNodeComponent,
  VStudioPortComponent,
  VStudioLinkComponent,
  VStudioLabelComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, RxZuModule.withComponents(GHWorkflowTheme)],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS, RxZuModule],
})
export class RxZuVStudioTheme {}
