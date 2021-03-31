import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RxZuDefaultsModule } from '@rxzu/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CommonModule, RxZuDefaultsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
