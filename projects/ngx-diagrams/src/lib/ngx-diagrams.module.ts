import { NgModule } from '@angular/core';
import { NgxDiagramsComponent } from './containers/diagram/diagram.component';
import { Toolkit } from './tool-kit.service';

@NgModule({
  declarations: [NgxDiagramsComponent],
  imports: [
  ],
  providers: [
    Toolkit
  ],
  exports: [NgxDiagramsComponent]
})
export class NgxDiagramsModule { }
