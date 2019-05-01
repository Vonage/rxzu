import { configure, addParameters } from "@storybook/angular";

addParameters({
  options: {
    panelPosition: "right"
  }
});

function loadStories() {
  require("../stories/index.stories.js");
  // You can require as many stories as you need.
}

configure(loadStories, module);
