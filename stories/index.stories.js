import { storiesOf, moduleMetadata } from "@storybook/angular";
import { AppComponent } from "projects/playground/src/app/app.component";
import { MarkdownWrapperComponent } from "projects/playground/src/app/components/markdown-wrapper/markdown-wrapper.component";
import { NgxDiagramsModule } from "ngx-diagrams";
import readme from "../README.md";
import { MarkdownModule } from "ngx-markdown/esm5/src/markdown.module";

storiesOf("Docs", module)
  .addDecorator(
    moduleMetadata({
      imports: [MarkdownModule.forRoot()]
    })
  )
  .add("welcome", () => ({
    component: MarkdownWrapperComponent,
    props: {
      rawMarkdown: readme
    }
  }));

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
    })
    // ,
    // { notes: { markdown: readme } }
  );
