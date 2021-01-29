import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractAngularFactory,
  DiagramEngine,
  DiagramModel,
  NodeModel,
} from '@rxzu/angular';
import { CustomNodeFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<rxzu-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></rxzu-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomNodeDiagramComponent implements OnInit, OnChanges {
  diagramModel: DiagramModel;
  @Input() nodeHeight = 200;
  @Input() nodeWidth = 200;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine.getFactoriesManager().registerFactory({
      type: 'nodeFactories',
      factory: new CustomNodeFactory(
        this.resolver,
        this.renderer
      ) as AbstractAngularFactory,
    });

    this.diagramModel = this.diagramEngine.createModel();
  }

  ngOnInit() {
    const nodesDefaultDimensions = {
      height: this.nodeHeight,
      width: this.nodeWidth,
    };

    const node1 = new NodeModel({
      type: 'custom-node',
      coords: { x: 500, y: 300 },
      dimensions: nodesDefaultDimensions,
    });

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
