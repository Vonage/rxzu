import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultLinkTemplate, CustomLinkTemplate } from './link.template';
import { CustomLinkComponent } from './custom/custom-link.component';
import { DefaultLinkComponent, RxZuDefaultsModule, RxZuModule } from '@rxzu/angular';
import { DefaultLinkStoryComponent } from './default/default.component';
import { CustomLinkDiagramComponent } from './custom/diagram.component';

export default {
  title: 'Link',
  component: DefaultLinkComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [CustomLinkComponent, DefaultLinkStoryComponent, CustomLinkDiagramComponent],
      imports: [CommonModule, RxZuDefaultsModule],
      providers: [RxZuModule.registerComponent({ name: 'custom', type: 'link', component: CustomLinkComponent })],
      entryComponents: [CustomLinkComponent]
    })
  ]
} as Meta;

export const Default = DefaultLinkTemplate.bind({});

export const Custom = CustomLinkTemplate.bind({});
