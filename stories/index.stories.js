import { storiesOf, moduleMetadata } from "@storybook/angular";
import { AppComponent } from "projects/playground/src/app/app.component";
import { NgxDiagramsModule } from "ngx-diagrams";
import readme from "../README.md";

storiesOf("ngx diagrams", module)
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
