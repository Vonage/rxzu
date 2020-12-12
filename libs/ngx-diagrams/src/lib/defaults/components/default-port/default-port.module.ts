import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultPortComponent } from './default-port.component';

@NgModule({
  declarations: [DefaultPortComponent],
  imports: [CommonModule],
  providers: [],
  exports: [DefaultPortComponent],
  entryComponents: [DefaultPortComponent],
})
export class DefaultPortModule {}
