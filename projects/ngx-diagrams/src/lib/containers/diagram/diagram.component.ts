import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngds-ngx-diagrams',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss']
})
export class NgxDiagramsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onMouseDown(e: MouseEvent) {
    if (e.button === 3) { return; }
    // TODO: handle selections
    // https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L479-L536
  }

}
