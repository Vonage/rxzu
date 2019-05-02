import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxDiagramsModule } from 'ngx-diagrams';
import { DefaultNodeComponent } from 'projects/ngx-diagrams/src/lib/defaults/widgets/node/node.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxDiagramsModule
  ],
  providers: [],
  entryComponents: [DefaultNodeComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
