import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { PerformanceExampleStoryComponent } from './performance.component';

export default {
  title: 'Performance',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [PerformanceExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<PerformanceExampleStoryComponent> = (args: any) => ({
  component: PerformanceExampleStoryComponent,
  props: args,
});

export const Performance = template.bind({});
