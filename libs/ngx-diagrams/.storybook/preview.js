import { setCompodocJson } from '@storybook/addon-docs/angular';
import { themes } from '@storybook/theming';
import docJson from '../documentation.json';
setCompodocJson(docJson);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: themes.dark,
  },
  options: {
    storySort: {
      order: [
        'Getting Started',
        'Node',
        'Link',
        'Port',
        'Label',
        'Actions',
        'Plugins',
        'Examples',
      ],
    },
  },
};
