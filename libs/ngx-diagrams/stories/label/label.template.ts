import { Story } from '@storybook/angular';
import { CustomLabelDiagramComponent } from './custom/diagram.component';
import { DefaultLabelStoryComponent } from './default/default.component';

export const DefaultLinkTemplate: Story<DefaultLabelStoryComponent> = (
  args: any
) => ({
  component: DefaultLabelStoryComponent,
  props: args,
});

export const CustomLinkTemplate: Story<CustomLabelDiagramComponent> = (
  args: any
) => ({
  component: CustomLabelDiagramComponent,
  props: args,
});
