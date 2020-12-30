import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultNodeTemplate, CustomNodeTemplate } from './port.template';
import { CustomPortComponent } from './custom/custom.component';
import {
  DefaultNodeComponent,
  DefaultLinkComponent,
  DefaultLabelComponent,
  DefaultPortComponent,
  RxZuDiagramsModule
} from '@rxzu/angular';

export default {
  title: 'Port',
  component: DefaultNodeComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [
        DefaultNodeComponent,
        CustomPortComponent,
        DefaultLinkComponent,
        DefaultLabelComponent,
        DefaultPortComponent
      ],
      imports: [CommonModule, RxZuDiagramsModule],
      entryComponents: [
        DefaultNodeComponent,
        DefaultLinkComponent,
        CustomPortComponent,
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
