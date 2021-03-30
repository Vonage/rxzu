import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  Optional,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MODEL, LinkModel, DefaultLinkComponent } from '@rxzu/angular';

@Component({
  selector: 'rxzu-gh-workflow-link',
  templateUrl: './gh-workflow-link.component.html',
  styleUrls: ['./gh-workflow-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GHWorkflowLinkComponent extends DefaultLinkComponent {
  @ViewChild('labelLayer', { read: ViewContainerRef, static: true })
  labelLayer!: ViewContainerRef;

  constructor(
    @Optional() @Host() @Inject(MODEL) public model: LinkModel,
    cdRef: ChangeDetectorRef
  ) {
    super(model, cdRef);
  }
}
