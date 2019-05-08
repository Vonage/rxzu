import { Component, OnInit, Input, Renderer2, Output, EventEmitter, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { DiagramModel } from '../../models/diagram.model';
import { NodeModel } from '../../models/node.model';
import { LinkModel } from '../../models/link.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { BaseAction, MoveCanvasAction } from '../../actions';
import { BaseModel } from '../../models/base.model';

@Component({
	selector: 'ngdx-diagram',
	templateUrl: 'diagram.component.html',
	styleUrls: ['diagram.component.scss']
})
export class NgxDiagramComponent implements OnInit {
	// tslint:disable-next-line:no-input-rename
	@Input('model') diagramModel: DiagramModel;
	@Input() allowCanvasZoon = true;
	@Input() allowCanvasTranslation = true;
	@Input() inverseZoom = true;

	@Output() actionStartedFiring: EventEmitter<BaseAction> = new EventEmitter();
	@Output() actionStillFiring: EventEmitter<BaseAction> = new EventEmitter();
	@Output() actionStoppedFiring: EventEmitter<BaseAction> = new EventEmitter();

	@ViewChild('nodesLayer', { read: ViewContainerRef }) nodesLayer: ViewContainerRef;
	@ViewChild('linksLayer', { read: ViewContainerRef }) linksLayer: ViewContainerRef;
	@ViewChild('canvas', { read: ElementRef }) canvas: ElementRef;

	private nodes$: BehaviorSubject<{ [s: string]: NodeModel }>;
	private links$: BehaviorSubject<{ [s: string]: LinkModel }>;
	private action$: BehaviorSubject<BaseAction> = new BehaviorSubject(null);
	private offsetX$: Observable<number>;
	private offsetY$: Observable<number>;
	private zoomLevel$: Observable<number>;

	private mouseUpListener = () => {};
	private mouseMoveListener = () => {};

	constructor(private renderer: Renderer2) {}

	ngOnInit() {
		if (this.diagramModel) {
			this.diagramModel.getDiagramEngine().setCanvas(this.canvas.nativeElement);

			this.nodes$ = this.diagramModel.selectNodes();
			this.links$ = this.diagramModel.selectLinks();
			this.offsetX$ = this.diagramModel.getOffsetX().pipe(share());
			this.offsetY$ = this.diagramModel.getOffsetY().pipe(share());
			this.zoomLevel$ = this.diagramModel.getZoomLevel().pipe(share());

			this.nodes$.subscribe(nodes => {
				Object.values(nodes).forEach(node => {
					if (!node.painted) {
						this.diagramModel.getDiagramEngine().generateWidgetForNode(node, this.nodesLayer);
						node.painted = true;
					}
				});
			});

			this.links$.subscribe(links => {
				Object.values(links).forEach(link => {
					console.log(link);
					if (!link.painted) {
						this.diagramModel.getDiagramEngine().generateWidgetForLink(link, this.linksLayer);
						link.painted = true;
					}
				});
			});
		}
	}

	/**
	 * fire the action registered and notify subscribers
	 */
	fireAction() {
		if (this.action$.value) {
			this.actionStillFiring.emit(this.action$.value);
		}
	}

	/**
	 * Unregister the action, post firing and notify subscribers
	 */
	stopFiringAction(shouldSkipEvent?: boolean) {
		if (!shouldSkipEvent) {
			this.actionStoppedFiring.emit(this.action$.value);
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
		this.action$.next(null);
	};

	onMouseMove = (event: MouseEvent) => {
		const action = this.action$.value;

		if (action === null || action === undefined) {
			return;
		}

		if (action instanceof MoveCanvasAction) {
			if (this.allowCanvasTranslation) {
				this.diagramModel.setOffset(
					action.initialOffsetX + (event.clientX - action.mouseX),
					action.initialOffsetY + (event.clientY - action.mouseY)
				);
				this.fireAction();
			}
		}
	};

	getMouseElement(event: MouseEvent): { model: BaseModel; element: Element } {
		const target = event.target as Element;

		// is it a port?
		let element = target.closest('[data-portid]');
		if (element) {
			// get the relevant node and return the port.
			const nodeEl = target.closest('[data-nodeid]');
			return {
				model: this.diagramModel.getNode(nodeEl.getAttribute('data-nodeid')).getPort(element.getAttribute('data-portid')),
				element
			};
		}

		// look for a point
		element = target.closest('[data-pointid]');
		if (element) {
			return {
				model: this.diagramModel.getLink(element.getAttribute('data-linkid')).getPointModel(element.getAttribute('data-pointid')),
				element
			};
		}

		// look for a link
		element = target.closest('[data-linkid]');
		if (element) {
			return {
				model: this.diagramModel.getLink(element.getAttribute('data-linkid')),
				element
			};
		}

		// a node maybe
		element = target.closest('[data-nodeid]');
		if (element) {
			return {
				model: this.diagramModel.getNode(element.getAttribute('data-nodeid')),
				element
			};
		}

		// just the canvas
		return null;
	}

	onMouseDown(event: MouseEvent) {
		if (event.button === 3) {
			return;
		}
		// TODO: handle selections
		// https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L479-L536

		const selectedModel = this.getMouseElement(event);

		// canvas selected
		if (selectedModel === null) {
			// multiple selection
			if (event.shiftKey) {
				// initiate multiple selection selector
			} else {
				this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, this.diagramModel));
			}
		} else {
			// console.log(selectedModel);
		}

		// create mouseMove and mouseUp listeners
		this.mouseMoveListener = this.renderer.listen(document, 'mousemove', this.onMouseMove);
		this.mouseUpListener = this.renderer.listen(document, 'mouseup', this.onMouseUp);
	}

	onMouseWheel(event: WheelEvent) {
		if (this.allowCanvasZoon) {
			event.preventDefault();
			event.stopPropagation();
			const currentZoomLevel = this.diagramModel.getZoomLevel().getValue();
			const oldZoomFactor = currentZoomLevel / 100;
			let scrollDelta = this.inverseZoom ? -event.deltaY : event.deltaY;
			// check if it is pinch gesture
			if (event.ctrlKey && scrollDelta % 1 !== 0) {
				/* Chrome and Firefox sends wheel event with deltaY that
				   have fractional part, also `ctrlKey` prop of the event is true
				   though ctrl isn't pressed
				*/
				scrollDelta /= 3;
			} else {
				scrollDelta /= 60;
			}
			if (currentZoomLevel + scrollDelta > 10) {
				this.diagramModel.setZoomLevel(currentZoomLevel + scrollDelta);
			}

			const zoomFactor = this.diagramModel.getZoomLevel().getValue() / 100;

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
			const xFactor = (clientX - this.diagramModel.getOffsetX().getValue()) / oldZoomFactor / clientWidth;
			const yFactor = (clientY - this.diagramModel.getOffsetY().getValue()) / oldZoomFactor / clientHeight;

			this.diagramModel.setOffset(
				this.diagramModel.getOffsetX().getValue() - widthDiff * xFactor,
				this.diagramModel.getOffsetY().getValue() - heightDiff * yFactor
			);

			// TODO: figure out on how to repaint things?
			// diagramEngine.enableRepaintEntities([]);
		}
	}
}
