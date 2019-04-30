import { NgModule } from '@angular/core';
import { NgxDiagramComponent } from './containers/diagram/diagram.component';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent } from './defaults/widgets/node/node.component';

@NgModule({
  declarations: [NgxDiagramComponent, DefaultNodeComponent],
  imports: [
    CommonModule
  ],
  providers: [
  ],
  exports: [NgxDiagramComponent]
})
export class NgxDiagramsModule { }
