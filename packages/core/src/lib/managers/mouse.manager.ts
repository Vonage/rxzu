import { fromEvent, merge, race } from 'rxjs';
import { tap, take, takeUntil, share } from 'rxjs/operators';
import {
  SelectingAction,
  MoveItemsAction,
  MoveCanvasAction,
  LinkCreatedAction,
  LooseLinkDestroyed,
  InvalidLinkDestroyed,
} from '../actions';
import { DiagramEngine } from '../engine.core';
import { Coords } from '../interfaces';
import { NodeModel, PointModel, PortModel, BaseModel } from '../models';
import { isNil } from '../utils';

export class MouseManager {
  protected engine: DiagramEngine;

  constructor(_diagramEngine: DiagramEngine) {
    this.engine = _diagramEngine;
  }

  getElement(
    event: MouseEvent
  ): { model: BaseModel | undefined; element: Element } | null {
    const target = event.target as Element;

    // is it a port?
    let element = target.closest('[data-portid]');
    const nodeEl = target.closest('[data-nodeid]');
    if (element && nodeEl) {
      // get the relevant node and return the port.
      return {
        model: this.engine
          .getDiagramModel()
          ?.getNode(nodeEl.getAttribute('data-nodeid'))
          ?.getPort(element.getAttribute('data-portid')) as
          | BaseModel
          | undefined,
        element,
      };
    }

    // look for a point
    element = target.closest('[data-pointid]');
    if (element) {
      return {
        model: this.engine
          .getDiagramModel()
          ?.getLink(element.getAttribute('data-linkid'))
          ?.getPointModel(element.getAttribute('data-pointid')) as
          | BaseModel
          | undefined,
        element,
      };
    }

    // look for a link
    element = target.closest('[data-linkid]');
    if (element) {
      return {
        model: this.engine
          .getDiagramModel()
          ?.getLink(element.getAttribute('data-linkid')) as
          | BaseModel
          | undefined,
        element,
      };
    }

    // a node maybe
    element = target.closest('[data-nodeid]');
    if (element) {
      return {
        model: this.engine
          .getDiagramModel()
          ?.getNode(element.getAttribute('data-nodeid')) as
          | BaseModel
          | undefined,
        element,
      };
    }

    // just the canvas
    return null;
  }

  getRelativePoint(event: MouseEvent): { x: number; y: number } {
    const point = this.engine.getRelativePoint(event.clientX, event.clientY);
    return {
      x:
        (point.x - this.engine.getDiagramModel().getOffsetX()) /
        (this.engine.getDiagramModel().getZoomLevel() / 100.0),
      y:
        (point.y - this.engine.getDiagramModel().getOffsetY()) /
        (this.engine.getDiagramModel().getZoomLevel() / 100.0),
    };
  }

  onMouseMove(event: MouseEvent) {
    const action = this.engine.selectAction().getValue()?.action;

    if (action === null || action === undefined) {
      return;
    }

    if (action instanceof SelectingAction) {
      const relative = this.engine.getRelativePoint(
        event.clientX,
        event.clientY
      );

      this.engine
        .getDiagramModel()
        .getNodes()
        .forEach((node) => {
          const nodeRectPoints = this.engine.getNodeRectPoints(node);
          if (nodeRectPoints) {
            if (
              (action as SelectingAction).containsElement(
                nodeRectPoints.topLeft,
                nodeRectPoints.bottomRight,
                this.engine.getDiagramModel()
              )
            ) {
              node.setSelected();
            } else {
              node.setSelected(false);
            }
          }
        });

      this.engine
        .getDiagramModel()
        .getLinks()
        .forEach((link) => {
          let allSelected = true;

          link.getPoints().forEach((point) => {
            const pointPort = point.getParent().getPortForPoint(point);
            const pointCoords = point.getCoords();
            if (
              (action as SelectingAction).containsElement(
                pointCoords,
                pointCoords,
                this.engine.getDiagramModel()
              ) &&
              !pointPort
            ) {
              point.setSelected();
            } else {
              point.setSelected(false);
              allSelected = false;
            }
          });

          if (allSelected) {
            link.setSelected();
          }
        });

      action.mouseX2 = relative.x;
      action.mouseY2 = relative.y;

      this.engine.fireAction();
    } else if (action instanceof MoveItemsAction) {
      const coords: Coords = {
        x: event.clientX - action.mouseX,
        y: event.clientY - action.mouseY,
      };

      const zoomLevel = this.engine.getDiagramModel().getZoomLevel() / 100;
      action.selectionModels.forEach((selectionModel) => {
        // reset all previous magnets if any
        selectionModel.magnet = undefined;

        // in this case we need to also work out the relative grid position
        if (
          selectionModel.model instanceof NodeModel ||
          (selectionModel.model instanceof PointModel &&
            !selectionModel.model.isConnectedToPort())
        ) {
          const newCoords = {
            x: selectionModel.initialX + coords.x / zoomLevel,
            y: selectionModel.initialY + coords.y / zoomLevel,
          };
          const gridRelativeCoords = this.engine
            .getDiagramModel()
            .getGridPosition(newCoords);

          // magnetic inputs handling
          if (
            selectionModel.model instanceof PointModel &&
            !isNil(this.engine.getDiagramModel().getPortMagneticRadius())
          ) {
            // get all ports on canvas, check distances, if smaller then defined radius, magnetize!
            const portsMap = this.engine.getDiagramModel().getAllPorts({
              filter: (p) => p.getMagnetic(),
            });

            for (const port of portsMap.values()) {
              const portCoords = port.getCoords();
              const distance = Math.hypot(
                portCoords.x - newCoords.x,
                portCoords.y - newCoords.y
              );
              if (
                distance <=
                this.engine.getDiagramModel().getPortMagneticRadius()
              ) {
                const portCenter = this.engine.getPortCenter(port);

                if (!portCenter) {
                  return;
                }

                selectionModel.model.setCoords(portCenter);
                selectionModel.magnet = port;
                return;
              }
            }
          }

          selectionModel.model.setCoords(gridRelativeCoords);

          if (selectionModel.model instanceof NodeModel) {
            // update port coordinates as well
            selectionModel.model.getPorts().forEach((port) => {
              const portCoords = this.engine.getPortCoords(port);

              if (!portCoords) {
                return;
              }

              port.updateCoords(portCoords);
            });
          }
        } else if (selectionModel.model instanceof PointModel) {
          // will only run here when trying to create a point on an existing link
          // we want points that are connected to ports, to not necessarily snap to grid
          // this stuff needs to be pixel perfect, dont touch it
          const newCoords = this.engine.getDiagramModel().getGridPosition({
            x: coords.x / zoomLevel,
            y: coords.y / zoomLevel,
          });

          selectionModel.model.setCoords({
            x: selectionModel.initialX + newCoords.x,
            y: selectionModel.initialY + newCoords.y,
          });
        }
      });

      this.engine.fireAction();
    } else if (action instanceof MoveCanvasAction) {
      if (this.engine.getDiagramModel().getAllowCanvasTranslation()) {
        this.engine
          .getDiagramModel()
          .setOffset(
            action.initialOffsetX + (event.clientX - action.mouseX),
            action.initialOffsetY + (event.clientY - action.mouseY)
          );
        this.engine.fireAction();
      }
    }
  }

  onMouseDown(event: MouseEvent) {
    if (event.button === 3) {
      return;
    }

    const selectedModel = this.getElement(event);

    // canvas selected
    if (selectedModel === null) {
      // multiple selection
      if (event.shiftKey) {
        // initiate multiple selection selector
        const relative = this.engine.getRelativePoint(
          event.clientX,
          event.clientY
        );
        const selectionAction = new SelectingAction(relative.x, relative.y);

        this.engine.startFiringAction(selectionAction);
      } else {
        // drag canvas action
        this.engine.getDiagramModel().clearSelection();
        this.engine.startFiringAction(
          new MoveCanvasAction(
            event.clientX,
            event.clientY,
            this.engine.getDiagramModel()
          )
        );
      }
    } else if (selectedModel.model instanceof PortModel) {
      // its a port element, we want to drag a link
      if (
        !selectedModel.model.isLocked() &&
        selectedModel.model.getCanCreateLinks()
      ) {
        const relative = this.getRelativePoint(event);
        const sourcePort = selectedModel.model;
        const link = sourcePort.createLinkModel();

        // if we don't have a link then we have reached the max amount, or we cannot create new ones
        if (link) {
          link.setSourcePort(sourcePort);
          link.removeMiddlePoints();
          if (link.getSourcePort() !== sourcePort) {
            link.setSourcePort(sourcePort);
          }
          link.setTargetPort(null);

          link.getFirstPoint().setCoords(relative);
          link.getLastPoint().setCoords(relative);

          this.engine.getDiagramModel().clearSelection();
          link.getLastPoint().setSelected();
          this.engine.getDiagramModel().addLink(link);
          this.engine.startFiringAction(
            new MoveItemsAction(event.clientX, event.clientY, this.engine)
          );
        }
      } else {
        this.engine.getDiagramModel().clearSelection();
      }
    } else if (
      selectedModel.model instanceof PointModel &&
      selectedModel.model.isConnectedToPort()
    ) {
      this.engine.getDiagramModel().clearSelection();
    } else {
      // its some other element, probably want to move it
      if (!event.shiftKey && !selectedModel.model?.getSelected()) {
        this.engine.getDiagramModel().clearSelection();
      }

      selectedModel.model?.setSelected();

      this.engine.startFiringAction(
        new MoveItemsAction(event.clientX, event.clientY, this.engine)
      );
    }

    this.createMouseListeners();
  }

  onMouseUp(event: MouseEvent) {
    const action = this.engine.selectAction().getValue()?.action;

    // are we going to connect a link to something?
    if (action instanceof MoveItemsAction) {
      const element = this.getElement(event);
      action.selectionModels.forEach((model) => {
        // only care about points connecting to things
        if (!model || !(model.model instanceof PointModel)) {
          return;
        }

        let el: BaseModel | null = null;
        if (model.magnet) {
          el = model.magnet;
        } else if (element && element.model) {
          el = element.model;
        }

        if (el instanceof PortModel && !this.engine.isModelLocked(el)) {
          const link = model.model.getLink();
          if (!isNil(link?.getTargetPort())) {
            // if this was a valid link already and we are adding a node in the middle, create 2 links from the original
            if (link?.getTargetPort() !== el && link?.getSourcePort() !== el) {
              const targetPort = link?.getTargetPort();
              const newLink = link?.clone({});
              newLink?.setSourcePort(el);
              newLink?.setTargetPort(targetPort);
              link?.setTargetPort(el);
              targetPort?.removeLink(link);
              const idx = link?.getPointIndex(model.model);
              !isNil(idx) &&
                newLink?.removePointsBefore(newLink?.getPoints()[idx]);
              link?.removePointsAfter(model.model);
              this.engine.getDiagramModel().addLink(newLink);
              // if we are connecting to the same target or source, destroy tweener points
            } else if (link.getTargetPort() === el) {
              link.removePointsAfter(model.model);
            } else if (link.getSourcePort() === el) {
              link.removePointsBefore(model.model);
            }
          } else {
            link?.setTargetPort(el);
            const targetPort = link?.getTargetPort();
            const srcPort = link?.getSourcePort();

            if (
              targetPort?.id !== srcPort?.id &&
              srcPort?.canLinkToPort(targetPort)
            ) {
              // link is valid, fire the event
              this.engine.startFiringAction(new LinkCreatedAction(link));
            }
          }
        }

        // reset current magent
        model.magnet = undefined;
      });

      // check for / destroy any loose links in any models which have been moved
      if (!this.engine.getDiagramModel().getAllowLooseLinks()) {
        action.selectionModels.forEach((model) => {
          // only care about points connecting to things
          if (!model || !(model.model instanceof PointModel)) {
            return;
          }

          const selectedPoint: PointModel = model.model;
          const link = selectedPoint.getLink();
          if (
            link?.getSourcePort() === null ||
            link?.getTargetPort() === null
          ) {
            link.destroy();
            this.engine.startFiringAction(new LooseLinkDestroyed(link));
          }
        });
      }

      // destroy any invalid links
      action.selectionModels.forEach((model) => {
        // only care about points connecting to things
        if (!model || !(model.model instanceof PointModel)) {
          return;
        }

        const link = model.model.getLink();
        const sourcePort = link?.getSourcePort();
        const targetPort = link?.getTargetPort();

        if (link && sourcePort && targetPort) {
          if (!sourcePort.canLinkToPort(targetPort)) {
            // link not allowed
            link?.destroy();
            this.engine.startFiringAction(new InvalidLinkDestroyed(link));
          } else if (
            targetPort
              .getLinksArray()
              .some(
                (someLink) =>
                  link !== someLink &&
                  (someLink.getSourcePort() === sourcePort ||
                    someLink.getTargetPort() === sourcePort)
              )
          ) {
            // link is a duplicate
            link.destroy();
          }
        }
      });

      this.engine.stopFiringAction();
    } else {
      this.engine.stopFiringAction();
    }
  }

  onMouseWheel(event: WheelEvent) {
    if (!this.engine.getDiagramModel().getAllowCanvasZoom()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const currentZoomLevel = this.engine.getDiagramModel().getZoomLevel();

    const oldZoomFactor = currentZoomLevel / 100;

    let scrollDelta = this.engine.getDiagramModel().getInverseZoom()
      ? -event.deltaY
      : event.deltaY;

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
      const newZoomLvl = currentZoomLevel + scrollDelta;
      this.engine.getDiagramModel().setZoomLevel(newZoomLvl);
    }

    const updatedZoomLvl = this.engine.getDiagramModel().getZoomLevel();
    const zoomFactor = updatedZoomLvl / 100;

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
    const xFactor =
      (clientX - this.engine.getDiagramModel().getOffsetX()) /
      oldZoomFactor /
      clientWidth;
    const yFactor =
      (clientY - this.engine.getDiagramModel().getOffsetY()) /
      oldZoomFactor /
      clientHeight;

    const updatedXOffset =
      this.engine.getDiagramModel().getOffsetX() - widthDiff * xFactor;
    const updatedYOffset =
      this.engine.getDiagramModel().getOffsetY() - heightDiff * yFactor;

    this.engine.getDiagramModel().setOffset(updatedXOffset, updatedYOffset);
  }

  protected createMouseListeners() {
    const mouseUp$ = race([
      fromEvent<MouseEvent>(document, 'mouseup'),
      fromEvent<MouseEvent>(document, 'contextmenu'),
    ]).pipe(
      tap((e) => this.onMouseUp(e)),
      share(),
      take(1)
    );

    const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
      tap((e) => this.onMouseMove(e)),
      takeUntil(mouseUp$)
    );

    merge(mouseMove$, mouseUp$)
      .pipe(takeUntil(this.engine.getDiagramModel().onEntityDestroy()))
      .subscribe();
  }
}
