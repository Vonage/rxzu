import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { DynamicPortsExampleStoryComponent } from './dynamic-ports.component';

export default {
  title: 'Dynamic Ports',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [DynamicPortsExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<DynamicPortsExampleStoryComponent> = (args: any) => ({
  component: DynamicPortsExampleStoryComponent,
  props: args,
});

export const DynamicPorts = template.bind({});
