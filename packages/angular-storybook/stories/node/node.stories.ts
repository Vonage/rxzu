import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultNodeTemplate, CustomNodeTemplate } from './node.template';
import { CustomNodeComponent } from './custom/custom.component';
import { DefaultNodeComponent, RxZuDefaultsModule, RxZuModule } from '@rxzu/angular';
import { DefaultNodeStoryComponent } from './default/default.component';
import { CustomNodeDiagramComponent } from './custom/diagram.component';

export default {
  title: 'Node',
  component: DefaultNodeComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [CustomNodeComponent, DefaultNodeStoryComponent, CustomNodeDiagramComponent],
      imports: [CommonModule, RxZuDefaultsModule],
      providers: [RxZuModule.registerComponent({ entityType: 'node', type: 'custom', comp: CustomNodeComponent })],
      entryComponents: [CustomNodeComponent]
    })
  ]
} as Meta;

export const Default = DefaultNodeTemplate.bind({});

export const Custom = CustomNodeTemplate.bind({});

Custom.args = {
  nodeHeight: 200,
  nodeWidth: 200
};
