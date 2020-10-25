import { Story } from '@storybook/angular';
import { CustomLinkDiagramComponent } from './custom/diagram.component';
import { DefaultLinkStoryComponent } from './default/default.component';

export const DefaultLinkTemplate: Story<DefaultLinkStoryComponent> = (args: any) => ({
	component: DefaultLinkStoryComponent,
	props: args,
});

export const CustomLinkTemplate: Story<CustomLinkDiagramComponent> = (args: any) => ({
	component: CustomLinkDiagramComponent,
	props: args,
});
