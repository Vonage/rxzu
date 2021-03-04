import { Story } from '@storybook/angular';
import { CustomNodeDiagramComponent } from './custom/diagram.component';
import { DefaultNodeStoryComponent } from './default/default.component';

export const DefaultNodeTemplate: Story<DefaultNodeStoryComponent> = (
  args: any
) => ({
  component: DefaultNodeStoryComponent,
  props: args,
});

export const CustomNodeTemplate: Story<CustomNodeDiagramComponent> = (
  args: any
) => ({
  component: CustomNodeDiagramComponent,
  props: args,
});
