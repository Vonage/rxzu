import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/angular';
import { AutoArrangeExampleStoryComponent } from './auto-arrange/auto-arrange.component';
import { BasicExampleStoryComponent } from './basic/basic.component';
import { DragAndDropExampleStoryComponent } from './drag-and-drop/drag-and-drop.component';
import { DynamicPortsExampleStoryComponent } from './dynamic-ports/dynamic-ports.component';
import { EventsExampleStoryComponent } from './events/events.component';
import { PerformanceExampleStoryComponent } from './performance/performance.component';
import { ZoomToFitExampleStoryComponent } from './zoom-to-fit/zoom-to-fit.component';
import { ZoomToNodeExampleStoryComponent} from './zoom-to-node/zoom-to-node.component';

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

export const DynamicPortsDiagramTemplate: Story<DynamicPortsExampleStoryComponent> = (
  args: any
) => ({
  component: DynamicPortsExampleStoryComponent,
  props: args,
});

export const DragAndDropDiagramTemplate: Story<DragAndDropExampleStoryComponent> = (
  args: any
) => ({
  component: DragAndDropExampleStoryComponent,
  props: args,
});

export const ZoomToFitDiagramTemplate: Story<ZoomToFitExampleStoryComponent> = (
  args: any
) => ({
  component: ZoomToFitExampleStoryComponent,
  props: args,
});

export const ZoomToNodeDiagramTemplate: Story<ZoomToNodeExampleStoryComponent> = (
  args: any
) => ({
  component: ZoomToNodeExampleStoryComponent,
  props: args,
});

