import { Component, OnInit, Input, Renderer2, Output, EventEmitter } from '@angular/core';
import { DiagramModel } from '../../models/diagram.model';
import { NodeModel } from '../../models/node.model';
import { LinkModel } from '../../models/link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { BaseAction, MoveCanvasAction } from '../../actions';

@Component({
  selector: 'ngdx-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.scss']
})
export class NgxDiagramComponent implements OnInit {

  @Input() model: DiagramModel;
  @Input() allowCanvasZoon = true;
  @Input() allowCanvasTranslation = true;
  @Input() inverseZoom = true;

  @Output() actionStartedFiring: EventEmitter<BaseAction> = new EventEmitter();
  @Output() actionStillFiring: EventEmitter<BaseAction> = new EventEmitter();
  @Output() actionStoppedFiring: EventEmitter<BaseAction> = new EventEmitter();

  nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
  links$: BehaviorSubject<{ [s: string]: LinkModel }>;
  action$: BehaviorSubject<BaseAction> = new BehaviorSubject(null);
  offsetX$: Observable<number>;
  offsetY$: Observable<number>;
  zoomLevel$: Observable<number>;

  private mouseUpListener = () => { };
  private mouseMoveListener = () => { };

  constructor(private renderer: Renderer2) {
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

  /**
   * fire the action registered and notify subscribers
   */
  fireAction() {
    if (this.action$.getValue()) {
      this.actionStillFiring.emit(this.action$.getValue());
    }
  }

  /**
   * Unregister the action, post firing and notify subscribers
   */
  stopFiringAction(shouldSkipEvent?: boolean) {
    if (!shouldSkipEvent) {
      this.actionStoppedFiring.emit(this.action$.getValue());
    }
    this.action$.next(null);
  }

  /**
   * Register the new action, pre firing and notify subscribers
   */
  startFiringAction(action: BaseAction) {
    this.action$.next(action);
    this.actionStartedFiring.emit(action);
  }

  onMouseUp = (event: MouseEvent) => {

    this.mouseUpListener();
    this.mouseMoveListener();
  }

  onMouseMove = (event: MouseEvent) => {
    const action = this.action$.getValue();

    if (action instanceof MoveCanvasAction) {
      if (this.allowCanvasTranslation) {
        this.model.setOffset(
          action.initialOffsetX + (event.clientX - action.mouseX),
          action.initialOffsetY + (event.clientY - action.mouseY)
        );
        this.fireAction();
      }
    }
  }

  getMouseElement(event: MouseEvent): { model: any, element: Element } {
    // iterate over all possible models
    // port, point, link, node and return it and the element
    // else return null.

    return null;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button === 3) { return; }
    // TODO: handle selections
    // https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L479-L536

    const selectedModel = this.getMouseElement(event);

    // canvas selected
    if (selectedModel === null) {
      // multiple selection
      if (event.shiftKey) {
        // initiate multiple selection selector
      } else {
        this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, this.model));
      }
    } else {

    }

    // create moveMove and mouseUp listeners
    this.mouseMoveListener = this.renderer.listen(document, 'mousemove', this.onMouseMove);
    this.mouseUpListener = this.renderer.listen(document, 'mouseup', this.onMouseUp);
  }

  onMouseWheel(event: WheelEvent) {
    if (this.allowCanvasZoon) {
      event.preventDefault();
      event.stopPropagation();
      const currentZoomLevel = this.model.getZoomLevel().getValue();
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

      const zoomFactor = this.model.getZoomLevel().getValue() / 100;

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
      const xFactor = (clientX - this.model.getOffsetX().getValue()) / oldZoomFactor / clientWidth;
      const yFactor = (clientY - this.model.getOffsetY().getValue()) / oldZoomFactor / clientHeight;

      this.model.setOffset(
        this.model.getOffsetX().getValue() - widthDiff * xFactor,
        this.model.getOffsetY().getValue() - heightDiff * yFactor
      );

      // TODO: figure out on how to repaint things?
      // diagramEngine.enableRepaintEntities([]);
    }
  }

}
