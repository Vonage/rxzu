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
        'Zoom To Fit',
        'Zoom To Node',
        'Auto Arrange',
        'Drag And Drop',
        'Dynamic Ports',
        'Performance',
        'Layout Animation',
        'Actions',
        'Themes',
        'Changelog',
      ],
    },
  },
};
