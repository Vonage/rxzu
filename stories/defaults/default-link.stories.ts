import { Story, Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLinkComponent } from 'ngx-diagrams';

export default {
	title: 'Defaults/Link',
	component: DefaultLinkComponent,
	decorators: [
		moduleMetadata({
			declarations: [DefaultLinkComponent],
			imports: [CommonModule],
		}),
	],
} as Meta;

const Template: Story<DefaultLinkComponent> = (args: DefaultLinkComponent) => ({
	component: DefaultLinkComponent,
	props: args,
});

export const AdjustColor = Template.bind({});
AdjustColor.args = {
	setColor: (color: string) => {},
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {};
