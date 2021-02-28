import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLinkTemplate, CustomLinkTemplate } from './label.template';
import { DefaultLabelStoryComponent } from './default/default.component';
import { CustomLabelComponent } from './custom/custom-label.component';
import { DefaultLinkComponent, RxZuDefaultsModule, RxZuModule } from '@rxzu/angular';

export default {
  title: 'Label',
  component: DefaultLinkComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [
        CustomLabelComponent,
        DefaultLabelStoryComponent
      ],
      imports: [CommonModule, RxZuDefaultsModule],
      providers: [ RxZuModule.registerComponent({ comp: CustomLabelComponent, entityType: 'label', type: 'custom' })],
      entryComponents: [
        CustomLabelComponent
      ]
    })
  ]
} as Meta;

export const Default = DefaultLinkTemplate.bind({});

export const Custom = CustomLinkTemplate.bind({});
