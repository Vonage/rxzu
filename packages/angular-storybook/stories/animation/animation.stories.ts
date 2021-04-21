import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule, DagrePlugin } from '@rxzu/angular';
import { AnimationStoryComponent } from './animation.component';

export default {
  title: 'Layout Animation',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [AnimationStoryComponent],
      providers: [DagrePlugin],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<AnimationStoryComponent> = (args: any) => ({
  component: AnimationStoryComponent,
  props: args,
});

export const LayoutAnimation = template.bind({});
