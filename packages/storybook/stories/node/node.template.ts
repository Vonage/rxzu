import { Story } from '@storybook/angular';
import { CustomNodeDiagramComponent } from './custom/diagram.component';
import { DefaultNodeComponent } from './default/default.component';

export const DefaultNodeTemplate: Story<DefaultNodeComponent> = (
  args: any
) => ({
  component: DefaultNodeComponent,
  props: args,
});

export const CustomNodeTemplate: Story<CustomNodeDiagramComponent> = (
  args: any
) => ({
  component: CustomNodeDiagramComponent,
  props: args,
});
