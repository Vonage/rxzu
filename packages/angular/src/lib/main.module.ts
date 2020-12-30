import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RxZuDiagramComponent } from './containers/diagram/diagram.component';
import { TemplateVarDirective } from './utils/template-var.directive';

@NgModule({
  declarations: [RxZuDiagramComponent, TemplateVarDirective],
  imports: [CommonModule],
  exports: [RxZuDiagramComponent]
})
export class RxZuDiagramsModule {}
