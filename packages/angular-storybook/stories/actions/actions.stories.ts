import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { ActionsExampleStoryComponent } from './actions.component';

export default {
  title: 'Actions',
  parameters: { docs: { iframeHeight: '400px' } },
  argTypes: { events: { action: 'actions' } },
  decorators: [
    moduleMetadata({
      declarations: [ActionsExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<ActionsExampleStoryComponent> = (args: any) => ({
  component: ActionsExampleStoryComponent,
  props: args,
});

export const Actions = template.bind({});
