import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { EventsExampleStoryComponent } from './events.component';

export default {
  title: 'Events',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [EventsExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<EventsExampleStoryComponent> = (args: any) => ({
  component: EventsExampleStoryComponent,
  props: args,
});

export const Events = template.bind({});
