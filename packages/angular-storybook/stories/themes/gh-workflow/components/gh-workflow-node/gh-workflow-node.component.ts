import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  IterableDiffers,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  DefaultNodeComponent,
  EngineService,
  MODEL,
  RxZuDiagramComponent,
} from '@rxzu/angular';
import { GHNodeModel } from '../../models';

@Component({
  selector: 'rxzu-gh-workflow-node',
  templateUrl: './gh-workflow-node.component.html',
  styleUrls: ['./gh-workflow-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GHWorkflowNodeComponent
  extends DefaultNodeComponent
  implements OnInit {
  @ViewChild('portsLayer', { read: ViewContainerRef, static: true })
  portsLayer!: ViewContainerRef;

  constructor(
    @Inject(MODEL) public model: GHNodeModel,
    engine: EngineService,
    diagram: RxZuDiagramComponent,
    iterableDiffers: IterableDiffers
  ) {
    super(model, engine, diagram, iterableDiffers);
  }
}
