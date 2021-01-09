import { Component, OnInit } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <div
        *ngFor="let node of nodesLibrary"
        class="node-drag"
        draggable="true"
        [attr.data-type]="node.type"
        (dragstart)="onBlockDrag($event)"
        [ngStyle]="{ 'background-color': node.color }"
      >
        {{ node.type }}
      </div>
      <div></div>
    </div>
    <ngdx-diagram
      class="demo-diagram"
      [model]="diagramModel"
      (drop)="onBlockDropped($event)"
      (dragover)="$event.preventDefault()"
    ></ngdx-diagram>
  `,
  styleUrls: [
    '../demo-diagram.component.scss',
    './drag-and-drop.component.scss',
  ],
})
export class DragAndDropExampleStoryComponent implements OnInit {
  diagramModel: DiagramModel;
  nodesDefaultDimensions = { height: 200, width: 200 };
  nodesLibrary = [
    { color: '#AFF8D8', type: 'greenish' },
    { color: '#FFB5E8', type: 'pinkish' },
    { color: '#85E3FF', type: 'blueish' },
  ];

  constructor(private diagramEngine: DiagramEngine) {}

  ngOnInit() {
    this.diagramEngine.registerDefaultFactories();
    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel({ id: '1' });
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(this.nodesDefaultDimensions);
    node1.addOutPort({ name: 'outport1', id: 'outport1' });
    node1.addOutPort({ name: 'outport2', id: 'outport2' });
    const outport3 = node1.addOutPort({ name: 'outport3', id: 'outport3' });

    const node2 = new DefaultNodeModel();
    node2.setCoords({ x: 1000, y: 0 });
    node2.setDimensions(this.nodesDefaultDimensions);
    const inport = node2.addInPort({ name: 'inport2' });

    for (let index = 0; index < 2; index++) {
      const nodeLoop = new DefaultNodeModel();
      nodeLoop.setCoords({ x: 1000, y: 300 + index * 300 });
      nodeLoop.setDimensions(this.nodesDefaultDimensions);
      nodeLoop.addInPort({ name: `inport${index + 3}` });

      this.diagramModel.addNode(nodeLoop);
    }

    const link = outport3.link(inport);
    link.setLocked();

    this.diagramModel.addAll(node1, node2, link);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }

  createNode(type: string) {
    const nodeData = this.nodesLibrary.find((nodeLib) => nodeLib.type === type);
    const node = new DefaultNodeModel({ color: nodeData.color });

    node.setExtras(nodeData);
    node.setDimensions(this.nodesDefaultDimensions);
    node.addOutPort({ name: 'outport1', id: 'outport1' });
    node.addOutPort({ name: 'outport2', id: 'outport2' });

    return node;
  }

  /**
   * On drag start, assign the desired properties to the dataTransfer
   */
  onBlockDrag(e: DragEvent) {
    const type = (e.target as HTMLElement).getAttribute('data-type');
    e.dataTransfer.setData('type', type);
  }

  /**
   * on block dropped, create new intent with the empty data of the selected block type
   */
  onBlockDropped(e: DragEvent): void | undefined {
    const nodeType = e.dataTransfer.getData('type');
    const node = this.createNode(nodeType);
    const droppedPoint = this.diagramEngine
      .getMouseManager()
      .getRelativePoint(e);

    const coords = {
      x: droppedPoint.x - this.nodesDefaultDimensions.width / 2,
      y: droppedPoint.y - this.nodesDefaultDimensions.height / 2,
    };

    node.setCoords(coords);
    this.diagramModel.addNode(node);
  }
}
