import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DiagramEngine } from '@rxzu/angular';
import { DiagramModel, DefaultNodeModel } from '@rxzu/core';
import { CustomPortFactory } from './custom.factory';

@Component({
  selector: 'app-root',
  template: `<ngdx-diagram
    class="demo-diagram"
    [model]="diagramModel"
  ></ngdx-diagram>`,
  styleUrls: ['../demo-diagram.component.scss'],
})
export class CustomPortDiagramComponent implements OnInit {
  diagramModel: DiagramModel;

  constructor(
    private diagramEngine: DiagramEngine,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const nodesDefaultDimensions = { height: 200, width: 200 };
    this.diagramEngine.registerDefaultFactories();
    this.diagramEngine.getFactoriesManager().registerFactory({
      type: 'portFactories',
      factory: new CustomPortFactory(this.resolver, this.renderer),
    });

    this.diagramModel = this.diagramEngine.createModel();

    const node1 = new DefaultNodeModel({});
    node1.setCoords({ x: 500, y: 300 });
    node1.setDimensions(nodesDefaultDimensions);
    node1.addInPort({ name: 'inport', type: 'custom-port' });

    this.diagramModel.addAll(node1);

    this.diagramModel.getDiagramEngine().zoomToFit();
  }
}
