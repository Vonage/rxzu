import { configure, addParameters } from '@storybook/angular';
import { create } from '@storybook/theming';

const theme = create({
  base: 'light',
	brandTitle: 'NGX-Diagrams',
  brandImage: '/icon.png'
});

addParameters({
	options: {
    showPanel: false,
    theme
	}
});

function loadStories() {
	require('../stories/index.stories.js');
	// You can require as many stories as you need.
}

configure(loadStories, module);
