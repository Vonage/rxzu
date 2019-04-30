import { Component, OnInit, Input } from '@angular/core';
import { DiagramModel } from '../../models/diagram.model';
import { NodeModel } from '../../models/node.model';
import { BehaviorSubject } from 'rxjs';
import { LinkModel } from '../../models/link.model';

@Component({
  selector: 'ngdx-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss']
})
export class NgxDiagramComponent implements OnInit {

  @Input() model: DiagramModel;
  @Input() allowCanvasZoon = true;
  nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
  links$: BehaviorSubject<{ [s: string]: LinkModel }>;

  constructor() {
  }

  ngOnInit() {
    if (this.model) {
      this.nodes$ = this.model.selectNodes();
      this.links$ = this.model.selectLinks();
    }
  }

  onMouseDown(e: MouseEvent) {
    if (e.button === 3) { return; }
    // TODO: handle selections
    // https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L479-L536
  }

  onMouseWheel(e: MouseEvent) {
    if (this.allowCanvasZoon) {
      e.preventDefault();
      e.stopPropagation();

    }
  }

}
