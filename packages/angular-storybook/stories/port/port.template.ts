import { Story } from '@storybook/angular';
import { CustomPortDiagramComponent } from './custom/diagram.component';
import { DefaultPortStoryComponent } from './default/default.component';

export const DefaultPortTemplate: Story<DefaultPortStoryComponent> = (
  args: any
) => ({
  component: DefaultPortStoryComponent,
  props: args,
});

export const CustomPortTemplate: Story<CustomPortDiagramComponent> = (
  args: any
) => ({
  component: CustomPortDiagramComponent,
  props: args,
});
