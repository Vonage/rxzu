import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Host, HostBinding,
  Inject,
  OnInit, Optional
} from '@angular/core';
import { ID, LabelModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-label',
  templateUrl: './default-label.component.html',
  styleUrls: ['./default-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultLabelComponent implements OnInit {
  @HostBinding('attr.data-labelid') get labelId(): ID | undefined {
    return this.model?.id;
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    @Optional() @Host() @Inject(MODEL) public model: LabelModel
  ) {}

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model.setPainted(true);
  }
}
