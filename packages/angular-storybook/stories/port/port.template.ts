import { Story } from '@storybook/angular';
import { CustomPortDiagramComponent } from './custom/diagram.component';
import { DefaultPortComponent } from './default/default.component';

export const DefaultNodeTemplate: Story<DefaultPortComponent> = (
  args: any
) => ({
  component: DefaultPortComponent,
  props: args,
});

export const CustomNodeTemplate: Story<CustomPortDiagramComponent> = (
  args: any
) => ({
  component: CustomPortDiagramComponent,
  props: args,
});
