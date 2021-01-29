import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultNodeTemplate, CustomNodeTemplate } from './node.template';
import { CustomNodeComponent } from './custom/custom.component';
import {
  DefaultNodeComponent,
  DefaultLinkComponent,
  DefaultLabelComponent,
  DefaultPortComponent,
  RxZuDiagramsModule
} from '@rxzu/angular';

export default {
  title: 'Node',
  component: DefaultNodeComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [
        DefaultNodeComponent,
        CustomNodeComponent,
        DefaultLinkComponent,
        DefaultLabelComponent,
        DefaultPortComponent
      ],
      imports: [CommonModule, RxZuDiagramsModule],
      entryComponents: [
        DefaultNodeComponent,
        DefaultLinkComponent,
        CustomNodeComponent,
        DefaultLabelComponent,
        DefaultPortComponent
      ]
    })
  ]
} as Meta;

export const Default = DefaultNodeTemplate.bind({});

export const Custom = CustomNodeTemplate.bind({});

Custom.args = {
  nodeHeight: 200,
  nodeWidth: 200
};
