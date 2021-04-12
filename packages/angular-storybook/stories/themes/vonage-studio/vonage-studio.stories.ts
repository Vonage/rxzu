import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { VStudioExampleStoryComponent } from './vonage-studio.component';
import { RxZuVStudioTheme } from './vonage-studio.module';

export default {
  title: 'Themes/Vonage Studio',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [VStudioExampleStoryComponent],
      imports: [CommonModule, RxZuVStudioTheme],
    }),
  ],
} as Meta;

const template: Story<VStudioExampleStoryComponent> = (args: any) => ({
  component: VStudioExampleStoryComponent,
  props: args,
});

export const VonageStudio = template.bind({});
