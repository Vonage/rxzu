import { Component, OnInit } from '@angular/core';
import { DiagramModel } from 'projects/ngx-diagrams/src/lib/models/diagram.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'playground';
  diagramModel = new DiagramModel();

  constructor() { }

  ngOnInit() {
    const newNode = this.diagramModel.addNode('test', 200, 300);
  }
}
