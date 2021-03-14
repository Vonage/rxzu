import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { GHWorkfflowExampleStoryComponent } from './gh-workflow.component';
import { RxZuGHWorkflowTheme } from '@rxzu/angular';

export default {
  title: 'Themes/Github Workflow',
  parameters: { docs: { iframeHeight: '400px' } },
  decorators: [
    moduleMetadata({
      declarations: [GHWorkfflowExampleStoryComponent],
      imports: [CommonModule, RxZuGHWorkflowTheme],
    }),
  ],
} as Meta;

const template: Story<GHWorkfflowExampleStoryComponent> = (args: any) => ({
  component: GHWorkfflowExampleStoryComponent,
  props: args,
});

export const GithubWorkflow = template.bind({});
