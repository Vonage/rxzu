import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  OnInit,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { MODEL } from '../../../../injection.tokens';

@Component({
  selector: 'rxzu-gh-workflow-label',
  templateUrl: './gh-workflow-label.component.html',
  styleUrls: ['./gh-workflow-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GHWorkflowLabelComponent implements OnInit {
  constructor(
    @Host() @Inject(MODEL) public model: LabelModel,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model.setPainted(true);
  }
}
