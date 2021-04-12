import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {
  DiagramModel,
  NodeModel,
  PortModel,
  RxZuDiagramComponent,
} from '@rxzu/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  diagramModel: DiagramModel;
  nodesLibrary = [
    { color: '#AFF8D8', name: 'default' },
    { color: '#FFB5E8', name: 'default' },
    { color: '#85E3FF', name: 'default' },
  ];
  @ViewChild(RxZuDiagramComponent, { static: true })
  diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel();
  }

  ngAfterViewInit() {
    this.diagram?.zoomToFit();
  }

  createNode(type: string) {
    const nodeData = this.nodesLibrary.find((nodeLib) => nodeLib.name === type);
    if (nodeData) {
      const node = new NodeModel();
      const port = new PortModel();
      node.addPort(port);
      node.setExtras(nodeData);

      return node;
    }

    return null;
  }

  /**
   * On drag start, assign the desired properties to the dataTransfer
   */
  onBlockDrag(e: DragEvent) {
    const type = (e.target as HTMLElement).getAttribute('data-type');
    if (e.dataTransfer && type) {
      e.dataTransfer.setData('type', type);
    }
  }

  /**
   * on block dropped, create new intent with the empty data of the selected block type
   */
  onBlockDropped(e: DragEvent): void | undefined {
    if (e.dataTransfer) {
      const nodeType = e.dataTransfer.getData('type');
      const node = this.createNode(nodeType);
      const canvasManager = this.diagram?.diagramEngine.getCanvasManager();
      if (canvasManager) {
        const droppedPoint = canvasManager.getZoomAwareRelativePoint(e);
        const width = node?.getWidth() ?? 1;
        const height = node?.getHeight() ?? 1;
        const coords = {
          x: droppedPoint.x - width / 2,
          y: droppedPoint.y - height / 2,
        };

        if (node) {
          node.setCoords(coords);
          this.diagramModel.addNode(node);
        }
      }
    }
  }
}
