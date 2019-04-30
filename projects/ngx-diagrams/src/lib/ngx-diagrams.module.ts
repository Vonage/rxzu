import { NgModule } from '@angular/core';
import { NgxDiagramsComponent } from './containers/diagram/diagram.component';
import { CommonModule } from '@angular/common';
import { DefaultNodeComponent } from './defaults/widgets/node/node.component';

@NgModule({
  declarations: [NgxDiagramsComponent, DefaultNodeComponent],
  imports: [
    CommonModule
  ],
  providers: [
  ],
  exports: [NgxDiagramsComponent]
})
export class NgxDiagramsModule { }
