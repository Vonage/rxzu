import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLabelComponent, DefaultLinkComponent, DefaultNodeComponent, DefaultPortComponent, NgxDiagramsModule } from 'ngx-diagrams';
import { DefaultLinkTemplate, CustomLinkTemplate } from './label.template';
import { DefaultLabelStoryComponent } from './default/default.component';
import { CustomLabelComponent } from './custom/custom-label.component';

export default {
	title: 'Label',
	component: DefaultLinkComponent,
	parameters: { docs: { iframeHeight: '400px' } },
	decorators: [
		moduleMetadata({
			declarations: [
				DefaultNodeComponent,
				CustomLabelComponent,
				DefaultLabelStoryComponent,
				DefaultLinkComponent,
				DefaultLabelComponent,
				DefaultPortComponent,
			],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, CustomLabelComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const Default = DefaultLinkTemplate.bind({});

export const Custom = CustomLinkTemplate.bind({});
