import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MarkdownWrapperComponent } from './components/markdown-wrapper/markdown-wrapper.component';
import { NgxDiagramsModule, DefaultPortModule, DefaultNodeModule, DefaultLinkModule, DefaultLabelModule, DagreEngine } from 'ngx-diagrams';
import { CommonModule } from '@angular/common';
import { CustomLinkComponent } from './components/custom-link/custom-link.component';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
	declarations: [AppComponent, CustomLinkComponent, MarkdownWrapperComponent],
	imports: [
		CommonModule,
		BrowserModule,
		NgxDiagramsModule,
		DefaultPortModule,
		DefaultNodeModule,
		DefaultLinkModule,
		DefaultLabelModule,
		MarkdownModule.forRoot()
	],
	providers: [DagreEngine],
	bootstrap: [AppComponent],
	entryComponents: [CustomLinkComponent]
})
export class AppModule {}
