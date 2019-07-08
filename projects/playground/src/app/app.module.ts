import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MarkdownWrapperComponent } from './components/markdown-wrapper/markdown-wrapper.component';
import { NgxDiagramsModule, DefaultPortModule, DefaultNodeModule, DefaultLinkModule, DefaultLabelModule } from 'ngx-diagrams';

@NgModule({
	declarations: [AppComponent, MarkdownWrapperComponent],
	imports: [BrowserModule, NgxDiagramsModule, DefaultPortModule, DefaultNodeModule, DefaultLinkModule, DefaultLabelModule],
	providers: [],
	bootstrap: [AppComponent],
	entryComponents: []
})
export class AppModule {}
