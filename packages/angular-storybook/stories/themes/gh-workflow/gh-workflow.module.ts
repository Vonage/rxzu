import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentProviderOptions, RxZuModule } from '@rxzu/angular';
import {
  GHWorkflowNodeComponent,
  GHWorkflowPortComponent,
  GHWorkflowLinkComponent,
  GHWorkflowLabelComponent,
} from './components';

const GHWorkflowTheme: ComponentProviderOptions[] = [
  {
    type: 'node',
    component: GHWorkflowNodeComponent,
    namespace: 'gh',
  },
  {
    type: 'port',
    component: GHWorkflowPortComponent,
    namespace: 'gh',
  },
  {
    type: 'link',
    component: GHWorkflowLinkComponent,
    namespace: 'gh',
  },
  {
    type: 'label',
    component: GHWorkflowLabelComponent,
    namespace: 'gh',
  },
];

const COMPONENTS = [
  GHWorkflowNodeComponent,
  GHWorkflowPortComponent,
  GHWorkflowLinkComponent,
  GHWorkflowLabelComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, RxZuModule.withComponents(GHWorkflowTheme)],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS, RxZuModule],
})
export class RxZuGHWorkflowTheme {}
