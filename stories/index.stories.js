import { storiesOf, moduleMetadata } from "@storybook/angular";
import { AppComponent } from "projects/playground/src/app/app.component";
import { NgxDiagramsModule } from "ngx-diagrams";
import readme from "../README.md";

storiesOf("Examples", module)
  .addDecorator(
    moduleMetadata({
      imports: [NgxDiagramsModule]
    })
  )
  .add(
    "base",
    () => ({
      component: AppComponent
    }),
    { notes: { markdown: readme } }
  );
