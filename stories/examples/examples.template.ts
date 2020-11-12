import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/angular';
import { BasicExampleStoryComponent } from './basic/basic.component';
import { SerializationExampleStoryComponent } from './serialization/serialization.component';

export const BasicDiagramTemplate: Story<BasicExampleStoryComponent> = (args: any) => ({
	component: BasicExampleStoryComponent,
	props: args,
});

export const SerializationDiagramTemplate: Story<SerializationExampleStoryComponent> = (args: any) => ({
	component: SerializationExampleStoryComponent,
	props: { ...args, serialized: action('serialized') },
});
