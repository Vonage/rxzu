import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxDiagramsModule } from 'ngx-diagrams';
import { MarkdownWrapperComponent } from './components/markdown-wrapper/markdown-wrapper.component';

@NgModule({
	declarations: [AppComponent, MarkdownWrapperComponent],
	imports: [BrowserModule, NgxDiagramsModule],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
