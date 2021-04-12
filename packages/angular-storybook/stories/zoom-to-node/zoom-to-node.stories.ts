import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { ZoomToNodeExampleStoryComponent } from './zoom-to-node.component';

export default {
  title: 'Zoom To Node',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [ZoomToNodeExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<ZoomToNodeExampleStoryComponent> = (args: any) => ({
  component: ZoomToNodeExampleStoryComponent,
  props: args,
});

export const ZoomToNode = template.bind({});
