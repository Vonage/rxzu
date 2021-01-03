import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/angular';
import { AutoArrangeExampleStoryComponent } from './auto-arrange/auto-arrange.component';
import { BasicExampleStoryComponent } from './basic/basic.component';
import { EventsExampleStoryComponent } from './events/events.component';
import { PerformanceExampleStoryComponent } from './performance/performance.component';
import { SerializationExampleStoryComponent } from './serialization/serialization.component';

export const BasicDiagramTemplate: Story<BasicExampleStoryComponent> = (
  args: any
) => ({
  component: BasicExampleStoryComponent,
  props: args,
});

export const EventsDiagramTemplate: Story<EventsExampleStoryComponent> = (
  args: any
) => ({
  component: EventsExampleStoryComponent,
  props: { ...args, events: action('events') },
});

export const SerializationDiagramTemplate: Story<SerializationExampleStoryComponent> = (
  args: any
) => ({
  component: SerializationExampleStoryComponent,
  props: { ...args, serialized: action('serialized') },
});

export const AutoArrangeDiagramTemplate: Story<AutoArrangeExampleStoryComponent> = (
  args: any
) => ({
  component: AutoArrangeExampleStoryComponent,
  props: args,
});

export const PerformanceDiagramTemplate: Story<PerformanceExampleStoryComponent> = (
  args: any
) => ({
  component: PerformanceExampleStoryComponent,
  props: args,
});