import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MarkdownWrapperComponent } from './components/markdown-wrapper/markdown-wrapper.component';
import { NgxDiagramsModule, DefaultPortComponent, DefaultLinkComponent, DefaultNodeComponent } from 'ngx-diagrams';
import { DefaultLabelComponent } from 'projects/ngx-diagrams/src/lib/defaults/components/default-label/default-label.component';

@NgModule({
	declarations: [
		AppComponent,
		MarkdownWrapperComponent,
		DefaultLinkComponent,
		DefaultNodeComponent,
		DefaultPortComponent,
		DefaultLabelComponent
	],
	imports: [BrowserModule, NgxDiagramsModule],
	providers: [],
	bootstrap: [AppComponent],
	entryComponents: [DefaultLinkComponent, DefaultNodeComponent, DefaultPortComponent, DefaultLabelComponent]
})
export class AppModule {}
