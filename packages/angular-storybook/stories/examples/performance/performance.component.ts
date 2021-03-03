import { Component, ViewChild } from '@angular/core';
import { DiagramModel, NodeModel, LabelModel, PortModel, RxZuDiagramComponent } from '@rxzu/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="action-bar">
      <button (click)="resetDiagram()" *ngIf="isResseted === false">
        Reset</button
      ><button (click)="createDiagram()" *ngIf="isResseted">Recreate</button
      >Rendered {{ numberOfNodes }} nodes and links in
      {{ initialRenderTimer }} ms
    </div>
    <rxzu-diagram class="demo-diagram" [model]="diagramModel"></rxzu-diagram>
  `,
  styleUrls: ['../../demo-diagram.component.scss'],
})
export class PerformanceExampleStoryComponent {
  diagramModel: DiagramModel;
  initialRenderTimer = 0;
  isResseted = false;
  numberOfNodes = 200;
  @ViewChild(RxZuDiagramComponent, { static: true }) diagram?: RxZuDiagramComponent;

  constructor() {
    this.diagramModel = new DiagramModel({ name: 'default' });
    this.createDiagram();
  }

  createDiagram() {
    this.createNodes();
    this.diagram?.zoomToFit();
  }

  resetDiagram() {
    this.diagramModel.reset();
    this.isResseted = true;
  }

  createNodes() {
    this.isResseted = false;
    const startTime = performance.now();
    const nodesDefaultDimensions = { height: 200, width: 200 };

    for (let index = 0; index < this.numberOfNodes; index++) {
      const nodeLoop = new NodeModel({ name: 'default', id: `${index}` });
      const row = index % 10;
      const col = Math.floor(index / 10);
      nodeLoop.setCoords({ x: 1000 * row, y: 300 * col });
      nodeLoop.setDimensions(nodesDefaultDimensions);
      const inPort = new PortModel({ name: 'default', id: `${index}` });
      const outPort = new PortModel({ name: 'default' });
      nodeLoop.addPort(inPort);
      const outport = nodeLoop.addPort(outPort);

      this.diagramModel.addNode(nodeLoop);

      if (index > 0) {
        const prevNode = this.diagramModel.getNode(`${index - 1}`) as NodeModel;
        const prevPort = prevNode.getPort(`${index - 1}`) as PortModel;
        const link = outport.link(prevPort);

        if (link) {
          const label = new LabelModel({ name: 'default', text: 'label' });
          link.setLabel(label);
          this.diagramModel.addLink(link);
        }
      }
    }

    const endTime = performance.now();
    this.initialRenderTimer = endTime - startTime;
  }

  clearGraph() {
    this.diagramModel.reset();
  }
}
