import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RxZuDefaultsModule } from '@rxzu/angular';
import { DragAndDropExampleStoryComponent } from './drag-and-drop.component';

export default {
  title: 'Drag And Drop',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [DragAndDropExampleStoryComponent],
      providers: [],
      imports: [CommonModule, RxZuDefaultsModule],
    }),
  ],
} as Meta;

const template: Story<DragAndDropExampleStoryComponent> = (args: any) => ({
  component: DragAndDropExampleStoryComponent,
  props: args,
});

export const DragAndDrop = template.bind({});
