import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule, DagrePlugin } from '@rxzu/angular';
import { ZoomToFitExampleStoryComponent } from './zoom-to-fit.component';

export default {
  title: 'Zoom To Fit',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [ZoomToFitExampleStoryComponent],
      providers: [DagrePlugin],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<ZoomToFitExampleStoryComponent> = (args: any) => ({
  component: ZoomToFitExampleStoryComponent,
  props: args,
});

export const ZoomToFit = template.bind({});
