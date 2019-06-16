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
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BaseAction, MoveCanvasAction, SelectingAction } from '../../actions';
import { BaseModel } from '../../models/base.model';
import { MoveItemsAction } from '../../actions/move-items.action';
import { PointModel } from '../../models/point.model';
import { Coords } from '../../interfaces/coords.interface';
import { PortModel } from '../../models/port.model';
import { some } from 'lodash';
import { isNil } from '../../utils/tool-kit.util';

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
	@Input() allowLooseLinks = true;

	@Output() actionStartedFiring: EventEmitter<BaseAction> = new EventEmitter();
	@Output() actionStillFiring: EventEmitter<BaseAction> = new EventEmitter();
	@Output() actionStoppedFiring: EventEmitter<BaseAction> = new EventEmitter();

	@ViewChild('nodesLayer', { read: ViewContainerRef }) nodesLayer: ViewContainerRef;
	@ViewChild('linksLayer', { read: ViewContainerRef }) linksLayer: ViewContainerRef;
	@ViewChild('canvas', { read: ElementRef }) canvas: ElementRef;

	private nodes$: Observable<NodeModel[]>;
	private links$: Observable<LinkModel[]>;
	private transformData$: Observable<string>;
	private action$: BehaviorSubject<BaseAction> = new BehaviorSubject(null);
	private nodesRendered$: BehaviorSubject<boolean>;

	private mouseUpListener = () => {};
	private mouseMoveListener = () => {};

	constructor(private renderer: Renderer2) {}

	ngOnInit() {
		if (this.diagramModel) {
			this.transformData$ = this.diagramModel
				.select(s => ({ offset: s.offset, zoom: s.zoom }))
				.pipe(map(s => `transform: translate(${s.offset.x}px, ${s.offset.y}px) scale((${s.zoom / 100.0})`));
			this.diagramModel.getDiagramEngine().setCanvas(this.canvas.nativeElement);

			this.nodes$ = this.diagramModel.selectNodes();
			this.links$ = this.diagramModel.selectLinks();
			this.nodesRendered$ = new BehaviorSubject(false);
		}
	}

	ngAfterViewInit() {
		this.nodes$.subscribe(nodes => {
			this.nodesRendered$.next(false);
			nodes.forEach(node => {
				if (!node.isPainted()) {
					this.diagramModel.getDiagramEngine().generateWidgetForNode(node, this.nodesLayer);
					node.setPainted();
				}
			});
			this.nodesRendered$.next(true);
		});
		// Paint links, TODO: move to diagramModel.
		combineLatest(this.nodesRendered$, this.links$)
			.pipe(filter(([nodesRendered, _]) => !!nodesRendered))
			.subscribe(([_, links]) => {
				links.forEach(link => {
					if (!link.isPainted()) {
						const sourcePortInfo = link.getSourcePortInfo();
						const targetPortInfo = link.getSourcePortInfo();
						if (sourcePortInfo) {
							const sourcePort = this.diagramModel.getPortsForNodes(sourcePortInfo.parentId, sourcePortInfo.id)[0];
							const portCenter = this.diagramModel.getDiagramEngine().getPortCenter(sourcePort);
							link.getPoints()[0].update({ coords: portCenter });

							const portCoords = this.diagramModel.getDiagramEngine().getPortCoords(sourcePort);
							sourcePort.update({ coords: portCoords });
						}

						if (targetPortInfo) {
							const targetPort = this.diagramModel.getPortsForNodes(targetPortInfo.parentId, targetPortInfo.id)[0];
							const portCenter = this.diagramModel.getDiagramEngine().getPortCenter(targetPort);
							link.getLastPoint().update({ coords: portCenter });

							const portCoords = this.diagramModel.getDiagramEngine().getPortCoords(targetPort);
							targetPort.update({ coords: portCoords });
						}

						this.diagramModel.getDiagramEngine().generateWidgetForLink(link, this.linksLayer);
						link.setPainted();
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

	selectAction() {
		return this.action$;
	}

	shouldDrawSelectionBox() {
		const action = this.action$.getValue();
		if (action instanceof SelectingAction) {
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
				model: this.diagramModel.getNodes(nodeEl.getAttribute('data-nodeid'))[0].getPorts(element.getAttribute('data-portid'))[0],
				element
			};
		}

		// look for a point
		element = target.closest('[data-pointid]');
		if (element) {
			return {
				model: this.diagramModel.getLinks(element.getAttribute('data-linkid'))[0].getPointModel(element.getAttribute('data-pointid')),
				element
			};
		}

		// look for a link
		element = target.closest('[data-linkid]');
		if (element) {
			return {
				model: this.diagramModel.getLinks(element.getAttribute('data-linkid'))[0],
				element
			};
		}

		// a node maybe
		element = target.closest('[data-nodeid]');
		if (element) {
			return {
				model: this.diagramModel.getNodes(element.getAttribute('data-nodeid'))[0],
				element
			};
		}

		// just the canvas
		return null;
	}

	onMouseUp = (event: MouseEvent) => {
		const diagramEngine = this.diagramModel.getDiagramEngine();
		const action = this.action$.getValue();

		// are we going to connect a link to something?
		if (action instanceof MoveItemsAction) {
			const element = this.getMouseElement(event);
			action.selectionModels.forEach(model => {
				// only care about points connecting to things
				if (!(model.model instanceof PointModel)) {
					return;
				}
				if (element && element.model instanceof PortModel && !diagramEngine.isModelLocked(element.model)) {
					const link = this.diagramModel.getLinks(model.model.getLinkId())[0];
					const targetPortInfo = link.getTargetPortInfo();
					const sourcePortInfo = link.getSourcePortInfo();
					if (targetPortInfo) {
						// if this was a valid link already and we are adding a node in the middle, create 2 links from the original
						if (targetPortInfo.id !== element.model.id && sourcePortInfo.id !== element.model.id) {
							const targetPort = this.diagramModel.getPortsForNodes(targetPortInfo.parentId, targetPortInfo.id)[0];
							const newLink = link.clone({});
							newLink.setPorts(element.model, targetPort);
							link.setPorts(element.model);
							newLink.removePointsBefore(newLink.getPoints()[link.getPointIndex(model.model)]);
							link.removePointsAfter(model.model);
							diagramEngine.getDiagramModel().addLink(newLink);
							// if we are connecting to the same targetId or sourceId, destroy tweener points
						} else if (targetPortInfo.id === element.model.id) {
							link.removePointsAfter(model.model);
						} else if (sourcePortInfo.id === element.model.id) {
							link.removePointsBefore(model.model);
						}
					} else {
						link.setPorts(element.model);
					}
					// delete this.props.diagramEngine.linksThatHaveInitiallyRendered[link.getID()];
				}
			});

			// check for / destroy any loose links in any models which have been moved
			if (!this.allowLooseLinks) {
				action.selectionModels.forEach(model => {
					// only care about points connecting to things
					if (!(model.model instanceof PointModel)) {
						return;
					}

					const selectedPoint: PointModel = model.model;
					const link: LinkModel = this.diagramModel.getLinks(selectedPoint.getLinkId())[0];
					if (isNil(link.getSourcePortInfo()) || isNil(link.getTargetPortInfo())) {
						link.destroy();
					}
				});
			}

			// destroy any invalid links
			action.selectionModels.forEach(model => {
				// only care about points connecting to things
				if (!(model.model instanceof PointModel)) {
					return;
				}

				const link: LinkModel = this.diagramModel.getLinks(model.model.getLinkId())[0];
				const sourcePortInfo = link.getSourcePortInfo();
				const targetPortInfo = link.getTargetPortInfo();
				if (!isNil(sourcePortInfo) && !isNil(targetPortInfo)) {
					const sourcePort = this.diagramModel.getPortsForNodes(sourcePortInfo.parentId, sourcePortInfo.id)[0];
					const targetPort = this.diagramModel.getPortsForNodes(targetPortInfo.parentId, targetPortInfo.id)[0];
					if (!sourcePort.canLinkToPort(targetPort)) {
						// link not allowed
						link.destroy();
					} else if (
						some(
							this.diagramModel.getLinks(targetPort.getLinkIds()),
							(l: LinkModel) => l !== link && (l.hasPort(sourcePort, 'out') || l.hasPort(sourcePort, 'in'))
						)
					) {
						// link is a duplicate
						link.destroy();
					}
				}
			});

			this.stopFiringAction();
		} else {
			this.stopFiringAction();
		}

		this.mouseUpListener();
		this.mouseMoveListener();
		this.action$.next(null);
	};

	onMouseMove = (event: MouseEvent) => {
		const action = this.action$.getValue();

		if (action === null || action === undefined) {
			return;
		}

		if (action instanceof SelectingAction) {
			const relative = this.diagramModel.getDiagramEngine().getRelativePoint(event.clientX, event.clientY);

			this.diagramModel.getNodes().forEach(node => {
				if ((action as SelectingAction).containsElement(node.get('coords'), this.diagramModel)) {
					node.setActive();
				} else {
					node.setActive(false);
				}
			});

			this.diagramModel.getLinks().forEach(link => {
				let allSelected = true;
				link.get('points').forEach(point => {
					if ((action as SelectingAction).containsElement(point.get('coords'), this.diagramModel)) {
						point.setActive();
					} else {
						point.setActive(false);
						allSelected = false;
					}
				});

				if (allSelected) {
					link.setActive();
				}
			});

			action.mouseX2 = relative.x;
			action.mouseY2 = relative.y;

			this.fireAction();
			this.action$.next(action);
			return;
		} else if (action instanceof MoveItemsAction) {
			const coords: Coords = {
				x: event.clientX - action.mouseX,
				y: event.clientY - action.mouseY
			};
			const amountZoom = this.diagramModel.get('zoom') / 100;

			action.selectionModels.forEach(model => {
				// in this case we need to also work out the relative grid position
				if (model.model instanceof NodeModel || (model.model instanceof PointModel && !model.model.isConnectedToPort())) {
					const newCoords = { x: model.initialX + coords.x / amountZoom, y: model.initialY + coords.y / amountZoom };
					model.model.update({ coords: this.diagramModel.getGridPosition(newCoords) });

					if (model.model instanceof NodeModel) {
						// update port coordinates as well
						model.model.getPorts().forEach(port => {
							port.update({ coords: this.diagramModel.getDiagramEngine().getPortCoords(port) });
						});
					}
				} else if (model.model instanceof PointModel) {
					// we want points that are connected to ports, to not necessarily snap to grid
					// this stuff needs to be pixel perfect, dont touch it
					const newCoords = this.diagramModel.getGridPosition({ x: coords.x / amountZoom, y: coords.y / amountZoom });
					model.model.update({ coords: { x: model.initialX + newCoords.x, y: model.initialY + newCoords.y } });
				}
			});

			this.fireAction();
		} else if (action instanceof MoveCanvasAction) {
			if (this.allowCanvasTranslation) {
				this.diagramModel.update({
					offset: {
						x: action.initialOffsetX + (event.clientX - action.mouseX),
						y: action.initialOffsetY + (event.clientY - action.mouseY)
					}
				});
				this.fireAction();
			}
		}
	};

	onMouseDown(event: MouseEvent) {
		if (event.button === 3) {
			return;
		}

		this.diagramModel.clearSelection();

		const selectedModel = this.getMouseElement(event);

		// canvas active
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
		} else if (selectedModel.model instanceof PortModel) {
			// its a port element, we want to drag a link
			if (!this.diagramModel.getDiagramEngine().isModelLocked(selectedModel.model)) {
				const relative = this.diagramModel.getDiagramEngine().getRelativeMousePoint(event);
				const sourcePort = selectedModel.model;
				const link = sourcePort.createLinkModel();
				link.setPorts(sourcePort);

				if (link) {
					link.removeMiddlePoints();
					if (!link.getPortIds('out').includes(sourcePort.id)) {
						link.setPorts(sourcePort);
					}
					link.getFirstPoint().update({ coords: relative });
					link.getLastPoint().update({ coords: relative });

					this.diagramModel.clearSelection();
					link.getLastPoint().setActive();
					this.diagramModel.addLink(link);

					this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.diagramModel.getDiagramEngine()));
				}
			} else {
				this.diagramModel.clearSelection();
			}
		} else {
			// its some other element, probably want to move it
			if (!event.shiftKey && !selectedModel.model.isActive()) {
				this.diagramModel.clearSelection();
			}
			selectedModel.model.setActive();

			this.startFiringAction(new MoveItemsAction(event.clientX, event.clientY, this.diagramModel.getDiagramEngine()));
		}

		// create mouseMove and mouseUp listeners
		this.mouseMoveListener = this.renderer.listen(document, 'mousemove', this.onMouseMove);
		this.mouseUpListener = this.renderer.listen(document, 'mouseup', this.onMouseUp);
	}

	onMouseWheel(event: WheelEvent) {
		if (this.allowCanvasZoon) {
			event.preventDefault();
			event.stopPropagation();
			const {
				zoom: currentZoomLevel,
				offset: { x: offsetX, y: offsetY }
			} = this.diagramModel.get();
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
				this.diagramModel.update({ zoom: currentZoomLevel + scrollDelta });
			}

			const zoomFactor = (currentZoomLevel + scrollDelta) / 100;

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
			const xFactor = (clientX - offsetX) / oldZoomFactor / clientWidth;
			const yFactor = (clientY - offsetY) / oldZoomFactor / clientHeight;

			this.diagramModel.update({
				offset: {
					x: offsetX - widthDiff * xFactor,
					y: offsetY - heightDiff * yFactor
				}
			});
		}
	}
}
