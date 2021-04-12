import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  ComponentProviderOptions,
  DefaultLabelComponent,
  DefaultLinkComponent,
  DefaultNodeComponent,
  DefaultPortComponent,
  RxZuModule,
} from '@rxzu/angular';

import { AppComponent } from './app.component';

const DEFAULTS: ComponentProviderOptions[] = [
  {
    type: 'node',
    component: DefaultNodeComponent,
  },
  {
    type: 'port',
    component: DefaultPortComponent,
  },
  {
    type: 'link',
    component: DefaultLinkComponent,
  },
  {
    type: 'label',
    component: DefaultLabelComponent,
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CommonModule, RxZuModule.withComponents(DEFAULTS)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
