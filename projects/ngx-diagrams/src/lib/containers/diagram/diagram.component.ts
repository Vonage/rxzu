import {
	Component,
	OnInit,
	Input,
	Renderer2,
	Output,
	EventEmitter,
	ViewChild,
	ViewContainerRef,
	ElementRef,
	AfterViewInit,
	ChangeDetectionStrategy
} from '@angular/core';
import { DiagramModel } from '../../models/diagram.model';
import { NodeModel } from '../../models/node.model';
import { LinkModel } from '../../models/link.model';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { share, filter } from 'rxjs/operators';
import { BaseAction, MoveCanvasAction, SelectingAction } from '../../actions';
import { BaseModel } from '../../models/base.model';
import { MoveItemsAction } from '../../actions/move-items.action';
import { PointModel } from '../../models/point.model';

@Component({
	selector: 'ngdx-diagram',
	templateUrl: 'diagram.component.html',
	styleUrls: ['diagram.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxDiagramComponent implements OnInit, AfterViewInit {
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

	private nodes$: Observable<{ [s: string]: NodeModel }>;
	private links$: Observable<{ [s: string]: LinkModel }>;
	private action$: BehaviorSubject<BaseAction> = new BehaviorSubject(null);
	private offsetX$: Observable<number>;
	private offsetY$: Observable<number>;
	private zoomLevel$: Observable<number>;
	private nodesRendered$: BehaviorSubject<boolean>;
	private shouldDrawSelectionBox$: BehaviorSubject<boolean>;

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
			this.nodesRendered$ = new BehaviorSubject(false);

			this.nodes$.subscribe(nodes => {
				this.nodesRendered$.next(false);
				Object.values(nodes).forEach(node => {
					if (!node.painted) {
						this.diagramModel.getDiagramEngine().generateWidgetForNode(node, this.nodesLayer);
						node.painted = true;
					}
				});
				this.nodesRendered$.next(true);
			});
		}
	}

	ngAfterViewInit() {
		combineLatest(this.nodesRendered$, this.links$)
			.pipe(filter(([nodesRendered, _]) => !!nodesRendered))
			.subscribe(([_, links]) => {
				Object.values(links).forEach(link => {
					if (!link.painted) {
						if (link.getSourcePort() !== null) {
							const portCenter = this.diagramModel.getDiagramEngine().getPortCenter(link.getSourcePort());
							link.getPoints()[0].updateLocation(portCenter);

							const portCoords = this.diagramModel.getDiagramEngine().getPortCoords(link.getSourcePort());
							link.getSourcePort().updateCoords(portCoords);
						}

						if (link.getTargetPort() !== null) {
							const portCenter = this.diagramModel.getDiagramEngine().getPortCenter(link.getTargetPort());
							link.getPoints()[link.getPoints().length - 1].updateLocation(portCenter);

							const portCoords = this.diagramModel.getDiagramEngine().getPortCoords(link.getTargetPort());
							link.getTargetPort().updateCoords(portCoords);
						}

						this.diagramModel.getDiagramEngine().generateWidgetForLink(link, this.linksLayer);
						link.painted = true;
					}
				});
			});
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

	shouldDrawSelectionBox() {
		const action = this.action$.getValue();
		if (action instanceof SelectingAction) {
			// get initial dimensions
			action.getBoxDimensions();
			return true;
		}
		return false;
	}

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

	onMouseUp = (event: MouseEvent) => {
		// TODO: handle mouse up events!
		// https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L315-L403

		const action = this.action$.getValue();

		// are we going to connect a link to something?
		if (action instanceof MoveItemsAction) {
			const element = this.getMouseElement(event);
			action.selectionModels.forEach(model => {
				// only care about points connecting to things
				if (!(model.model instanceof PointModel)) {
					return;
				}
			});
		}

		this.mouseUpListener();
		this.mouseMoveListener();
		this.action$.next(null);
	};

	onMouseMove = (event: MouseEvent) => {
		const action = this.action$.value;

		if (action === null || action === undefined) {
			return;
		}

		if (action instanceof SelectingAction) {
			const relative = this.diagramModel.getDiagramEngine().getRelativePoint(event.clientX, event.clientY);

			Object.values(this.diagramModel.getNodes()).forEach(node => {
				if ((action as SelectingAction).containsElement(node.getX(), node.getY(), this.diagramModel)) {
					node.selected = true;
				}
			});

			Object.values(this.diagramModel.getLinks()).forEach(link => {
				let allSelected = true;
				link.getPoints().forEach(point => {
					if ((action as SelectingAction).containsElement(point.getX(), point.getY(), this.diagramModel)) {
						point.selected = true;
					} else {
						allSelected = false;
					}
				});

				if (allSelected) {
					link.selected = true;
				}
			});

			action.mouseX2 = relative.x;
			action.mouseY2 = relative.y;

			this.fireAction();
			this.action$.next(action);
			return;
		}

		if (action instanceof MoveItemsAction) {
			// TODO: handle moving of items around
			// https://github.com/projectstorm/react-diagrams/blob/master/src/widgets/DiagramWidget.tsx#L244-L288
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
				const relative = this.diagramModel.getDiagramEngine().getRelativePoint(event.clientX, event.clientY);
				this.startFiringAction(new SelectingAction(relative.x, relative.y));
			} else {
				// drag canvas action
				this.diagramModel.clearSelection();
				this.startFiringAction(new MoveCanvasAction(event.clientX, event.clientY, this.diagramModel));
			}
		} else {
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
		}
	}
}
