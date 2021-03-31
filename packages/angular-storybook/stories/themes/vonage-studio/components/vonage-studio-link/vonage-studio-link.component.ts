import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  MODEL,
  LinkModel,
  DefaultLinkComponent,
  LabelModel,
} from '@rxzu/angular';

@Component({
  selector: 'rxzu-vonage-studio-link',
  templateUrl: './vonage-studio-link.component.html',
  styleUrls: ['./vonage-studio-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VStudioLinkComponent extends DefaultLinkComponent {
  @ViewChild('labelLayer', { read: ViewContainerRef, static: true })
  labelLayer!: ViewContainerRef;

  constructor(
    @Inject(MODEL) public model: LinkModel,
    cdRef: ChangeDetectorRef
  ) {
    super(model, cdRef);
    this.model.setLabel(new LabelModel({ namespace: 'vstudio' }));
  }
}
