import { Story } from '@storybook/angular';
import { TemplateDiagramComponent } from './template.component';

export const DiagramTemplate: Story<TemplateDiagramComponent> = (args: TemplateDiagramComponent) => ({
	component: TemplateDiagramComponent,
	props: args,
});
