import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultLabelComponent } from './default-label.component';

@NgModule({
	declarations: [DefaultLabelComponent],
	imports: [CommonModule],
	providers: [],
	exports: [],
	entryComponents: [DefaultLabelComponent]
})
export class DefaultLabelModule {}
