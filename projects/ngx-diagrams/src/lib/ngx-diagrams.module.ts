import { NgModule } from '@angular/core';
import { NgxDiagramComponent } from './containers/diagram/diagram.component';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent } from './defaults/components/default-node/default-node.component';
import { DefaultPortComponent } from './defaults/components/default-port/default-port.component';

@NgModule({
	declarations: [NgxDiagramComponent, DefaultNodeComponent, DefaultPortComponent],
	imports: [CommonModule],
	providers: [],
	exports: [NgxDiagramComponent],
	entryComponents: [DefaultNodeComponent, DefaultPortComponent]
})
export class NgxDiagramsModule {}
