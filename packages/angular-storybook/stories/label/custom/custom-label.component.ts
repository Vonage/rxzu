import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Host,
  Inject,
  OnInit, Optional
} from '@angular/core';
import { MODEL, LabelModel } from '@rxzu/angular';

@Component({
  selector: 'custom-label',
  templateUrl: './custom-label.component.html',
  styleUrls: ['./custom-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomLabelComponent implements OnInit {
  constructor(
    @Inject(MODEL) @Host() @Optional() public model: LabelModel,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model.setPainted(true);
  }
}
