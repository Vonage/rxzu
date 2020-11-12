import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import {
	DagreEngine,
	DefaultLabelComponent,
	DefaultLinkComponent,
	DefaultNodeComponent,
	DefaultPortComponent,
	NgxDiagramsModule,
} from 'ngx-diagrams';
import { AutoArrangeDiagramTemplate, BasicDiagramTemplate, SerializationDiagramTemplate } from './examples.template';
import { BasicExampleStoryComponent } from './basic/basic.component';
import { SerializationExampleStoryComponent } from './serialization/serialization.component';
import { AutoArrangeExampleStoryComponent } from './auto-arrange/auto-arrange.component';

export default {
	title: 'Examples',
	component: DefaultLinkComponent,
	parameters: { docs: { iframeHeight: '400px' } },
	decorators: [
		moduleMetadata({
			declarations: [
				DefaultNodeComponent,
				BasicExampleStoryComponent,
				SerializationExampleStoryComponent,
				AutoArrangeExampleStoryComponent,
				DefaultLinkComponent,
				DefaultLabelComponent,
				DefaultPortComponent,
			],
			providers: [DagreEngine],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const Basic = BasicDiagramTemplate.bind({});

export const Serialization = SerializationDiagramTemplate.bind({});

export const AutoArrange = AutoArrangeDiagramTemplate.bind({});
