import { NgModule } from '@angular/core';
import { NgxDiagramComponent } from './containers/diagram/diagram.component';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent } from './defaults/components/default-node/default-node.component';
import { PortComponent } from './defaults/components/default-port/default-port.component';

@NgModule({
	declarations: [NgxDiagramComponent, DefaultNodeComponent, PortComponent],
	imports: [CommonModule],
	providers: [],
	exports: [NgxDiagramComponent]
})
export class NgxDiagramsModule {}
