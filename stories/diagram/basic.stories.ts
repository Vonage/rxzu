import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DiagramTemplate } from './template/template';
import {
	DefaultLabelComponent,
	DefaultLinkComponent,
	DefaultNodeComponent,
	DefaultPortComponent,
	NgxDiagramComponent,
	NgxDiagramsModule,
} from 'ngx-diagrams';

export default {
	title: 'Diagram/Basic',
	component: NgxDiagramComponent,
	decorators: [
		moduleMetadata({
			declarations: [DefaultNodeComponent, DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const AdjustNodeSize = DiagramTemplate.bind({});

AdjustNodeSize.args = {
	nodeHeight: 200,
	nodeWidth: 200,
};
