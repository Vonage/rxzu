import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxDiagramsModule } from 'ngx-diagrams';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxDiagramsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
