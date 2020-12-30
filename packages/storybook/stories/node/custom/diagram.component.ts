import { Component, ComponentFactoryResolver, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';
import { CustomNodeFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<ngdx-diagram class="demo-diagram" [model]="diagramModel"></ngdx-diagram>`,
  styleUrls: ['../demo-diagram.component.scss']
})
export class CustomNodeDiagramComponent implements OnInit, OnChanges {
  diagramModel: DiagramModel;
  @Input() nodeHeight = 200;
  @Input() nodeWidth = 200;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const nodesDefaultDimensions = {
      height: this.nodeHeight,
      width: this.nodeWidth
    };
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine
      .getFactoriesManager()
      .registerFactory({ type: 'nodeFactories', factory: new CustomNodeFactory(this.resolver, this.renderer) });

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel({ type: 'custom-node' });
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);

    this.diagramModel.addAll(node1);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }

  ngOnChanges(e: SimpleChanges) {
    if (this.diagramModel) {
      if (e.nodeHeight) {
        Object.values(this.diagramModel.getNodes()).forEach((node) => {
          node.setHeight(e.nodeHeight.currentValue);
        });
      }

      if (e.nodeWidth) {
        Object.values(this.diagramModel.getNodes()).forEach((node) => {
          node.setWidth(e.nodeWidth.currentValue);
        });
      }
    }
  }
}
