import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLabelComponent, DefaultLinkComponent, DefaultNodeComponent, DefaultPortComponent, NgxDiagramsModule } from 'ngx-diagrams';
import { DefaultLinkTemplate, CustomLinkTemplate } from './link.template';
import { DefaultLinkStoryComponent } from './default/default.component';
import { CustomLinkComponent } from './custom/custom-link.component';

export default {
	title: 'Link',
	component: DefaultLinkComponent,
	parameters: { docs: { iframeHeight: '400px' } },
	decorators: [
		moduleMetadata({
			declarations: [
				DefaultNodeComponent,
				CustomLinkComponent,
				DefaultLinkStoryComponent,
				DefaultLinkComponent,
				DefaultLabelComponent,
				DefaultPortComponent,
			],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, CustomLinkComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const Default = DefaultLinkTemplate.bind({});

export const Custom = CustomLinkTemplate.bind({});
