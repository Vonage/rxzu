import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule, DagrePlugin } from '@rxzu/angular';
import { AutoArrangeExampleStoryComponent } from './auto-arrange.component';

export default {
  title: 'Auto Arrange',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [AutoArrangeExampleStoryComponent],
      providers: [DagrePlugin],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<AutoArrangeExampleStoryComponent> = (args: any) => ({
  component: AutoArrangeExampleStoryComponent,
  props: args,
});

export const AutoArrange = template.bind({});
