import { NgModule } from '@angular/core';
import { NgxDiagramComponent } from './containers/diagram/diagram.component';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent, DefaultLinkComponent, DefaultPortComponent, DefaultLabelComponent } from './defaults';

@NgModule({
	declarations: [NgxDiagramComponent, DefaultLabelComponent, DefaultNodeComponent, DefaultLinkComponent, DefaultPortComponent],
	imports: [CommonModule],
	providers: [],
	exports: [NgxDiagramComponent],
	entryComponents: [DefaultNodeComponent, DefaultLinkComponent, DefaultPortComponent, DefaultLabelComponent]
})
export class NgxDiagramsModule {}
