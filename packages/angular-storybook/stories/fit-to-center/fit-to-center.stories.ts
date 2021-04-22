import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule, DagrePlugin } from '@rxzu/angular';
import { FitToCenterStoryComponent } from './fit-to-center.component';

export default {
  title: 'Fit To Center',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [FitToCenterStoryComponent],
      providers: [DagrePlugin],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<FitToCenterStoryComponent> = (args: any) => ({
  component: FitToCenterStoryComponent,
  props: args,
});

export const FitToCenter = template.bind({});
