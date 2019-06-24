import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MarkdownWrapperComponent } from './components/markdown-wrapper/markdown-wrapper.component';
import { NgxDiagramsModule } from 'dist/ngx-diagrams';

@NgModule({
	declarations: [AppComponent, MarkdownWrapperComponent],
	imports: [BrowserModule, NgxDiagramsModule],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
