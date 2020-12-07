import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDiagramComponent } from './containers/diagram/diagram.component';
import { TemplateVarDirective } from './utils/template-var.directive';

@NgModule({
	declarations: [NgxDiagramComponent, TemplateVarDirective],
	imports: [CommonModule],
	exports: [NgxDiagramComponent],
})
export class NgxDiagramsModule {}
