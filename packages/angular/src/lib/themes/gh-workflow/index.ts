import {
  ComponentProviderOptions,
  GHWorkflowNodeComponent,
  GHWorkflowPortComponent,
  GHWorkflowLinkComponent,
  GHWorkflowLabelComponent,
} from '@rxzu/angular';

export * from './components';

export const GHWorkflowTheme: ComponentProviderOptions[] = [
  {
    type: 'node',
    component: GHWorkflowNodeComponent,
  },
  {
    type: 'port',
    component: GHWorkflowPortComponent,
  },
  {
    type: 'link',
    component: GHWorkflowLinkComponent,
  },
  {
    type: 'label',
    component: GHWorkflowLabelComponent,
  },
];

export const GHWorkflowComponents = [
  GHWorkflowNodeComponent,
  GHWorkflowPortComponent,
  GHWorkflowLinkComponent,
  GHWorkflowLabelComponent,
];
