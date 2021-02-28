import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Host,
  Inject,
  OnInit, Optional
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-label',
  templateUrl: './default-label.component.html',
  styleUrls: ['./default-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-labelid]': `model?.id`
  }
})
export class DefaultLabelComponent implements OnInit {
  constructor(
    private cdRef: ChangeDetectorRef,
    @Optional() @Host() @Inject(MODEL) public model: LabelModel
  ) {
    console.log(model);
  }

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model.setPainted(true);
  }
}
