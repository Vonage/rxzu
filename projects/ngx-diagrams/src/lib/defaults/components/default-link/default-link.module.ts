import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultLinkComponent } from './default-link.component';

@NgModule({
	declarations: [DefaultLinkComponent],
	imports: [CommonModule],
	providers: [],
	exports: [DefaultLinkComponent],
	entryComponents: [DefaultLinkComponent]
})
export class DefaultLinkModule {}
