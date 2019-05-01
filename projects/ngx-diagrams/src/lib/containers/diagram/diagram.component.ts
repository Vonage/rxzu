import { Component, OnInit, Input } from '@angular/core';
import { DiagramModel } from '../../models/diagram.model';
import { NodeModel } from '../../models/node.model';
import { LinkModel } from '../../models/link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

@Component({
  selector: 'ngdx-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss']
})
export class NgxDiagramComponent implements OnInit {

  @Input() model: DiagramModel;
  @Input() allowCanvasZoon = true;
  @Input() inverseZoom = false;
  nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
  links$: BehaviorSubject<{ [s: string]: LinkModel }>;
  offsetX$: Observable<number>;
  offsetY$: Observable<number>;
  zoomLevel$: Observable<number>;

  constructor() {
  }

  ngOnInit() {
    if (this.model) {
      this.nodes$ = this.model.selectNodes();
      this.links$ = this.model.selectLinks();
      this.offsetX$ = this.model.getOffsetX().pipe(share());
      this.offsetY$ = this.model.getOffsetY().pipe(share());
      this.zoomLevel$ = this.model.getZoomLevel().pipe(share());
    }
  }

  onMouseDown(e: MouseEvent) {
    if (e.button === 3) { return; }
    // TODO: handle selections
    // https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L479-L536
  }

  onMouseWheel(event: WheelEvent) {
    if (this.allowCanvasZoon) {
      event.preventDefault();
      event.stopPropagation();
      const currentZoomLevel = this.model.getZoomLevel().value;
      const oldZoomFactor = currentZoomLevel / 100;
      let scrollDelta = this.inverseZoom ? -event.deltaY : event.deltaY;
      // check if it is pinch gesture
      if (event.ctrlKey && scrollDelta % 1 !== 0) {
        /*Chrome and Firefox sends wheel event with deltaY that
          have fractional part, also `ctrlKey` prop of the event is true
          though ctrl isn't pressed
        */
        scrollDelta /= 3;
      } else {
        scrollDelta /= 60;
      }
      if (currentZoomLevel + scrollDelta > 10) {
        this.model.setZoomLevel(currentZoomLevel + scrollDelta);
      }

      const zoomFactor = this.model.getZoomLevel().value / 100;

      const boundingRect = (event.currentTarget as Element).getBoundingClientRect();
      const clientWidth = boundingRect.width;
      const clientHeight = boundingRect.height;

      // compute difference between rect before and after scroll
      const widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor;
      const heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor;
      // compute mouse coords relative to canvas

      const clientX = event.clientX - boundingRect.left;
      const clientY = event.clientY - boundingRect.top;

      // compute width and height increment factor
      const xFactor = (clientX - this.model.getOffsetX().value) / oldZoomFactor / clientWidth;
      const yFactor = (clientY - this.model.getOffsetY().value) / oldZoomFactor / clientHeight;

      this.model.setOffset(
        this.model.getOffsetX().value - widthDiff * xFactor,
        this.model.getOffsetY().value - heightDiff * yFactor
      );

      // TODO: figure out on how to repaint things?
      // diagramEngine.enableRepaintEntities([]);
    }
  }

}
