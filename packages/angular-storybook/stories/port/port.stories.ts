import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DefaultPortTemplate, CustomPortTemplate } from './port.template';
import { CustomPortComponent } from './custom/custom.component';
import {
  DefaultPortComponent,
  RxZuDefaultsModule, RxZuModule
} from '@rxzu/angular';
import { DefaultPortStoryComponent } from './default/default.component';
import { CustomPortDiagramComponent } from './custom/diagram.component';

export default {
  title: 'Port',
  component: DefaultPortComponent,
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [CustomPortComponent, DefaultPortStoryComponent, CustomPortDiagramComponent],
      imports: [RxZuDefaultsModule],
      providers: [RxZuModule.registerComponent({ name: 'port', name: 'custom', component: CustomPortComponent})],
      entryComponents: [CustomPortComponent],
    }),
  ],
} as Meta;

export const Default = DefaultPortTemplate.bind({});

export const Custom = CustomPortTemplate.bind({});
