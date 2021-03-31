import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-label',
  templateUrl: './default-label.component.html',
  styleUrls: ['./default-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLabelComponent implements OnInit {
  constructor(
    @Inject(MODEL) public model: LabelModel,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model.setPainted(true);
  }
}
