import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GHWorkflowComponents, GHWorkflowTheme } from '.';
import { RxZuModule } from '../../main.module';

@NgModule({
  declarations: [...GHWorkflowComponents],
  imports: [CommonModule, RxZuModule.withComponents(GHWorkflowTheme)],
  entryComponents: [...GHWorkflowComponents],
  exports: [...GHWorkflowComponents, RxZuModule],
})
export class RxZuGhWorkflowTheme {}
