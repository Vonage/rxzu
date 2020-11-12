import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLabelComponent, DefaultLinkComponent, DefaultNodeComponent, DefaultPortComponent, NgxDiagramsModule } from 'ngx-diagrams';
import { BasicDiagramTemplate, SerializationDiagramTemplate } from './examples.template';
import { BasicExampleStoryComponent } from './basic/basic.component';
import { SerializationExampleStoryComponent } from './serialization/serialization.component';

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
				DefaultLinkComponent,
				DefaultLabelComponent,
				DefaultPortComponent,
			],
			imports: [CommonModule, NgxDiagramsModule],
			entryComponents: [DefaultNodeComponent, DefaultLinkComponent, DefaultLabelComponent, DefaultPortComponent],
		}),
	],
} as Meta;

export const Basic = BasicDiagramTemplate.bind({});

export const Serialization = SerializationDiagramTemplate.bind({});
