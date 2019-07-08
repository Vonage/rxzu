import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent } from './default-node.component';

@NgModule({
	declarations: [DefaultNodeComponent],
	imports: [CommonModule],
	providers: [],
	exports: [],
	entryComponents: [DefaultNodeComponent]
})
export class DefaultNodeModule {}
