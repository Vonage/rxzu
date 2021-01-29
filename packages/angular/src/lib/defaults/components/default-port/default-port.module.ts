import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DefaultPortComponent } from './default-port.component';

@NgModule({
  declarations: [DefaultPortComponent],
  imports: [CommonModule],
  exports: [DefaultPortComponent],
  entryComponents: [DefaultPortComponent],
})
export class DefaultPortModule {}
