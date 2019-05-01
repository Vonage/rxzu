import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxDiagramsModule } from 'ngx-diagrams';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxDiagramsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
