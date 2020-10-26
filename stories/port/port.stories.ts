import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLabelComponent, DefaultLinkComponent, DefaultNodeComponent, DefaultPortComponent, NgxDiagramsModule } from 'ngx-diagrams';
import { DefaultNodeTemplate, CustomNodeTemplate } from './port.template';
import { CustomPortComponent } from './custom/custom.component';

export default {
	title: 'Port',
	component: DefaultNodeComponent,
	parameters: { docs: { iframeHeight: '400px' } },
	decorators: [
		moduleMetadata({
			declarations: [DefaultNodeComponent, CustomPortComponent, DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, CustomPortComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const Default = DefaultNodeTemplate.bind({});

export const Custom = CustomNodeTemplate.bind({});

Custom.args = {
	nodeHeight: 200,
	nodeWidth: 200,
};
